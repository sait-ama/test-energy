import { Skeleton } from '@re/ui-kit/ui/skeleton';

import {
  PublisherMembersList,
  PublisherMembersListRoot,
} from '~features/publisher-members/ui/publisher-members';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

export default async function MembersPage() {
  return (
    <QuerySuspenseContainer
      fallback={
        <PublisherMembersListRoot>
          <Skeleton className="h-[50px] w-[270px]" />
        </PublisherMembersListRoot>
      }
    >
      <PublisherMembersList />
    </QuerySuspenseContainer>
  );
}

export const dynamic = 'force-dynamic';
