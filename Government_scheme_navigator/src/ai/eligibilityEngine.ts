export interface UserProfile {
  fullName: string;
  gender: string;
  dob: string;
  age: number;
  maritalStatus: string;
  mobile: string;
  email: string;
  aadhaar?: string;
  state: string;
  district: string;
  areaType: 'Rural' | 'Urban';
  occupation: string;
  income: number;
  education: string;
  category: string;
}

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateEligibilityScore = (profile: UserProfile, scheme: any): number => {
  let score = 0;

  // Age match (20 points)
  if (profile.age >= scheme.minimum_age && profile.age <= scheme.maximum_age) {
    score += 20;
  }

  // Income eligibility (20 points)
  if (profile.income <= scheme.income_limit) {
    score += 20;
  }

  // Occupation match (20 points)
  if (scheme.occupation === "Any" || profile.occupation.toLowerCase() === scheme.occupation.toLowerCase()) {
    score += 20;
  }

  // Education match (20 points)
  // Simplified education check
  if (scheme.education_required === "None" || profile.education.includes(scheme.education_required)) {
    score += 20;
  }

  // Category eligibility (20 points)
  // Assuming category matches for demo purposes or adding a small random factor for realism
  score += 20;

  return score;
};
