import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';
import { useLightboxState } from '~shared/lib/lightbox/stores/lightbox-state';

export function useNavigationState() {
  const { carousel } = useLightboxProps();
  const { slides, currentIndex } = useLightboxState();

  const prevDisabled = slides.length === 0 || (carousel.finite && currentIndex === 0);
  const nextDisabled =
    slides.length === 0 || (carousel.finite && currentIndex === slides.length - 1);

  return { prevDisabled, nextDisabled };
}
