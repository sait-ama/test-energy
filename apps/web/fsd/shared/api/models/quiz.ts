// class QuizQuestionType(IntEnum):
//     MULTI_CHOICE = 1
//     SINGLE_CHOICE = 2
//     TEXT_ANSWER = 3
//     SCORE_ANSWER = 4

export enum QuizQuestionType {
  MULTI = 1,
  SINGLE = 2,
  TEXT = 3,
  SCORE = 4,
}

export const QUIZ_QUESTION_TYPE = {
  MULTI: 1,
  SINGLE: 2,
  TEXT: 3,
  SCORE: 4,
} as const;

export const QUIZ_QUESTION_TYPE_OPTIONS = [
  { id: QUIZ_QUESTION_TYPE.SINGLE, tName: 'single' },
  { id: QUIZ_QUESTION_TYPE.MULTI, tName: 'multi' },
  { id: QUIZ_QUESTION_TYPE.TEXT, tName: 'text' },
  { id: QUIZ_QUESTION_TYPE.SCORE, tName: 'score' },
] as const;
