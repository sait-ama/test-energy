export type SelectCatalogOrderingSharedProps = {
  renderButton: (children?: React.ReactNode) => React.ReactNode;
  isReversed: boolean;
  value: string | undefined;
  onValueChange: (value: string) => void;
  onReversedChange: (isReversed: boolean) => void;
  className?: string;
};
