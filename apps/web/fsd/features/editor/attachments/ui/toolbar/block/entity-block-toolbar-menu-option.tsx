import { ComponentPropsWithoutRef, ReactNode, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { PlusIcon } from '@re/ui-kit/icons/plus';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { client } from '~shared/api/client';
import type { QuizDetail } from '~shared/api/generated/models';
import { v2QuizzesRetrieveInfiniteOptions } from '~shared/api/generated/tanstack';
import { SearchField, SearchItem } from '~shared/api/models/search';
import {
  PaginationMode as SEARCH_MODAL_PAGINATION_MODE,
  useSearchModal,
} from '~shared/lib/search/use-search-modal';
import { useSession } from '~shared/lib/session/use-session';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { CUSTOM_CREATE_BLOCK_NODE } from '~shared/ui/text-editor/commands';
import { ENTITY_NODE_TYPE } from '~shared/ui/text-editor/nodes/const';
import { ToolbarMenuOption } from '~shared/ui/text-editor/toolbar';
import { cn } from '~shared/utils/cn';
import { Quiz as QuizWidget } from '~widgets/quiz/ui/quiz';
import { QuizCreateProvider, QuizProvider } from '~widgets/quiz-form/model/store';
import {
  QuizFormDateEndField,
  QuizFormDescriptionField,
  QuizFormRoot,
  QuizFormSubmitButton,
  QuizFormTitleField,
} from '~widgets/quiz-form/ui/quiz-form';
import {
  QuizFormQuestionList,
  QuizFormQuestionListAddButton,
} from '~widgets/quiz-form/ui/quiz-question';

interface QuizSimpleCardProps extends ComponentPropsWithoutRef<'div'> {
  model: QuizDetail;
  actions?: ReactNode;
  withHover?: boolean;
}

const QuizSimpleCard = (props: QuizSimpleCardProps) => {
  const { model, className, actions, withHover = false, ...rest } = props;

  return (
    <div
      className={cn(
        'bg-secondary flex items-center justify-between gap-4 rounded-md p-4',
        withHover &&
          'dark:hover:bg-accent/70 cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-none',
        className
      )}
      {...rest}
    >
      <ReText>{model.quiz.name}</ReText>
      {actions}
    </div>
  );
};

interface QuizPreviewProps {
  children: ReactNode;
  model: QuizDetail;
}

const QuizPreview = (props: QuizPreviewProps) => {
  const { children, model } = props;

  const resolvedModel = {
    ...model,
    answers: [],
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-lg lg:max-w-screen-lg xl:max-w-screen-xl">
        <QuizWidget model={resolvedModel} disabled />
      </DialogContent>
    </Dialog>
  );
};

interface QuizCreateViewProps {
  onSuccess: (quiz: QuizDetail) => void;
}

const QuizCreateView = ({ onSuccess }: QuizCreateViewProps) => {
  const tReusable = useTranslations('reusable');
  const tQuiz = useTranslations('quiz');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{tQuiz('create-label')}</Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-lg lg:max-w-screen-lg xl:max-w-screen-xl">
        <QuizFormRoot>
          <QuizProvider>
            <QuizCreateProvider
              onSuccess={(quiz) => {
                onSuccess({
                  quiz,
                  answers: [],
                });
                setIsOpen(false);
              }}
            >
              <div className="flex flex-col gap-4">
                <QuizFormTitleField />
                <QuizFormDescriptionField />
                <QuizFormQuestionList />
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <QuizFormDateEndField className="w-full md:w-auto" />

                  <div className="flex w-full gap-2 self-end md:w-auto">
                    <QuizFormQuestionListAddButton
                      className="flex-[1_0_auto] md:flex-[0_1_auto]"
                      color="secondary"
                    >
                      {tQuiz('add-question')}
                    </QuizFormQuestionListAddButton>
                    <QuizFormSubmitButton className="flex-[1_0_auto] md:flex-[0_1_auto]">
                      {tReusable('actions.submit')}
                    </QuizFormSubmitButton>
                  </div>
                </div>
              </div>
            </QuizCreateProvider>
          </QuizProvider>
        </QuizFormRoot>
      </DialogContent>
    </Dialog>
  );
};

interface ChooseQuizViewProps {
  onSuccess: (quiz: QuizDetail) => void;
}

