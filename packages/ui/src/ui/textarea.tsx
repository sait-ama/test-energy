import * as React from 'react';
import { ComponentProps, useImperativeHandle } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

interface UseAutosizeTextAreaProps {
    textAreaRef: HTMLTextAreaElement | null;
    minHeight?: number;
    maxHeight?: number;
    triggerAutoSize: string;
}

export const useAutosizeTextArea = ({
    textAreaRef,
    triggerAutoSize,
    maxHeight = Number.MAX_SAFE_INTEGER,
    minHeight = 0,
}: UseAutosizeTextAreaProps) => {
    const [init, setInit] = React.useState(true);
    React.useEffect(() => {
        // We need to reset the height momentarily to get the correct scrollHeight for the textarea
        const offsetBorder = 2;
        if (textAreaRef) {
            if (init) {
                textAreaRef.style.minHeight = `${minHeight + offsetBorder}px`;
                if (maxHeight > minHeight) {
                    textAreaRef.style.maxHeight = `${maxHeight}px`;
                }
                setInit(false);
            }
            textAreaRef.style.height = `${minHeight + offsetBorder}px`;
            const { scrollHeight } = textAreaRef;
            // We then set the height directly, outside of the render loop
            // Trying to set this with state or a ref will product an incorrect value.
            if (scrollHeight > maxHeight) {
                textAreaRef.style.height = `${maxHeight}px`;
            } else {
                textAreaRef.style.height = `${scrollHeight + offsetBorder}px`;
            }
        }
    }, [textAreaRef, triggerAutoSize]);
};

export interface AutosizeTextAreaRef {
    textArea: HTMLTextAreaElement;
    maxHeight: number;
    minHeight: number;
}

type AutosizeTextAreaProps = {
    maxHeight?: number;
    minHeight?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface TextareaProps extends ComponentProps<'textarea'> {}

const Textarea = ({ ref, className, ...props }: TextareaProps) => (
    <textarea
        className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:ring-accent box-border flex w-full rounded-sm border border-solid px-4 py-3 text-sm shadow-xs transition-colors focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
            className,
        )}
        ref={ref}
        {...props}
    />
);
Textarea.displayName = 'Textarea';

const AutosizeTextarea = ({
    ref,
    maxHeight = Number.MAX_SAFE_INTEGER,
    minHeight = 52,
    className,
    onChange,
    value,
    ...props
}: AutosizeTextAreaProps & {
    ref?: React.RefObject<AutosizeTextAreaRef>;
}) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState('');

    useAutosizeTextArea({
        textAreaRef: textAreaRef.current,
        triggerAutoSize: triggerAutoSize,
        maxHeight,
        minHeight,
    });

    useImperativeHandle(ref, () => ({
        textArea: textAreaRef.current!,
        focus: () => textAreaRef.current?.focus(),
        maxHeight,
        minHeight,
    }));

    React.useEffect(() => {
        if (value || props.defaultValue) {
            setTriggerAutoSize(value as string);
        }
    }, [value || props.defaultValue]);

    return (
        <Textarea
            {...props}
            value={value}
            ref={textAreaRef}
            className={className}
            onChange={(e) => {
                setTriggerAutoSize(e.target.value);
                onChange?.(e);
            }}
            style={{ resize: 'none' }}
        />
    );
};
AutosizeTextarea.displayName = 'AutosizeTextarea';

export { AutosizeTextarea, Textarea };
