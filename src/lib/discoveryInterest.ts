/** Discovery preference values stored in profiles.interested_in */
export const DISCOVERY_INTEREST_OPTIONS = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'everyone', label: 'Everyone' },
  { id: 'beyond_binary', label: 'Beyond binary' },
] as const;

export type DiscoveryInterest = (typeof DISCOVERY_INTEREST_OPTIONS)[number]['id'];

const INTEREST_ORDER: DiscoveryInterest[] = ['women', 'men', 'everyone', 'beyond_binary'];

const VALID_INTERESTS = new Set<string>(INTEREST_ORDER);

export function orderDiscoveryInterests(selected: readonly string[]): DiscoveryInterest[] {
  return INTEREST_ORDER.filter((id) => selected.includes(id));
}

export function parseDiscoveryInterests(value: unknown): DiscoveryInterest[] {
  if (!Array.isArray(value)) return [];
  return orderDiscoveryInterests(
    value.filter((item): item is DiscoveryInterest => typeof item === 'string' && VALID_INTERESTS.has(item))
  );
}

/** Women/Men/Beyond binary can combine; Everyone is exclusive. */
export function toggleDiscoveryInterest(
  current: DiscoveryInterest[],
  option: DiscoveryInterest
): DiscoveryInterest[] {
  if (option === 'everyone') {
    return current.includes('everyone') ? [] : ['everyone'];
  }

  const withoutEveryone = current.filter((item) => item !== 'everyone');
  if (withoutEveryone.includes(option)) {
    return withoutEveryone.filter((item) => item !== option);
  }

  return orderDiscoveryInterests([...withoutEveryone, option]);
}

export function discoveryInterestLabel(ids: DiscoveryInterest[]): string {
  if (!ids.length) return '';
  return ids
    .map((id) => DISCOVERY_INTEREST_OPTIONS.find((opt) => opt.id === id)?.label ?? id)
    .join(', ');
}
