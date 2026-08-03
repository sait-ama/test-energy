import Image from 'next/image';
import { useParams } from 'next/navigation';

import { ReText } from '@re/ui-kit/ui/text';

import { Routing } from '~shared/config/routing';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { isNewYearDate } from '~shared/lib/event-management/is-new-year';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const YearSummaryButton = () => {
  const params = useParams<{ id: string }>();

  const isNewYear = isNewYearDate();

  if (!isNewYear) return null;

  return (
    <AuthorizedLink
      className="relative flex h-10 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(90deg,#CD476A_0%,#473BAB_100%)] px-4 transition-opacity duration-300 hover:opacity-70"
      href={Routing.YearSummary.byUser({ params: { id: params.id } })}
    >
      <div className="absolute top-0 left-0 h-[80px] w-[200px] select-none">
        <Image
          draggable={false}
          fill
          alt="snowflake icon"
          src={UrlFormatter.media('public/year-summary/menu/left-snowflakes-bg.png')}
        />
      </div>
      <ReText weight="medium" size="sm" className="!text-white">
        Итоги года
      </ReText>
    </AuthorizedLink>
  );
};
