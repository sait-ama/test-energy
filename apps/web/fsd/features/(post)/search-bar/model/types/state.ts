export type State = [
  string,
  (newValue: string | ((T: any) => string), method?: 'replace' | 'push') => void,
];
