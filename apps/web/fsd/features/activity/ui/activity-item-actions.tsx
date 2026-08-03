//todo
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import * as React from 'react';
import { useRef } from 'react';

import DislikeIcon from '@re/ui-kit/icons/dislike';
import Edit from '@re/ui-kit/icons/edit';
import Like from '@re/ui-kit/icons/like';
import Pin from '@re/ui-kit/icons/pin';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import {
  isActivityWithPinnedState,
  useActivityItemContext,
} from '~entities/activity/model/context';
import { replaceHtmlEntities } from '~entities/activity/ui/utils';
import {
  ActivityItemActionsContext,
  ActivityItemActionsContextType,
  MutateActions,
  useActivityItemActionsContext,
} from '~features/activity/model/context';
import {
  useActivityDeleteMutation,
  useActivityEditMutation,
  useActivityLikeMutation,
  useActivityReplyMutation,
} from '~features/activity/model/mutations';
import type { ActivityItemState } from '~features/activity/model/types';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

const ActivityItemActionsProvider = ({ children, showReplies = false }) => {
  const sublistActions = useRef<MutateActions>();

  const registerSublistActions = (actions: MutateActions) => {
    sublistActions.current = actions;

    return () => {
      sublistActions.current = undefined;
    };
  };

  const [state, setState] = React.useState<ActivityItemState>({
    showReplies,
  });
  return (
    <ActivityItemActionsContext.Provider
      value={{
        state,
        setState,
        sublistActions: sublistActions.current,
        registerSublistActions,
      }}
    >
      {children}
    </ActivityItemActionsContext.Provider>
  );
};

const EditButton = ({
  children,
  asChild = false,
}: { asChild?: boolean } & HTMLAttributes<HTMLButtonElement>) => {
  const { setState } = useActivityItemActionsContext();

  const props = {
    onClick: () => {
      setState((state) => ({ ...state, isEditing: !state.isEditing }));
    },
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button variant="ghost" size="sm" color="default" {...props}>
      <Edit />
    </Button>
  );
};

const ReplyButton = ({ className }: HTMLAttributes<HTMLButtonElement>) => {
  const { setState } = useActivityItemActionsContext();
  const loggedCheck = useLoggedCheck();

  const handleShowReplyForm = () => {
    setState((state) => ({ ...state, showReplyForm: !state.showReplyForm }));
  };

  return (
    <Button
      variant="link"
      size="sm"
      color="default"
      className={cn('text-muted-foreground font-semibold tracking-wide', className)}
      onClick={loggedCheck(handleShowReplyForm)}
    >
      Ответить
    </Button>
  );
};

const ShowRepliesButton = ({ className }) => {
  const { data } = useActivityItemContext();
  const { state, setState } = useActivityItemActionsContext();

  const handleShowReplies = () => {
    setState((state) => ({ ...state, showReplies: !state.showReplies }));
  };

  if (!data.count_replies) {
    return null;
  }

  return (
    <Button
      variant="link"
      size="sm"
      className={cn('font-semibold tracking-wide', className)}
      onClick={handleShowReplies}
    >
      <span className="border-border mr-1.5 h-px w-6 border-b" />
      {state.showReplies ? 'Скрыть' : 'Посмотреть'} {data.count_replies} ответ(ы)
    </Button>
  );
};

const RepliesVisibility = ({ children }) => {
  const { data } = useActivityItemContext();
  const { state } = useActivityItemActionsContext();

  return data.count_replies && state.showReplies ? children({ data, state }) : null;
};

const LikeButton = ({
  className,
  children,
  asChild = false,
}: { asChild?: boolean } & ComponentProps<'button'>) => {
  const { data } = useActivityItemContext();

  const loggedCheck = useLoggedCheck();
  const mutation = useActivityLikeMutation();

  const props = {
    onClick: loggedCheck(() => mutation.mutateAsync()),
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button
      startIcon={<Like className={cn(data.rated === 0 && 'fill-current text-red-700')} />}
      variant="ghost"
      size="sm"
      className={cn('pr-2 pl-1', className)}
      {...props}
    >
      {data.score}
    </Button>
  );
};

const DislikeButton = ({
  className,
  children,
  asChild = false,
}: { asChild?: boolean } & ComponentProps<'button'>) => {
  const { data } = useActivityItemContext();

  const loggedCheck = useLoggedCheck();
  const mutation = useActivityLikeMutation({ type: 1 });

  const props = {
    onClick: loggedCheck(() => mutation.mutateAsync()),
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button
      // startIcon={}
      variant="ghost"
      size="sm"
      circle
      className={cn('', className)}
      {...props}
    >
      <DislikeIcon
        className={cn(
          'size-3.5',
          data.rated === 1
            ? 'fill-current text-red-700'
            : '[--r-foreground-inverted:--r-foreground]'
        )}
      />
    </Button>
  );
};

