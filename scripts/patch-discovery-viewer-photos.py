#!/usr/bin/env python3
"""Load viewer profile snapshot for match modal photos."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

if "viewerSnapshot" in text:
    print("Already patched")
    raise SystemExit(0)

IMPORT_ANCHOR = "import { fetchDiscoveryProfiles } from '../src/lib/profiles';"
NEW_IMPORT = """import {
  fetchDiscoveryProfiles,
  getViewerProfileSnapshot,
  type ViewerProfileSnapshot,
} from '../src/lib/profiles';"""

if IMPORT_ANCHOR not in text:
    raise SystemExit("Import anchor not found")
text = text.replace(IMPORT_ANCHOR, NEW_IMPORT, 1)

STATE_ANCHOR = "  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);"
NEW_STATE = """  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);
  const [viewerSnapshot, setViewerSnapshot] = useState<ViewerProfileSnapshot | null>(null);"""
text = text.replace(STATE_ANCHOR, NEW_STATE, 1)

OLD_LOAD = """  const loadProfiles = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const { profiles: rows, viewerGenotype: loadedViewerGenotype } = await fetchDiscoveryProfiles();
      setViewerGenotype(loadedViewerGenotype);
      if (rows.length > 0) {
        setAllProfiles(rows);
        setUsingMockFallback(false);
      } else {
        setAllProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
        setViewerGenotype('AA');
      }
      setIndex(0);
    } catch {
      setAllProfiles(getMockDiscoveryProfiles());
      setUsingMockFallback(true);
      setViewerGenotype('AA');
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);"""

NEW_LOAD = """  const loadProfiles = useCallback(async () => {
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
      } else {
        setAllProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
        if (!loadedViewerGenotype) setViewerGenotype('AA');
      }
      setIndex(0);
    } catch {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles(getMockDiscoveryProfiles());
      setUsingMockFallback(true);
      setViewerGenotype('AA');
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);"""

if OLD_LOAD not in text:
    raise SystemExit("loadProfiles block not found")
text = text.replace(OLD_LOAD, NEW_LOAD, 1)

MODAL_ANCHOR = """      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        onContinue={dismissMatchOverlay}
      />"""

NEW_MODAL = """      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        viewer={viewerSnapshot}
        onContinue={dismissMatchOverlay}
      />"""

if MODAL_ANCHOR not in text:
    raise SystemExit("Modal block not found")
text = text.replace(MODAL_ANCHOR, NEW_MODAL, 1)

PATH.write_text(text)
print("Patched Discovery viewer snapshot")
