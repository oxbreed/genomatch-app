import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function cloudinaryPublicIdFromUrl(url: string): string | null {
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx < 0) return null;

  let rest = url.slice(idx + marker.length);
  rest = rest.replace(/^v\d+\//, '');
  return rest.replace(/\.[^/.]+$/, '');
}

async function cloudinarySignature(secret: string, params: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(params));
  return Array.from(new Uint8Array(sig))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[delete-account] Cloudinary credentials missing — skipping photo cleanup');
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = await cloudinarySignature(
    apiSecret,
    `public_id=${publicId}&timestamp=${timestamp}`
  );

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    const payload = await response.text();
    console.warn('[delete-account] Cloudinary destroy failed', { publicId, payload });
  }
}

async function deleteProfilePhotos(avatarUrl: string | null, photos: string[] | null): Promise<void> {
  const urls = new Set<string>();
  if (avatarUrl) urls.add(avatarUrl);
  for (const photo of photos ?? []) {
    if (photo) urls.add(photo);
  }

  const publicIds = [...urls]
    .map((url) => cloudinaryPublicIdFromUrl(url))
    .filter((id): id is string => Boolean(id));

  await Promise.all(publicIds.map((publicId) => deleteCloudinaryAsset(publicId)));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Server misconfigured' }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await admin
      .from('profiles')
      .select('avatar_url, photos')
      .eq('id', user.id)
      .maybeSingle();

    await deleteProfilePhotos(profile?.avatar_url ?? null, profile?.photos ?? null);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[delete-account] deleteUser failed', deleteError.message);
      return jsonResponse({ error: deleteError.message }, 500);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Account deletion failed';
    console.error('[delete-account] unexpected error', message);
    return jsonResponse({ error: message }, 500);
  }
});