const DeleteButton = ({
  className,
  children,
  asChild = false,
}: { asChild?: boolean } & ComponentProps<'button'>) => {
  const mutation = useActivityDeleteMutation();
  const loggedCheck = useLoggedCheck();

  const props = {
    disabled: mutation.isPending,
    onClick: loggedCheck(() => mutation.mutateAsync()),
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button variant="ghost" size="sm" className={cn('pr-2 pl-1', className)} {...props}>
      <Trash />
    </Button>
  );
};
const PinButton = ({
  className,
  children,
  asChild = false,
}: { asChild?: boolean } & ComponentProps<'button'>) => {
  const { setState } = useActivityItemActionsContext();
  const { data } = useActivityItemContext();
  const hasValidSchema = isActivityWithPinnedState(data);

  const mutation = useActivityEditMutation({
    onSuccess: () => {
      if (hasValidSchema) {
        setState((state) => ({
          ...state,
          is_pinned: !data.is_pinned,
        }));
      }
    },
  });

  if (!hasValidSchema) return null;

  const props = {
    disabled: mutation.isPending,
    onClick: async () => await mutation.mutateAsync({ id: data.id, is_pinned: !data.is_pinned }),
  };

  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  return (
    <Button variant="ghost" size="sm" className={cn('pr-2 pl-1', className)} {...props}>
      <Pin />
    </Button>
  );
};
//todo
interface ActivityItemReplyForm {
  children: ({
    disabled,
    onSubmit,
    onCancel,
  }: {
    disabled: boolean;
    onSubmit: (values: any) => Promise<void>;
    onCancel: () => void;
  }) => ReactNode;
}

const ActivityItemReplyFormInternal = ({ children }: ActivityItemReplyForm) => {
  const { data } = useActivityItemContext();
  const { setState, sublistActions } = useActivityItemActionsContext();

  const mutation = useActivityReplyMutation(
    { reply_to: data.id! },
    {
      onSuccess: () => {
        setState((state) => ({
          ...state,
          showReplyForm: false,
          // showReplies: 'end',
        }));

        setState((state) => {
          if (state.showReplies && sublistActions) {
            sublistActions.invalidate();
            return state;
          }
          return {
            ...state,
            showReplies: 'end',
          };
        });
      },
    }
  );

  const props = {
    disabled: mutation.isPending,
    onSubmit: mutation.mutateAsync,
    onCancel: () => {
      setState((state) => ({
        ...state,
        showReplyForm: false,
      }));
    },
  };

  return children(props);
};

const ActivityItemReplyForm = (props: ActivityItemReplyForm) => {
  if (!props.children) {
    throw new Error('ActivityListInput must include one of: children or renderInput function');
  }

  const { state } = useActivityItemActionsContext();

  if (!state.showReplyForm || state.isEditing) {
    return null;
  }

  return <ActivityItemReplyFormInternal {...props} />;
};

interface ActivityItemEditFormProp {
  children: (values: {
    onSubmit: (values: any) => Promise<void>;
    onCancel: () => void;
    disabled?: boolean;
    defaultValue?: string;
    onSuccess?: () => void;
  }) => ReactNode;
}

const ActivityItemEditFormInternal = ({ children }: ActivityItemEditFormProp) => {
  const { state, setState } = useActivityItemActionsContext();
  const { data } = useActivityItemContext();

  const mutation = useActivityEditMutation({
    onSuccess: () => {
      setState((state) => ({
        ...state,
        showReplyForm: false,
        showReplies: true,
      }));
    },
  });

  if (!state.isEditing) return null;

  const props = {
    // @ts-ignore
    defaultValue: replaceHtmlEntities(data.text),
    // @ts-ignore
    onSubmit: async (values) =>
      (await mutation.mutateAsync({ id: data.id, ...values })) as (values: any) => Promise<void>,
    disabled: state.isUpdating,
    onSuccess: () => {
      setState((state) => ({
        ...state,
        isEditing: false,
      }));
    },
    onCancel: () => {
      setState((state) => ({
        ...state,
        isEditing: false,
      }));
    },
  };

  return children(props);
};

const ActivityItemEditForm = (props: ActivityItemEditFormProp) => {
  if (!props.children) {
    throw new Error('ActivityListInput must include on of: children or renderInput function');
  }

  const { state } = useActivityItemActionsContext();

  if (!state.isEditing) return null;

  return <ActivityItemEditFormInternal {...props} />;
};

const ContextConsumer = ({
  children,
}: {
  children: (props: ActivityItemActionsContextType) => ReactNode;
}) => {
  const context = useActivityItemActionsContext();

  if (typeof children !== 'function') {
    throw new Error('Children inside ActivityItem-ContextConsumer must be a function');
  }

  return children(context);
};

export const ActivityItemActions = Object.assign(
  {},
  {
    Provider: ActivityItemActionsProvider,
    Reply: ReplyButton,
    RepliesContainer: RepliesVisibility,
    ShowRepliesButton: ShowRepliesButton,
    Edit: EditButton,
    Delete: DeleteButton,
    Pin: PinButton,
    Like: LikeButton,
    Dislike: DislikeButton,
    ReplyForm: ActivityItemReplyForm,
    EditForm: ActivityItemEditForm,
    ContextConsumer: ContextConsumer,
  }
);
