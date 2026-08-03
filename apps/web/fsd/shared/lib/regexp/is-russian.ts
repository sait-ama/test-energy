export const russianRegExp = /[а-яА-ЯёЁ]/;
export const isRussianRegExp = (str: string) => russianRegExp.test(str);
