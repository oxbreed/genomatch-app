/** Portfolio / mother brand behind GenoMatch and related projects. */
export const OXBREED_PARENT = {
  legalName: 'Oxbreed Management Ltd',
} as const;

/** Legal operator and data controller for the GenoMatch app. */
export const GENOMATCH_COMPANY = {
  legalName: 'Genomatch Ltd Nigeria',
  registration: 'RC No. 9236521',
  jurisdiction: 'Nigeria',
  locationLine: 'Genomatch Ltd Nigeria',
  contactEmail: 'hello@genomatch.app',
  website: 'genomatch.app',
  parentLegalName: OXBREED_PARENT.legalName,
} as const;

export const GENOMATCH_OPERATOR_INTRO = `${GENOMATCH_COMPANY.legalName} (${GENOMATCH_COMPANY.registration}), a product of ${GENOMATCH_COMPANY.parentLegalName}, registered in ${GENOMATCH_COMPANY.jurisdiction}`;

export const GENOMATCH_CONTACT_LINE = `${GENOMATCH_COMPANY.contactEmail} · ${GENOMATCH_COMPANY.website} · ${GENOMATCH_COMPANY.locationLine}`;

/** Short operator line for About / Profile footer. */
export const GENOMATCH_ABOUT_LINE = `${GENOMATCH_COMPANY.legalName} · ${GENOMATCH_COMPANY.contactEmail} · ${GENOMATCH_COMPANY.website}`;

export const GENOMATCH_PARENT_LINE = `A product of ${GENOMATCH_COMPANY.parentLegalName}`;
