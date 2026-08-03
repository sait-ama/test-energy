'use client';
import { ReactNode } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useThemeByDirSuspense } from '~entities/shop/model/queries';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { useInsertUserThemeStyle } from '~features/(user)/user-theme';
import { logger } from '~shared/lib/logger';
import { EntityLayoutRoot } from '~shared/ui/entity-layout';

export const UserEntityLayoutRoot = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const themePreview = searchParams.get('themePreview') ?? '';

  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: params?.id } } });

  let themePreviewData = null;

  try {
    const { data } = useThemeByDirSuspense({
      variables: { params: { themeDir: themePreview } },
    });

    if (data) {
      themePreviewData = data;
    }
  } catch (error: unknown) {
    logger.error(error);
  }

  useInsertUserThemeStyle(themePreviewData?.theme ?? user?.theme);

  return (
    <EntityLayoutRoot wallpaper={user?.wallpaper?.high} className={className}>
      {children}
    </EntityLayoutRoot>
  );
};
