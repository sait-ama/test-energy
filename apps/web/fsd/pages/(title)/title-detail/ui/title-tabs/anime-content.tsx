'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useParams } from 'next/navigation';

import { useTitleAnime } from '~entities/title/model/queries';
import { AnimePlayer } from '~widgets/anime-player/ui/anime-player';

import type { TitleDetailPageParams } from '../../model/type';

export interface AnimeContentProps extends ComponentPropsWithoutRef<'div'> {}

export const AnimeContent = (props: AnimeContentProps) => {
  const { dir } = useParams<TitleDetailPageParams>();

  const { data, isLoading } = useTitleAnime({ variables: { params: { dir } } });

  if (isLoading) return;

  return <AnimePlayer model={data} {...props} />;
};
