import React, {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';

import type { Element } from 'domhandler';
import parse from 'html-react-parser';

import { cn } from '@re/ui-kit/utils/cn';

import { replaceHtmlEntities } from '~entities/activity/ui/utils';
import { useOpenStickerPreviewAction } from '~features/activity/model/actions';
import { useOpen } from '~shared/hooks/use-open';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { SimpleStickerNode } from '~shared/ui/text-editor/nodes/sticker-node/simple-sticker-node';
import { StickersClasses } from '~shared/ui/text-editor/nodes/sticker-node/types';

export const StickerContent = ({ children, dir }: PropsWithChildren & { dir: string }) => {
  const handleOpen = useOpenStickerPreviewAction();
  const handleOpenByDir = () => {
    handleOpen(dir);
  };
  return (
    <span
      onClick={handleOpenByDir}
      className="mr-[2px] inline-flex translate-y-[4px] cursor-pointer overflow-hidden rounded-xs hover:opacity-[0.7]"
    >
      {children}
    </span>
  );
};
export const SpoilerContent: FC<PropsWithChildren> = ({ children }) => {
  const [visible, toggleVisible] = useOpen();

  if (visible) return children;

  return (
    <span onClick={toggleVisible} className="cursor-pointer blur-xs">
      {children}
    </span>
  );
};

interface LargeTextProps {
  children?: ReactNode;
  className?: string;
}

export const LargeText: FC<LargeTextProps> = ({ children, className }) => {
  const [visible, toggleVisible] = useOpen();
  const [isOverflow, setIsOverflow] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textContainerRef.current) {
      const element = textContainerRef.current;

      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsOverflow(hasOverflow);
    }
  }, [children]);

  const toggleVisibility: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    toggleVisible();
  };

  return (
    <div>
      <div
        ref={textContainerRef}
        className={cn(!visible && 'max-h-[4.5em] overflow-hidden', className)}
      >
        {children}
      </div>

      {isOverflow && (
        <button onClick={toggleVisibility} className="text-primary text-sm">
          {visible ? 'Скрыть' : 'Раскрыть'}
        </button>
      )}
    </div>
  );
};

interface CommentTextProps {
  children: string;
  onStickerFound?: () => void;
  className?: string;
}

export const SpoiledText = ({ children, onStickerFound, className }: CommentTextProps) => {
  const dangerousText = sanitizeSync(replaceHtmlEntities(children ?? ''));
  const lineBreaksOverflow = dangerousText.split('\n').length > 3;
  const shouldCut = dangerousText && (dangerousText.length > 200 || lineBreaksOverflow);
  const TextLimitContainer = shouldCut ? LargeText : 'div';
  const hasFoundStickerRef = useRef<boolean | undefined>(undefined);

  return (
    <TextLimitContainer>
      <div
        className={cn('text-[15px]', className)}
        style={{
          wordBreak: 'break-word',
        }}
      >
        {parse(dangerousText, {
          replace: (domNode) => {
            const node = domNode as unknown as Element;
            if (node.attribs?.class?.includes('spoiler')) {
              // @ts-ignore
              return <SpoilerContent>{node?.children?.map((it) => it?.data)}</SpoilerContent>;
            }
            const dir = node.attribs?.['data-shop-item-dir'] as string;
            if (dir) {
              const props = { ...node.attribs };
              const originalSrc = props?.['data-original-src'] as string;

              if (!props.src && !originalSrc) {
                return null;
              }

              const stickerNode = new SimpleStickerNode(
                props.src || originalSrc,
                !!props?.class?.includes?.(StickersClasses.EMOJI),
                dir,
                !!props?.class?.includes?.(StickersClasses.SINGLE_STICKER),
                props.alt
              );
              if (stickerNode.__is_single) {
                if (!hasFoundStickerRef.current) {
                  hasFoundStickerRef.current = true;
                  onStickerFound?.();
                }
              }

              delete props.class;

              return (
                <StickerContent dir={dir}>
                  <Image
                    alt={dir}
                    src={stickerNode.__src}
                    width={stickerNode.__width}
                    height={stickerNode.__height}
                    className={node?.attribs?.class || ''}
                    {...props}
                  />
                </StickerContent>
              );
            }
            return null;
          },
        })}
      </div>
    </TextLimitContainer>
  );
};
