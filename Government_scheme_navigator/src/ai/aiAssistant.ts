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
  SHOW_RESULTS = "SHOW_RESULTS"
}

export interface ChatMessage {
  role: "ai" | "user";
  text: string;
  options?: string[];
}

export const validateInput = (state: ChatState, input: string): string | null => {
  switch (state) {
    case ChatState.ASK_AGE:
      const age = parseInt(input);
      if (isNaN(age) || age <= 0 || age > 120) return "invalid_age";
      break;
    case ChatState.ASK_INCOME:
      const income = parseInt(input);
      if (isNaN(income) || income < 0) return "invalid_income";
      break;
    default:
      if (!input.trim()) return "Please provide a valid response.";
  }
  return null;
};
