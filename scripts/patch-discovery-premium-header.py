#!/usr/bin/env python3
"""Add GenoPremiumChrome + GenoInboxHeader to Discovery.tsx on disk."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

IMPORT_BLOCK = """import { DiscoverSeenAllState } from '../src/components/discover';
import GenotypeBadge from '../src/components/GenotypeBadge';"""

NEW_IMPORT = """import { DiscoverSeenAllState } from '../src/components/discover';
import { GenoInboxHeader, GenoInboxIconButton } from '../src/components/inbox';
import { GenoPremiumChrome } from '../src/brand/graphics';
import GenotypeBadge from '../src/components/GenotypeBadge';"""

OLD_RETURN = """  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.screenRoot}>"""

NEW_RETURN = """  const discoverSubtitle = usingMockFallback
    ? 'Preview profiles — real matches appear as members join'
    : 'Genotype-aware matches near you';

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="dark" />

      <View style={styles.screenRoot}>"""

OLD_HEADER = """        <View style={styles.header}>
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

NEW_HEADER = """        <GenoInboxHeader
          title="Discover"
          subtitle={discoverSubtitle}
          ceremonyMark
          right={
            <View>
              <GenoInboxIconButton
                icon="options-outline"
                onPress={() => setShowFilterSheet(true)}
                accessibilityLabel="Filter discovery profiles"
              />
              {filtersActive ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {countActiveDiscoveryFilters(filters)}
                  </Text>
                </View>
              ) : null}
            </View>
          }
        />"""

if IMPORT_BLOCK not in text:
    raise SystemExit("Import anchor not found")
if OLD_RETURN not in text:
    raise SystemExit("Return anchor not found")
if OLD_HEADER not in text:
    raise SystemExit("Header anchor not found")

text = text.replace(IMPORT_BLOCK, NEW_IMPORT, 1)
text = text.replace(OLD_RETURN, NEW_RETURN, 1)
text = text.replace(OLD_HEADER, NEW_HEADER, 1)
PATH.write_text(text)
print("Patched Discovery.tsx — premium chrome + inbox header")
