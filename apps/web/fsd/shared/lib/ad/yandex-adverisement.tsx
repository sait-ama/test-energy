import React, { RefObject, useEffect } from 'react';

export interface YandexAdvertisingProps {
  slug: number | string;
  index: number;
  ref?: RefObject<HTMLDivElement | null> | null;
  onMount?: () => void;
}

const ID = 'yandex_rtb_R-A-1753202-1';

export const YandexAdvertising = (props: YandexAdvertisingProps) => {
  const { slug, index, ref, onMount } = props;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return;

    (window as any).yaContextCb.push(() => {
      // @ts-ignore
      Ya.Context.AdvManager.render({
        blockId: 'R-A-1753202-1',
        renderTo: `${ID}-${slug}-${index}`,
      });
    });

    if (onMount) onMount();
  }, [slug]);

  return <div id={`${ID}-${slug}-${index}`} ref={ref} />;
};
