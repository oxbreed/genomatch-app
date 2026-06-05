#!/usr/bin/env python3
"""Patch Discovery.tsx on disk — filters export, seen-all premium, chrome."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

# Imports
old_import = """import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';"""
new_import = """import DiscoverChrome from '../src/components/DiscoverChrome';
import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';
import { DiscoverSeenAllState } from '../src/components/discover';"""
if old_import in text and "DiscoverSeenAllState" not in text:
    text = text.replace(old_import, new_import)

# Remove local applyDiscoveryFilters block
start = text.find("function applyDiscoveryFilters(")
if start != -1:
    end = text.find("function getMatchLabel", start)
    if end != -1:
        text = text[:start] + text[end:]

# Remove HIGH_COMPATIBILITY_MIN if only used by removed function — keep if used elsewhere
# Discovery still has HIGH_COMPATIBILITY_MIN at top - can remove duplicate constant from FilterSheet usage in card - grep
if "const HIGH_COMPATIBILITY_MIN = 75" in text:
    text = text.replace("const HIGH_COMPATIBILITY_MIN = 75;\n", "")

# Add DiscoverChrome in screenRoot
needle = "      <View style={styles.screenRoot}>"
if needle in text and "DiscoverChrome" not in text.split(needle)[1][:200]:
    text = text.replace(
        needle,
        needle + "\n        <DiscoverChrome />",
        1,
    )

# Replace seen-all EmptyState
old_seen = """          ) : seenAll ? (
            <View style={styles.emptyState}>
              <EmptyState
                type="seen-all"
                title="You've seen everyone nearby"
                subtitle="Check back tomorrow for new matches."
              />
            </View>
          ) : ("""
new_seen = """          ) : seenAll ? (
            <DiscoverSeenAllState
              reviewedCount={profiles.length}
              onBrowseAgain={() => setIndex(0)}
              onAdjustFilters={() => setShowFilterSheet(true)}
            />
          ) : ("""
if old_seen in text:
    text = text.replace(old_seen, new_seen)

# Filter badge count
old_filter_dot = """              {filtersActive ? <View style={styles.filterDot} /> : null}"""
new_filter_dot = """              {filtersActive ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {countActiveDiscoveryFilters(filters)}
                  </Text>
                </View>
              ) : null}"""
if old_filter_dot in text and "filterBadge" not in text:
    text = text.replace(old_filter_dot, new_filter_dot)

# Add filter badge styles before filterBtn if missing
if "filterBadge:" not in text and "filterBtn:" in text:
    text = text.replace(
        "  filterBtn: {",
        """  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  filterBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: COLORS.forestDeep,
  },
  filterBtn: {""",
        1,
    )

PATH.write_text(text)
print("Patched", PATH)
