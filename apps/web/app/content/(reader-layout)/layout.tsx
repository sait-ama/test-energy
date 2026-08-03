import { ReactNode } from 'react';

import { ReaderImageLoaderInstanceContextProvider } from '~entities/reader/model/store';
import { ContentTypes } from '~shared/config/constants';
import { getContentType } from '~shared/config/site-config';

interface ReaderChapterPageProps {
  children: ReactNode;
}

export default async function ReaderChapterPage({ children }: ReaderChapterPageProps) {
  const contentType = getContentType();

  if (contentType !== ContentTypes.MANGA) return children;

  return (
    <ReaderImageLoaderInstanceContextProvider>{children}</ReaderImageLoaderInstanceContextProvider>
  );
}
