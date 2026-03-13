export enum ChatState {
  START = "START",
  GREETING = "GREETING",
  CHECK_LOGIN = "CHECK_LOGIN",
  ASK_USE_PROFILE = "ASK_USE_PROFILE",
  ASK_NAME = "ASK_NAME",
  ASK_GENDER = "ASK_GENDER",
  ASK_AGE = "ASK_AGE",
  ASK_OCCUPATION = "ASK_OCCUPATION",
  ASK_INCOME = "ASK_INCOME",
  ASK_EDUCATION = "ASK_EDUCATION",
  PROCESS_ELIGIBILITY = "PROCESS_ELIGIBILITY",
  SHOW_RESULTS = "SHOW_RESULTS",
  ASK_PHONE_APP = "ASK_PHONE_APP"
}

export interface ChatMessage {
  id?: number;
  role: "ai" | "user";
  text: string;
  options?: string[];
}

export const VALID_OCCUPATIONS = [
  "Farmer",
  "Student",
  "Entrepreneur",
  "Unemployed",
  "Unorganized Sector",
  "Rural Labor",
  "Fisherman",
  "Small Business",
  "Urban Poor",
  "Street Vendor",
  "Artisan",
  "Government Employee",
  "Private Sector",
  "Any",
  "Others"
];

export const validateInput = (state: ChatState, input: string): string | null => {
  if (!input.trim()) return "Please provide a valid response.";

  const hasNumbers = /\d/.test(input);

  switch (state) {
    case ChatState.ASK_NAME:
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(input) || input.length < 2) return "invalid_name";
      break;
    case ChatState.ASK_GENDER:
      const validGenders = ["Male", "Female", "Other", "Others"];
      const isGenderValid = validGenders.some(g => g.toLowerCase() === input.trim().toLowerCase());
      if (!isGenderValid) return "invalid_gender";
      break;
    case ChatState.ASK_OCCUPATION:
      const isValid = VALID_OCCUPATIONS.some(occ => 
        occ.toLowerCase() === input.trim().toLowerCase()
      );
      if (!isValid) return "invalid_occupation";
      break;
    case ChatState.ASK_AGE:
      const age = parseInt(input);
      if (isNaN(age) || age <= 0 || age > 120) return "invalid_age";
      break;
    case ChatState.ASK_INCOME:
      const income = parseInt(input);
      if (isNaN(income) || income < 0) return "invalid_income";
      break;
    case ChatState.ASK_EDUCATION:
      if (hasNumbers || input.length < 2) return "invalid_education";
      break;
    case ChatState.ASK_PHONE_APP:
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(input.trim())) return "invalid_phone";
      break;
  }
  return null;
};

