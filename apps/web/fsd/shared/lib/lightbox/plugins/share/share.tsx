import type { PluginProps } from '../../types';
import { addToolbarButton } from '../../utils';
import { resolveShareProps } from './props';
import { ShareButton } from './share-button';

export function Share({ augment }: PluginProps) {
  augment(({ toolbar, share, ...rest }) => ({
    toolbar: addToolbarButton(toolbar, 'share', <ShareButton />),
    share: resolveShareProps(share),
    ...rest,
  }));
}
