/** Legal entity — shown in privacy, auth footers, and support copy */
export const GENOMATCH_COMPANY = {
  legalName: 'Genomatch Ltd Nigeria',
  registration: 'RC No. 9236521',
  jurisdiction: 'Nigeria',
  locationLine: 'Genomatch Ltd Nigeria',
  contactEmail: 'hello@genomatch.app',
  website: 'genomatch.app',
} as const;

export const GENOMATCH_CONTACT_LINE = `${GENOMATCH_COMPANY.contactEmail} · ${GENOMATCH_COMPANY.website} · ${GENOMATCH_COMPANY.locationLine}`;
