import { discoveryDeckIsMissingPeople } from './discoveryDeckRecovery';

describe('discoveryDeckIsMissingPeople', () => {
  it('recovers when finished profiles exist that this member has not swiped', () => {
    expect(discoveryDeckIsMissingPeople({ eligible: 4, liked: 3, passed: 0 })).toBe(true);
    expect(discoveryDeckIsMissingPeople({ eligible: 4, liked: 0, passed: 0 })).toBe(true);
  });

  it('stays empty when every other finished profile was already liked or passed', () => {
    expect(discoveryDeckIsMissingPeople({ eligible: 3, liked: 3, passed: 0 })).toBe(false);
    expect(discoveryDeckIsMissingPeople({ eligible: 3, liked: 2, passed: 1 })).toBe(false);
    expect(discoveryDeckIsMissingPeople(null)).toBe(false);
  });
});
