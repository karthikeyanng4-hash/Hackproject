import { UserProfile, calculateEligibilityScore } from './eligibilityEngine';
import schemesData from '../data/schemes.json';

export const getRecommendations = (profile: UserProfile) => {
  const scoredSchemes = schemesData.map(scheme => ({
    ...scheme,
    score: calculateEligibilityScore(profile, scheme)
  }));

  // Sort by score descending and return top 5
  return scoredSchemes
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};
