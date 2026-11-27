import { genderBucket, profileMatchesInterestedIn } from './profileGender';

describe('genderBucket', () => {
  it('treats ProfileSetup Male/Female and pronoun values as the same buckets', () => {
    expect(genderBucket('Female')).toBe('women');
    expect(genderBucket('She/Her')).toBe('women');
    expect(genderBucket('Male')).toBe('men');
    expect(genderBucket('He/Him')).toBe('men');
    expect(genderBucket('Other')).toBe('beyond_binary');
    expect(genderBucket('They/Them')).toBe('beyond_binary');
  });
});

describe('profileMatchesInterestedIn', () => {
  it('lets every profile through when the preference is empty or everyone', () => {
    expect(profileMatchesInterestedIn('Female', [])).toBe(true);
    expect(profileMatchesInterestedIn('He/Him', ['everyone'])).toBe(true);
  });

  it('matches women to both Female and She/Her', () => {
    expect(profileMatchesInterestedIn('Female', ['women'])).toBe(true);
    expect(profileMatchesInterestedIn('She/Her', ['women'])).toBe(true);
    expect(profileMatchesInterestedIn('Male', ['women'])).toBe(false);
    expect(profileMatchesInterestedIn('He/Him', ['women'])).toBe(false);
  });

  it('matches men to both Male and He/Him', () => {
    expect(profileMatchesInterestedIn('Male', ['men'])).toBe(true);
    expect(profileMatchesInterestedIn('He/Him', ['men'])).toBe(true);
    expect(profileMatchesInterestedIn('Female', ['men'])).toBe(false);
  });
});
