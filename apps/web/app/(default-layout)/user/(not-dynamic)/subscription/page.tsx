import { SubscribeSection } from '~pages/(user)/subscribe-tab/ui/subscribe-section';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(async (_) => {
  return generateNextMetadata({
    title: `Подписка`,
    description: `Подписка`,
    index: false,
    follow: false,
  });
});

export default function SubscriptionPage() {
  return (
    <NoSSR>
      <SubscribeSection />
    </NoSSR>
  );
}
