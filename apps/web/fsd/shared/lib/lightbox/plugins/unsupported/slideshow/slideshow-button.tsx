import * as React from 'react';

import { useLoseFocus } from '~shared/hooks/use-lose-focus';
import { IconButton } from '~shared/lib/lightbox/components/icon-button';
import { createIcon } from '~shared/lib/lightbox/components/icons';

import { useController } from '../../../modules/controller/store';
import { useLightboxProps } from '../../../stores/lightbox-props';
import { useSlideshow } from './slideshow-context';

const PlayIcon = createIcon('Play', <path d="M8 5v14l11-7z" />);

const PauseIcon = createIcon('Pause', <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />);

export function SlideshowButton() {
  const { playing, disabled, play, pause } = useSlideshow();
  const { render } = useLightboxProps();
  const focusListeners = useLoseFocus(useController().focus, disabled);

  if (render.buttonSlideshow) {
    return <>{render.buttonSlideshow({ playing, disabled, play, pause })}</>;
  }

  return (
    <IconButton
      label={playing ? 'Pause' : 'Play'}
      icon={playing ? PauseIcon : PlayIcon}
      renderIcon={playing ? render.iconSlideshowPause : render.iconSlideshowPlay}
      onClick={playing ? pause : play}
      disabled={disabled}
      {...focusListeners}
    />
  );
}