const ChooseQuizView = ({ onSuccess }: ChooseQuizViewProps) => {
  const t = useTranslations('reusable');

  const session = useSession()!;
  const {
    data: quizzesData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useApiGenSuspenseInfiniteQuery(
    v2QuizzesRetrieveInfiniteOptions({ client, query: { user_id: session.id } })
  );

  const quizzes = useMemo(() => quizzesData.pages.flatMap((it) => it.results), [quizzesData]);
  const FlatList: FlatListType<typeof quizzes> = _FlatList;

  return (
    <div>
      <FlatList.Root content={quizzes} isLoading={isFetchingNextPage} className="mt-4">
        <FlatList.Layout className="flex flex-col gap-4">
          <FlatList.Content>
            {({ item, attributes }) => (
              <QuizPreview model={{ quiz: item, answers: [] }} key={item.id}>
                <QuizSimpleCard
                  withHover
                  key={item.id}
                  model={{ quiz: item, answers: [] }}
                  {...attributes}
                  actions={
                    <Button
                      circle
                      onClick={(e) => {
                        e.preventDefault();
                        onSuccess({ quiz: item, answers: [] });
                      }}
                    >
                      <PlusIcon />
                    </Button>
                  }
                />
              </QuizPreview>
            )}
          </FlatList.Content>
          <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
        </FlatList.Layout>
        <FlatList.Empty text={t('empty_states.empty')} emoji="📝" className="col-span-full" />
      </FlatList.Root>
    </div>
  );
};

export const ToolbarMenuQuizOption = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useTranslations('reusable.entities.attachments');

  const [editor] = useLexicalComposerContext();

  const [isOpen, setIsOpen] = useState(false);

  const handleQuizChoose = (quiz: QuizDetail) => {
    editor.dispatchCommand(CUSTOM_CREATE_BLOCK_NODE, {
      type: POST_ATTACHMENT_TYPE.quiz,
      id: quiz.quiz.id,
      nodetype: ENTITY_NODE_TYPE.block,
      model: quiz,
    });
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <ToolbarMenuOption withDialog>{t('quiz')}</ToolbarMenuOption>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-lg">
          <div className="flex items-center justify-between">
            <DialogTitle>{t('quiz')}</DialogTitle>
            <QuizCreateView onSuccess={handleQuizChoose} />
          </div>
          <ChooseQuizView onSuccess={handleQuizChoose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const ToolbarMenuUserOption = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useTranslations('reusable.entities.attachments');

  const { open: openSearchModal } = useSearchModal();
  const [editor] = useLexicalComposerContext();

  const handleOpen = () => {
    openSearchModal({
      // @ts-ignore
      onClick: (value: SearchItem<SearchField.users>) => {
        editor.dispatchCommand(CUSTOM_CREATE_BLOCK_NODE, {
          type: POST_ATTACHMENT_TYPE.user,
          id: String(value.id),
          nodetype: ENTITY_NODE_TYPE.block,
          model: value,
        });
        onSuccess?.();
      },
      hits: false,
      history: false,
      fields: [SearchField.users],
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return (
    <ToolbarMenuOption onClick={handleOpen} withDialog>
      {t('user')}
    </ToolbarMenuOption>
  );
};

export const ToolbarMenuPublisherOption = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useTranslations('reusable.entities.attachments');

  const { open: openSearchModal } = useSearchModal();
  const [editor] = useLexicalComposerContext();

  const handleOpen = () => {
    openSearchModal({
      // @ts-ignore
      onClick: (value: SearchItem<SearchField.publishers>) => {
        editor.dispatchCommand(CUSTOM_CREATE_BLOCK_NODE, {
          type: POST_ATTACHMENT_TYPE.publisher,
          id: String(value.id),
          nodetype: ENTITY_NODE_TYPE.block,
          model: value,
        });
        onSuccess?.();
      },
      hits: false,
      history: false,
      fields: [SearchField.publishers],
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return (
    <ToolbarMenuOption onClick={handleOpen} withDialog>
      {t('publisher')}
    </ToolbarMenuOption>
  );
};

export const ToolbarMenuTitleOption = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useTranslations('reusable.entities.attachments');

  const { open: openSearchModal } = useSearchModal();
  const [editor] = useLexicalComposerContext();

  const handleOpen = () => {
    openSearchModal({
      // @ts-ignore
      onClick: (value: SearchItem<SearchField.titles>) => {
        editor.dispatchCommand(CUSTOM_CREATE_BLOCK_NODE, {
          type: POST_ATTACHMENT_TYPE.title,
          id: String(value.id),
          nodetype: ENTITY_NODE_TYPE.block,
          model: value,
        });
        onSuccess?.();
      },
      hits: false,
      history: false,
      fields: [SearchField.titles],
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return (
    <ToolbarMenuOption onClick={handleOpen} withDialog>
      {t('title')}
    </ToolbarMenuOption>
  );
};
