import React, { ReactNode } from 'react';
import Link from 'next/link';

import { useTranslations } from 'use-intl';

import { ReText } from '@re/ui-kit/ui/text';

import {
  PlayControlButton,
  SoundControlButton,
} from '~entities/inventory/ui/hero-card-preview/hero-card-preview';
import { RewardDialogTrigger } from '~features/(collection-card)/ui/reward-dialog-trigger';
import type { UserRareCollection } from '~shared/api/generated/models';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import { Expandable } from '~shared/ui/expandable';
import { LinkBase } from '~shared/ui/link-base';

interface RewardInfoByRareCollectionProps {
  model: UserRareCollection;
  children?: ReactNode;
  float?: ReactNode;
}

export const Rewardable = ({ model: item, float, children }: RewardInfoByRareCollectionProps) => {
  const tCard = useTranslations('collections.reward-item.you-can-gen');
  const sessionId = useSession((v) => v?.id);
  if (!sessionId) return null;

  const isAnimated =
    typeof item?.reward_card.cover?.mid === 'string' &&
    item?.reward_card.cover.mid.endsWith('.webm');
  const hasSound = item.reward_card.has_audio;

  // @ts-ignore
  return (
    <RewardDialogTrigger
      options={{
        overrides: {
          fullContent: (
            <div className="flex flex-col items-center gap-2">
              <ReText weight="semibold" size="xl" align="center">
                {tCard('title')}
              </ReText>
              <Expandable
                maxHeight={60}
                renderContent={(ref) => (
                  <ReText
                    component="span"
                    ref={ref}
                    align="center"
                    className="inline-block text-center"
                    color="muted-foreground"
                  >
                    {tCard.rich('description', {
                      count: item.cards.length,
                      exchangeLink: (content) => (
                        <LinkBase>
                          <Link
                            className="inline-block"
                            href={Routing.User.detail({
                              params: { id: sessionId, subTab: 'exchanges', tab: 'social' },
                            })}
                          >
                            {content}
                          </Link>
                        </LinkBase>
                      ),
                      highlight: (content) => {
                        return (
                          <ReText color="primary" className="text-primary inline-block">
                            {content}
                          </ReText>
                        );
                      },
                      deckLink: (content) => (
                        <LinkBase>
                          <Link
                            className="inline-block"
                            href={Routing.User.detail({
                              params: { id: sessionId, tab: 'inventory' },
                              query: { type: 'decks' },
                            })}
                          >
                            {content}
                          </Link>
                        </LinkBase>
                      ),
                    })}
                  </ReText>
                )}
              ></Expandable>
              {isAnimated ? (
                <div className="flex items-center justify-center gap-2 rounded-md px-2">
                  <PlayControlButton />
                  {hasSound ? <SoundControlButton /> : null}
                </div>
              ) : null}
              {float}
            </div>
          ),
        },
      }}
      className="mr-3 ml-2"
      card={item.reward_card}
    >
      {children}
    </RewardDialogTrigger>
  );
};
