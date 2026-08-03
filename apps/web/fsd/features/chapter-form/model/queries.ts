import { useSearchParams } from 'next/navigation';

import { useTitleDetail } from '~entities/title/model/queries';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { useSession } from '~shared/lib/session/use-session';

export const useChapterPublishers = ({ titleDir }: { titleDir: string }) => {
  const session = useSession()!;
  const { data: user } = useUserSuspenseQuery({
    variables: { params: { userId: String(session?.id) } },
  });
  const { data: title } = useTitleDetail({ variables: { params: { dir: titleDir } } });
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');

  if (!user || !title) return null;

  const userPublishers = user.publishers;
  const titlePublishers = title.branches.find((it) => it.id === Number(branchId))?.publishers;

  if (session.is_staff) return titlePublishers;

  return titlePublishers?.filter((p) => userPublishers.map((up) => up.id).includes(p.id));
};
