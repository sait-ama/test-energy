'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useParams } from 'next/navigation';

import { useTitleVoiceover } from '~entities/title/model/queries';
import { VoiceoverPlayer } from '~widgets/voiceover-player/ui/voiceover-player';

import type { TitleDetailPageParams } from '../../model/type';

export interface VoiceoverContentProps extends ComponentPropsWithoutRef<'div'> {}

export const VoiceoverContent = (props: VoiceoverContentProps) => {
  const { dir } = useParams<TitleDetailPageParams>();

  const { data, isLoading } = useTitleVoiceover({ variables: { params: { dir } } });

  if (isLoading) return null;

  return <VoiceoverPlayer model={data} {...props} />;
};
