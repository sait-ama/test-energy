export type QuizFormSchema = {
  name: string;
  description?: string | null | undefined;
  end_at?: string | null;
  questions: {
    id: string;
    type: number;
    question: string;
    description?: string | undefined | null;
    options?: { value: string; is_correct: boolean; id: string }[];
  }[];
};
