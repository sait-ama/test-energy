'use client';

import { useCurrentBattlepass } from '~entities/battlepass/model/queries';
import { Reward } from '~features/battlepass-rewards/ui/battlepass-reward-card';
import { useScreenSuspense } from '~shared/hooks/use-media-query';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';
import { NArray } from '~shared/utils/NArray';

const desktop = '(min-width: 768px)';

export const BattlePassRewards = () => {
  const { data } = useCurrentBattlepass();
  const isDesktop = useScreenSuspense(desktop);

  const { content } = data;
  const { battlepass, levels } = content;

  const ownerByVersionDict = NArray.newBy(battlepass.versions).recordBy(
    (it) => it.version,
    (it) => it.isOwned
  );
  const versionByKeyDict = NArray.newBy(battlepass.levels).recordBy(
    (it) => it.version,
    (it) => it.level
  );

  if (isDesktop) {
    return (
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full py-2"
      >
        <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
          {levels
            .map((it) => ({
              level: it.level,
              rewards: Object.entries(it.rewards)
                .map(([version, rewards]) => rewards.map((it) => ({ ...it, version })))
                .flat(),
            }))
            .map((it) => (
              <CarouselItem
                key={it.level}
                className="flex basis-[33%] flex-col justify-center sm:basis-[66%] md:basis-1/3 md:pl-4 lg:basis-1/4"
              >
                {it.rewards.map((reward, index) => (
                  <Reward
                    key={`${reward.id}-${index}`}
                    currentLevel={versionByKeyDict[reward.version]!}
                    canClaim={!!ownerByVersionDict[reward.version]}
                    model={{ ...reward, level: it.level }}
                  />
                ))}
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {levels
        .map((it) => ({
          level: it.level,
          rewards: Object.entries(it.rewards)
            .map(([version, rewards]) => rewards.map((it) => ({ ...it, version })))
            .flat(),
        }))
        .map((it) => (
          <div key={it.level} className="border-border flex gap-2 border-b pb-4">
            {it.rewards.map((reward, index) => (
              <Reward
                key={`${reward.id}-${index}`}
                currentLevel={versionByKeyDict[reward.version]!}
                canClaim={!!ownerByVersionDict[reward.version]}
                model={{ ...reward, level: it.level }}
              />
            ))}
          </div>
        ))}
    </div>
  );
};
