'use client';

import { ReactNode } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useThemeByDirSuspense } from '~entities/shop/model/queries';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { useInsertUserThemeStyle } from '~features/(user)/user-theme';
import { logger } from '~shared/lib/logger';
import { EntityLayoutRoot } from '~shared/ui/entity-layout';

export const UserLayoutRoot = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const params = useParams<{ id: string }>();
  const { data: userData } = useUserSuspenseQuery({
    variables: { params: { userId: params?.id } },
  });

  const searchParams = useSearchParams();
  const themePreview = searchParams.get('themePreview');

  let themePreviewData = null;

  try {
    // eslint-disable-next-line react-compiler/react-compiler
    const { data } = useThemeByDirSuspense({
      variables: { params: { themeDir: themePreview ?? '' } },
    });

    if (data) {
      themePreviewData = data;
    }
  } catch (error) {
    logger.error(error);
  }

  useInsertUserThemeStyle(themePreviewData?.theme ?? userData?.theme);

  return (
    <EntityLayoutRoot wallpaper={userData?.wallpaper?.high} className={className}>
      {children}
    </EntityLayoutRoot>
  );
};
