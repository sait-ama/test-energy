import { PropsWithChildren } from 'react';
import Head from 'next/head';

import { cn } from '@re/ui-kit/utils/cn';

import { BackgroundItem } from '~pages/(user)/subscribe-tab/ui/background-item';
import { SubscribeHeading } from '~pages/(user)/subscribe-tab/ui/subscribe-section';
import { Container } from '~shared/ui/container';

export default async function SubscriptionLayout({ children }: PropsWithChildren) {
  return (
    <>
      {/*prefetching resources*/}
      <Head>
        <link
          rel="preload"
          href="/subscription/girl-and-boy.webp"
          as="image"
          fetchPriority="high"
        />
        <link rel="preload" href="/subscription/wing.webp" as="image" fetchPriority="high" />
      </Head>

      <Container slim className="relative min-h-screen overflow-visible overflow-x-clip max-sm:p-0">
        <>
          <SubscribeHeading />
          {children}
          <BackgroundItem
            mediaServer={false}
            width={168}
            height={168}
            className="-right-[20px] size-[120px] rotate-[30deg] opacity-[0.2] md:top-0 md:-right-[10px] md:size-[168px] dark:opacity-[0.011]"
            alt="medal"
            src="/subscription/subscribeMedal.webp"
          />
          <BackgroundItem
            width={117}
            height={117}
            className={cn(
              'pointer-events-none absolute bottom-[70%] left-5 -rotate-45 opacity-[0.3] select-none dark:opacity-[0.011]'
            )}
            alt="medal"
            src="/subscription/subscribeStar.webp"
          />
        </>
      </Container>
    </>
  );
}
