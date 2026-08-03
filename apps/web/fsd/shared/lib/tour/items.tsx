'use client';

import { ReactNode } from 'react';
import { useEffect } from 'react';

import { useCurrentTourContext } from './_internal/store';
import { DATA_SELECTOR } from './const';

const useTriggerIsMounted = (id?: string) => {
  const { registerItemMounted, unregisterItemUnmounted } = useCurrentTourContext(
    (v) => v.tourItemControls
  );

  const tourId = useCurrentTourContext((v) => v.tourId);

  useEffect(() => {
    if (!id) return;

    registerItemMounted(id);

    return () => {
      unregisterItemUnmounted(id);
    };
  }, [tourId, id]);
};

interface TourItemProps {
  [DATA_SELECTOR]: string;
}

export const useTourItem = (id: string) => {
  // const ref = useRef<HTMLDivElement>(null);
  useTriggerIsMounted(id);

  if (!id) return;

  return {
    [DATA_SELECTOR]: id,
  } satisfies TourItemProps;
};

// to indicate whether item mounted or not in nested layouts
// i hope works with server components as well
export const TourItemContainer = ({
  children,
  id,
}: {
  children: (props: TourItemProps) => ReactNode;
  id: string;
}) => {
  const props = useTourItem(id);

  return children(props);
};
