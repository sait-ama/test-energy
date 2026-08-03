import type { ReactNode } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ProfileStats } from '~pages/(user)/header/ui/ProfileCard/ui/Stats';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import {
  EntityLayoutAvatarContainer,
  EntityLayoutHeader,
  EntityLayoutHeadingContainer,
  EntityLayoutRoot,
  EntityLayoutTitle,
  EntityLayoutTitleContainer,
  EntityLayoutWallpaper,
} from '~shared/ui/entity-layout';
import { Wallpaper, WallpaperBackground } from '~shared/ui/wallpaper';

type PartialUserParams = Partial<DetailedCurrentUserSchema> & { id: number };
export interface UserSnapshotProps {
  actions?: ReactNode | ((model: PartialUserParams) => ReactNode);
  model?: PartialUserParams;
  withStats?: boolean;
  className?: string;
}

export const UserSnapshot = ({
  model,
  actions,
  className,
  withStats = false,
}: UserSnapshotProps) => {
  return (
    <EntityLayoutRoot wallpaper={model?.wallpaper?.high} className={cn('z-1 gap-0', className)}>
      <div className="dark:bg-secondary relative aspect-[3/2] max-h-[300px]! w-full overflow-hidden rounded-md border-none bg-white p-4 pb-0 max-sm:p-2 md:max-h-[400px]">
        <EntityLayoutWallpaper>
          {({ wallpaper }) => (
            <WallpaperBackground className="z-10 h-full w-full">
              <Wallpaper withMask={false} src={wallpaper} className="object-cover" />
            </WallpaperBackground>
          )}
        </EntityLayoutWallpaper>
      </div>

      <EntityLayoutHeader className={cn('relative z-10 gap-4', 'mt-[-100px] max-sm:mt-[-116px]')}>
        <EntityLayoutAvatarContainer className="relative self-center">
          {({ size }) => (
            <>
              <UserAvatar
                avatarSrc={model?.avatar?.high}
                frameSrc={model?.frame?.high}
                alt={model?.username || 'Аватар пользователя'}
                size={size}
              />
            </>
          )}
        </EntityLayoutAvatarContainer>
        <EntityLayoutHeadingContainer>
          <EntityLayoutTitleContainer>
            <EntityLayoutTitle className="mx-0 self-center">{model?.username}</EntityLayoutTitle>
          </EntityLayoutTitleContainer>
          {withStats ? <ProfileStats className="mx-auto md:mx-0" id={model?.id} /> : null}
          {typeof actions === 'function' ? model && actions(model) : actions}
        </EntityLayoutHeadingContainer>
      </EntityLayoutHeader>
    </EntityLayoutRoot>
  );
};
