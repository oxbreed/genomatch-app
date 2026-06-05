#!/usr/bin/env python3
"""Patch Discovery.tsx: shared filters, seen-all state, filter preview."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

# 1) Imports — FilterSheet exports + DiscoverSeenAllState
old_import = """import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';"""

new_import = """import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';
import { DiscoverSeenAllState } from '../src/components/discover';"""

if old_import in text and "DiscoverSeenAllState" not in text:
    text = text.replace(old_import, new_import)

# 2) Remove inline applyDiscoveryFilters (use shared)
start = text.find("function applyDiscoveryFilters(")
if start != -1 and "from '../src/components/FilterSheet'" in text:
    end = text.find("\nfunction getMatchLabel", start)
    if end != -1:
        text = text[:start] + text[end + 1 :]

# 3) Filter badge count
text = text.replace(
    "{filtersActive ? <View style={styles.filterDot} /> : null}",
    "{filtersActive ? (\n                <View style={styles.filterBadge}>\n                  <Text style={styles.filterBadgeText}>\n                    {countActiveDiscoveryFilters(filters)}\n                  </Text>\n                </View>\n              ) : null}",
)

# 4) FilterSheet previewCount
text = text.replace(
    """        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />""",
    """        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          previewProfiles={allProfiles}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />""",
)

# 5) Seen-all state
seen_old = """          ) : seenAll ? (
            <View style={styles.emptyState}>
              <EmptyState
                type="seen-all"
                title="You've seen everyone nearby"
                subtitle="Check back tomorrow for new matches."
              />
            </View>
          ) : ("""

seen_new = """          ) : seenAll ? (
            <DiscoverSeenAllState
              reviewedCount={index}
              onBrowseAgain={() => setIndex(0)}
              onAdjustFilters={() => setShowFilterSheet(true)}
            />
          ) : ("""

if seen_old in text:
    text = text.replace(seen_old, seen_new)

# 6) Add filter badge styles if missing
if "filterBadge:" not in text and "filterDot:" in text:
    text = text.replace(
        "  filterDot: {",
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
  },
  filterBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: COLORS.forestDeep,
  },
  filterDot: {""",
    )

PATH.write_text(text)
print("Patched", PATH)
