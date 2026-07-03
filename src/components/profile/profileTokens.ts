import { INBOX } from '../inbox/inboxTokens';
import { TYPOGRAPHY } from '../../theme';

/** Profile typography scale & layout rhythm */
export const PROFILE = {
  heroNameSize: 30,
  sectionLabelSize: 11,
  sectionTitleSize: 18,
  bodySize: 15,
  bodyLineHeight: 24,
  chipSize: 13,
  metaSize: 12,
  captionSize: 13,
  statValueSize: 22,
  headerTitleSize: INBOX.headerTitleSize,
  headerSubtitleSize: INBOX.headerSubtitleSize,
  cardPadding: 18,
  sectionGap: 22,
  cardGap: 8,
} as const;

/** Shared text styles — Playfair + Satoshi pairing */
export const PROFILE_TYPE = {
  heroName: {
    ...TYPOGRAPHY.displayName,
    fontSize: PROFILE.heroNameSize,
  },
  heroMeta: {
    ...TYPOGRAPHY.profileMeta,
  },
  sectionKicker: {
    ...TYPOGRAPHY.sectionLabel,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.serifTitle,
    fontSize: PROFILE.sectionTitleSize,
  },
  sectionHint: {
    ...TYPOGRAPHY.caption,
    fontSize: PROFILE.metaSize,
    lineHeight: 17,
  },
  blockLabel: {
    ...TYPOGRAPHY.sectionLabelGold,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1,
  },
  body: {
    ...TYPOGRAPHY.body,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  bodyMedium: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  chip: {
    ...TYPOGRAPHY.chip,
    fontSize: PROFILE.chipSize,
  },
  goal: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 16,
    letterSpacing: -0.15,
  },
  statValue: {
    ...TYPOGRAPHY.displayName,
    fontSize: PROFILE.statValueSize,
    letterSpacing: -0.35,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: PROFILE.metaSize,
    letterSpacing: 0.1,
  },
  ctaTitle: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 17,
    letterSpacing: -0.25,
  },
  ctaSub: {
    ...TYPOGRAPHY.body,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  ribbonTitle: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  ribbonSub: {
    ...TYPOGRAPHY.body,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  footerLink: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: PROFILE.bodySize,
  },
  footerAction: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: PROFILE.bodySize,
  },
} as const;
