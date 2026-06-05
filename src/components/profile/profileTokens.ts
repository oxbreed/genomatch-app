import { INBOX } from '../inbox/inboxTokens';

/** Profile typography aligned with Matches / Messages */
export const PROFILE = {
  sectionLabelSize: 11,
  sectionTitleSize: INBOX.nameSize,
  bodySize: 15,
  metaSize: INBOX.metaSize,
  headerTitleSize: INBOX.headerTitleSize,
  headerSubtitleSize: INBOX.headerSubtitleSize,
} as const;
