import { INBOX } from '../components/inbox/inboxTokens';

/** Shared layout rhythm — profile, inbox, discover, match detail */
export const SCENE = {
  screenPadH: INBOX.cardMarginH,
  headerPadH: 16,
  headerPadTop: 56,
  sectionGap: 12,
  stackGap: 10,
  kickerLetterSpacing: 2,
  titleLetterSpacing: -0.5,
  nameLetterSpacing: -0.2,
  bodyLineHeight: 22,
} as const;
