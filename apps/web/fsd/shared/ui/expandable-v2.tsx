import { ReactNode, useEffect, useRef, useState } from 'react';

import ChevronDown from '@re/ui-kit/icons/chevron-down';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

interface BaseExpandableProps {
  className?: string;
  rows?: number;
}

type ExpandableProps = BaseExpandableProps &
  ({ text: string; renderContent?: never } | { text?: never; renderContent: () => ReactNode });

export const ExpandableV2 = ({ text, className, rows = 1, renderContent }: ExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = Math.round(height / lineHeight);
      setShowButton(lines > rows);
    }
  }, [text, rows]);

  return (
    <div className={cn('relative gap-1', className)}>
      <div
        ref={textRef}
        className={cn(
          !isExpanded && '[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical]'
        )}
        style={!isExpanded ? { WebkitLineClamp: rows } : undefined}
      >
        {renderContent ? renderContent() : <div dangerouslySetInnerHTML={{ __html: text }} />}
      </div>
      {showButton && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          circle
          size="xs"
          variant="secondary"
          className="absolute -right-1 -bottom-1 size-6"
        >
          <ChevronDown className={cn('size-4', isExpanded ? 'rotate-180' : '')} />
        </Button>
      )}
    </div>
  );
};
