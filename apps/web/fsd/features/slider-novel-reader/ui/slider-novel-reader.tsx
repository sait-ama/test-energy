'use client';
import type { ReactNode } from 'react';
import React, { useEffect } from 'react';

import parse from 'html-react-parser';

import { useCurrentChapter } from '~entities/reader/model/hooks';
import {
  useClickableAreaHandlers,
  useHeaderVisibility,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { noop } from '~shared/utils/noop';

export const SliderReaderNovel = ({ children }: { children: ReactNode }) => {
  const { data } = useCurrentChapter();
  const setActivePageIndex = useReader((v) => v.setActivePageIndex);
  const setActivePageIndexHardFunc = useReader((v) => v.setActivePageIndexHardFunc);
  const handleMenu = useHeaderVisibility((v) => v.toggle);
  const registerActions = useClickableAreaHandlers((v) => v.registerActions);
  const brightness = useReaderSettings((v) => v.value.common.brightness);
  const containerWidth = useReaderSettings((v) => v.value.common.containerWidth);
  const fontSize = useReaderSettings((v) => v.value.novel.fontSize);
  const lineHeight = useReaderSettings((v) => v.value.novel.lineHeight);

  useEffect(() => {
    registerActions({
      onMenu: handleMenu,
      onNext: noop,
      onPrev: noop,
    });
  }, []);

  useEffect(() => {
    setActivePageIndexHardFunc(() => setActivePageIndex);
  }, []);

  return (
    <div
      className="novel-reader"
      style={{
        filter: `brightness(${brightness / 100})`,
        width: `${containerWidth}vw`,
        maxWidth: 900,
        margin: '0 auto',
        height: 'auto',
      }}
    >
      {parse(data?.content)}
      <style jsx global>
        {`
          .novel-reader > * > * {
            font-size: ${fontSize}px;
            line-height: ${lineHeight};
          }
        `}
      </style>
      {children}
    </div>
  );
};
