import { ButtonProps } from 'react-day-picker';

import Share from '@re/ui-kit/icons/share';
import { Button } from '@re/ui-kit/ui/button';

import { MomentSchema } from '~shared/api/models/inventory';

import { useShareMoment } from './model/use-share-moment';

export const MomentShare = ({
  model,
  children,
  ...rest
}: ButtonProps & { model?: MomentSchema }) => {
  const { onShare } = useShareMoment(model);

  if (!model) return null;

  return (
    <Button variant="secondary" circle size="xl" {...rest} onClick={onShare}>
      <Share /> {children}
    </Button>
  );
};
