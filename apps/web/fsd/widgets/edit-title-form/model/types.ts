import { ReactNode } from 'react';

export type RendererTitleEditTabBaseFn = ({
  isLoading,
  disabled,
}: {
  isLoading: boolean;
  disabled: boolean;
}) => ReactNode;
export type TitleEditFormTabBaseProps = {
  children?: RendererTitleEditTabBaseFn | ReactNode;
};
