import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { Routing } from '~shared/config/routing';

import {
  useGetOrCreateChatWithUserMutation,
  useGetOrCreateChatWithUserMutationOptions,
} from '../../../model/toolkit/mutations';

type OpenChatWithUserContainerProps = {
  children: (props: {
    createChat: (opts: { userId: number }) => void;
    isCreatingChat: boolean;
  }) => ReactNode;
  options?: useGetOrCreateChatWithUserMutationOptions;
};

export const OpenChatWithUserContainer = ({
  options,
  children,
}: OpenChatWithUserContainerProps) => {
  const router = useRouter();

  const { mutate: createChat, isPending: isCreatingChat } = useGetOrCreateChatWithUserMutation({
    onSuccess: (data, ev, s) => {
      router.push(
        Routing.User.chat({
          params: {
            chatId: data.id,
          },
        })
      );
      options?.onSuccess?.(data, ev, s);
    },
  });

  return children({ isCreatingChat, createChat });
};
