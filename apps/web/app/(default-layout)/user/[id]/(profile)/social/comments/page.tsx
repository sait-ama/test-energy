import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { UserCommentsTab } from '~pages/(user)/comments/ui/user-comments';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;

    const queryClient = getQueryClient();

    const user = await queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    const username = user.username;

    return generateNextMetadata({
      title: `Комментарии ${username}`,
      description: `Профиль пользователя ${username}`,
      canonical: Routing.User.detail({
        params: { id, tab: 'social' as const, subTab: 'comments' },
      }),
    });
  }, 'user-comments')
);

export default async function UserCommentsPage() {
  return (
    <div className="cs-comments-section cs-section md:px-2">
      <UserDetailBreadcrumbsLd tab="comments" />
      <UserCommentsTab />
    </div>
  );
}

export const dynamic = 'force-dynamic';
