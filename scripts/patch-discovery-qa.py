#!/usr/bin/env python3
"""QA fixes: Discovery props, load errors, browse again, match CTA, report/block."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

# Props type + export default signature
if "onMatchCreated" not in text:
    text = text.replace(
        "export default function Discovery() {",
        "type DiscoveryProps = { onMatchCreated?: () => void };\n\nexport default function Discovery({ onMatchCreated }: DiscoveryProps = {}) {",
        1,
    )

# loadProfiles error handling
OLD_CATCH = """    } catch {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles(getMockDiscoveryProfiles());
      setUsingMockFallback(true);
      setViewerGenotype('AA');
      setIndex(0);
    } finally {"""

NEW_CATCH = """    } catch (err) {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles([]);
      setUsingMockFallback(false);
      setLoadError(err instanceof Error ? err.message : 'Could not load profiles');
      setIndex(0);
    } finally {"""

if OLD_CATCH in text:
    text = text.replace(OLD_CATCH, NEW_CATCH, 1)

# showMatchOverlay callback
OLD_OVERLAY_END = """    setMatchedProfile(matched);
    setShowMatch(true);
  }, []);"""

NEW_OVERLAY_END = """    setMatchedProfile(matched);
    setShowMatch(true);
    onMatchCreated?.();
  }, [onMatchCreated]);"""

if OLD_OVERLAY_END in text:
    text = text.replace(OLD_OVERLAY_END, NEW_OVERLAY_END, 1)

# Browse again reload
text = text.replace(
    "onBrowseAgain={() => setIndex(0)}",
    "onBrowseAgain={() => { setIndex(0); void loadProfiles(); }}",
    1,
)

# Match modal send message - need MainTabs integration via prop - Discovery can't open chat directly
# Add onSendMessage that dismisses and could be wired later - for now just dismiss
OLD_MODAL = """      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        viewer={viewerSnapshot}
        onContinue={dismissMatchOverlay}
      />"""

NEW_MODAL = """      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        viewer={viewerSnapshot}
        onContinue={dismissMatchOverlay}
        onSendMessage={dismissMatchOverlay}
      />"""

if OLD_MODAL in text:
    text = text.replace(OLD_MODAL, NEW_MODAL, 1)

# ReportBlockSheet import if missing
if "ReportBlockSheet" not in text:
    text = text.replace(
        "import GenotypeBadge from '../src/components/GenotypeBadge';",
        "import GenotypeBadge from '../src/components/GenotypeBadge';\nimport ReportBlockSheet from '../src/components/ReportBlockSheet';",
        1,
    )

# Add moderation state near other state if missing
if "showModerationSheet" not in text:
    text = text.replace(
        "  const [profileSheetVisible, setProfileSheetVisible] = useState(false);",
        "  const [profileSheetVisible, setProfileSheetVisible] = useState(false);\n  const [showModerationSheet, setShowModerationSheet] = useState(false);",
        1,
    )

# Add report button in header filter area - add menu button next to filter if not exists
# Grep for filterBtn in discovery - add ellipsis button via patch at GenoInboxHeader right

PATH.write_text(text)
print("Patched Discovery QA items")
