import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';

import { IconButton } from '../../components/icon-button';
import { createIcon, createIconDisabled } from '../../components/icons';
import { useThumbnails } from './thumbnails-context';

const thumbnailsIcon = () => (
  <>
    <path
      strokeWidth={2}
      stroke="currentColor"
      strokeLinejoin="round"
      fill="none"
      d="M3 5l18 0l0 14l-18 0l0-14z"
    />
    <path d="M5 14h4v3h-4zM10 14h4v3h-4zM15 14h4v3h-4z" />
  </>
);

const ThumbnailsVisible = createIcon('ThumbnailsVisible', thumbnailsIcon());

const ThumbnailsHidden = createIconDisabled('ThumbnailsHidden', thumbnailsIcon());

export function ThumbnailsButton() {
  const { visible, show, hide } = useThumbnails();
  const { render } = useLightboxProps();

  if (render.buttonThumbnails) {
    return <>{render.buttonThumbnails({ visible, show, hide })}</>;
  }

  return (
    <IconButton
      label={visible ? 'Hide thumbnails' : 'Show thumbnails'}
      icon={visible ? ThumbnailsVisible : ThumbnailsHidden}
      renderIcon={visible ? render.iconThumbnailsVisible : render.iconThumbnailsHidden}
      onClick={visible ? hide : show}
    />
  );
}
