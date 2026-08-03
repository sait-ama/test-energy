import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_MAX_CHANNEL_MEMBERS_LIMIT } from 'module/chat/constants/limits';
import { toast } from 'sonner';

import { cn } from '@re/ui-kit/utils/cn';

import { UserSchemaFragment } from '~shared/api/models/user';

import {
  NewChannelGroupProvider,
  NewChannelGroupStep,
} from '../../../context/new-channel-group-context';
import { useCreateChannelMutation } from '../../../model/toolkit/mutations';
import { ChannelSchema, ChannelType } from '../../../model/types';
import { Transition } from '../../ui/transition';
import { ChannelGroupDetailsStep } from './channel-group-details-step';
import { ChannelGroupUserSelectionStep } from './channel-group-user-selection-step';

type NewChannelGroupViewProps = {
  className?: string;
  onCreateChannelGroup: (channel: ChannelSchema) => Promise<void>;
  onBack?: (channelDir?: string) => void;
  maximumMembers?: number;
};

const NewChannelGroupView = ({
  className,
  onCreateChannelGroup,
  onBack,
  maximumMembers = DEFAULT_MAX_CHANNEL_MEMBERS_LIMIT,
}: NewChannelGroupViewProps) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<NewChannelGroupStep>(
    NewChannelGroupStep.SELECT_USERS
  );

  const {
    mutate: createChannelMutation,
    isPending: isCreating,
    error: createError,
  } = useCreateChannelMutation({
    onSuccess: (data, variables, context) => {
      onCreateChannelGroup(data);
      resetFlow();
      onBack?.();
    },
    onError: (error) => {
      console.log(error);
      toast.error('Не удалось создать беседу');
    },
  });

  // State management
  const [selectedUsers, setSelectedUsers] = useState<UserSchemaFragment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelGroupName, setChannelGroupName] = useState('');
  const [channelGroupImage, setChannelGroupImage] = useState<string | File | null>(null);

  // User management handlers
  const addSelectedUser = useCallback(
    (user: UserSchemaFragment) => {
      if (selectedUsers.length >= maximumMembers) {
        toast('Максимум 10 участников');
        return;
      }
      setSelectedUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
    },
    [selectedUsers, maximumMembers]
  );

  const removeSelectedUser = useCallback((user: UserSchemaFragment) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
  }, []);

  const clearSelectedUsers = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Step navigation handlers
  const nextStep = useCallback(() => {
    if (currentStep === NewChannelGroupStep.SELECT_USERS) {
      setCurrentStep(NewChannelGroupStep.CHANNEL_GROUP_DETAILS);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep === NewChannelGroupStep.CHANNEL_GROUP_DETAILS) {
      setCurrentStep(NewChannelGroupStep.SELECT_USERS);
    } else {
      onBack?.();
    }
  }, [currentStep, onBack]);

  const resetFlow = useCallback(() => {
    setCurrentStep(NewChannelGroupStep.SELECT_USERS);
    setSelectedUsers([]);
    setSearchQuery('');
    setChannelGroupName('');
    setChannelGroupImage(null);
  }, []);

  // Channel group creation handler
  const createChannelGroup = useCallback(
    (
      data?: Partial<{
        name: string;
        cover: string | File | null;
        member_ids: number[];
      }>
    ) => {
      if (channelGroupName.trim() === '' || selectedUsers.length === 0) {
        return;
      }

      createChannelMutation({
        name: channelGroupName,
        cover: channelGroupImage,
        member_ids: selectedUsers.map((user) => user.id),
        ...data,
        type: ChannelType.GROUP,
      });
    },
    [channelGroupName, selectedUsers, channelGroupImage, createChannelMutation]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      // Current state
      currentStep,
      selectedUsers,
      searchQuery,
      channelGroupName,
      channelGroupImage,
      isCreating,
      createError,

      // Update methods
      setSearchQuery,
      setChannelGroupName,
      setChannelGroupImage,

      // Action handlers
      nextStep,
      prevStep,
      resetFlow,
      addSelectedUser,
      removeSelectedUser,
      clearSelectedUsers,
      createChannelGroup,
    }),
    [
      currentStep,
      selectedUsers,
      searchQuery,
      channelGroupName,
      channelGroupImage,
      isCreating,
      createError,
      nextStep,
      prevStep,
      resetFlow,
      addSelectedUser,
      removeSelectedUser,
      clearSelectedUsers,
      createChannelGroup,
    ]
  );

  const stepComponent = useMemo(() => {
    switch (currentStep) {
      case NewChannelGroupStep.SELECT_USERS:
        return <ChannelGroupUserSelectionStep onBack={onBack} />;
      case NewChannelGroupStep.CHANNEL_GROUP_DETAILS:
        return <ChannelGroupDetailsStep onBack={prevStep} />;
      default:
        return null;
    }
  }, [currentStep]);

  return (
    <NewChannelGroupProvider value={contextValue}>
      <div className={cn('flex h-full flex-col', className)}>
        <Transition
          name="slideFade"
          direction={currentStep === NewChannelGroupStep.SELECT_USERS ? 'inverse' : 'auto'}
          className="flex h-full flex-col"
        >
          {stepComponent}
        </Transition>
      </div>
    </NewChannelGroupProvider>
  );
};

NewChannelGroupView.displayName = 'NewChannelGroupView';

export { NewChannelGroupView };
