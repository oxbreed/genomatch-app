-- Tighter coarse km bands for practical local matching (50 km / 150 km).

create or replace function public.coarse_distance_band(
  viewer_lat numeric,
  viewer_lng numeric,
  target_lat numeric,
  target_lng numeric,
  viewer_city_key text,
  target_city_key text
)
returns text
language sql
immutable
as $$
  select case
    when viewer_city_key is not null
      and target_city_key is not null
      and viewer_city_key = target_city_key
      then 'same_city'
    when viewer_lat is null or viewer_lng is null or target_lat is null or target_lng is null
      then 'unknown'
    when public.haversine_km(viewer_lat, viewer_lng, target_lat, target_lng) <= 50
      then 'nearby'
    when public.haversine_km(viewer_lat, viewer_lng, target_lat, target_lng) <= 150
      then 'regional'
    else 'distant'
  end;
$$;

notify pgrst, 'reload schema';
