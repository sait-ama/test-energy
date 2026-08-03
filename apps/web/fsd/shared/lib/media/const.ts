export enum Display {
  'xs' = 'xs',
  'sm' = 'sm',
  'md' = 'md',
  'lg' = 'lg',
  'xl' = 'xl',
  'xl2' = '2xl',
}

export const breakpoints: Record<Display, number> = {
  [Display.xs]: 0,
  [Display.sm]: 640,
  [Display.md]: 768,
  [Display.lg]: 1024,
  [Display.xl]: 1280,
  [Display.xl2]: 1536,
};
