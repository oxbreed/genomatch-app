#!/usr/bin/env python3
"""Unify Discover header with GenoDiscoverHeader (Matches/Messages style)."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

if "GenoDiscoverHeader" in text:
    print("Already patched", PATH)
    raise SystemExit(0)

old_import = "import { DiscoverSeenAllState } from '../src/components/discover';"
new_import = """import { DiscoverSeenAllState, GenoDiscoverHeader } from '../src/components/discover';"""
if old_import in text:
    text = text.replace(old_import, new_import)

old_header = """        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Discover</Text>
            <Pressable
              style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
              onPress={() => setShowFilterSheet(true)}
              accessibilityLabel="Filter discovery profiles"
            >
              <Ionicons name="options-outline" size={24} color={COLORS.forest} />
              {filtersActive ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {countActiveDiscoveryFilters(filters)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>
            {usingMockFallback
              ? 'Preview profiles — real matches appear as members join'
              : 'Genotype-aware matches near you'}
          </Text>
        </View>"""

new_header = """        <GenoDiscoverHeader
          subtitle={
            usingMockFallback
              ? 'Preview profiles — real matches appear as members join'
              : 'Genotype-aware matches near you'
          }
          right={
            <Pressable
              style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
              onPress={() => setShowFilterSheet(true)}
              accessibilityLabel="Filter discovery profiles"
            >
              <Ionicons name="options-outline" size={22} color={COLORS.forestDeep} />
              {filtersActive ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {countActiveDiscoveryFilters(filters)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          }
        />"""

if old_header in text:
    text = text.replace(old_header, new_header)
    PATH.write_text(text)
    print("Patched header in", PATH)
else:
    print("Header block not found — manual check needed")
