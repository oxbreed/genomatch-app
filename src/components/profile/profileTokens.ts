import { INBOX } from '../inbox/inboxTokens';
import { FONT_FAMILY } from '../../theme';

/** Profile typography scale & layout rhythm */
export const PROFILE = {
  heroNameSize: 30,
  sectionLabelSize: 11,
  sectionTitleSize: 18,
  bodySize: 15,
  bodyLineHeight: 23,
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

/** Shared text styles — Gotham Rounded primary stack */
export const PROFILE_TYPE = {
  heroName: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: PROFILE.heroNameSize,
    letterSpacing: -0.5,
  },
  heroMeta: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  sectionKicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: PROFILE.metaSize,
    lineHeight: 17,
  },
  blockLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  chip: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: PROFILE.chipSize,
  },
  goal: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 16,
    letterSpacing: -0.15,
  },
  statValue: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: PROFILE.statValueSize,
    letterSpacing: -0.35,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: PROFILE.metaSize,
    letterSpacing: 0.1,
  },
  ctaTitle: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 17,
    letterSpacing: -0.25,
  },
  ctaSub: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  ribbonTitle: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  ribbonSub: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  footerLink: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: PROFILE.bodySize,
  },
  footerAction: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: PROFILE.bodySize,
  },
} as const;
