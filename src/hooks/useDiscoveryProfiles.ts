import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getMockDiscoveryProfiles } from '../data/mockData';
import {
  fetchDiscoveryProfiles,
  getViewerProfileSnapshot,
  type ViewerProfileSnapshot,
} from '../lib/profiles';
import type { DiscoveryProfile, Genotype } from '../types/database';

type UseDiscoveryProfilesResult = {
  allProfiles: DiscoveryProfile[];
  setAllProfiles: Dispatch<SetStateAction<DiscoveryProfile[]>>;
  loading: boolean;
  loadError: string;
  usingMockFallback: boolean;
  viewerGenotype: Genotype | null;
  viewerSnapshot: ViewerProfileSnapshot | null;
  loadProfiles: () => Promise<void>;
};

/** Loads discovery deck data — mock fallback is dev-only. */
export function useDiscoveryProfiles(onLoaded?: () => void): UseDiscoveryProfilesResult {
  const [allProfiles, setAllProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
  const [viewerSnapshot, setViewerSnapshot] = useState<ViewerProfileSnapshot | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [{ profiles: rows, viewerGenotype: loadedViewerGenotype }, viewer] = await Promise.all([
        fetchDiscoveryProfiles(),
        getViewerProfileSnapshot(),
      ]);
      setViewerGenotype(loadedViewerGenotype);
      setViewerSnapshot(viewer);
      if (rows.length > 0) {
        setAllProfiles(rows);
        setUsingMockFallback(false);
      } else if (__DEV__) {
        setAllProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
        if (!loadedViewerGenotype) setViewerGenotype('AA');
      } else {
        setAllProfiles([]);
        setUsingMockFallback(false);
      }
      onLoaded?.();
    } catch (err) {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles([]);
      setUsingMockFallback(false);
      setLoadError(err instanceof Error ? err.message : 'Could not load profiles');
      onLoaded?.();
    } finally {
      setLoading(false);
    }
  }, [onLoaded]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  return {
    allProfiles,
    setAllProfiles,
    loading,
    loadError,
    usingMockFallback,
    viewerGenotype,
    viewerSnapshot,
    loadProfiles,
  };
}
