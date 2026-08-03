export interface QuizFormSchema {
  answers: {
    [id: string]: { answer: string | number | (number | null)[] };
  };
}
