import { lazy, Suspense, useState } from 'react';

import Add from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

const AddPublisherMemberForm = lazy(() =>
  import(
    /* webpackChunkName: "AddPublisherMemberForm" */ '~features/(publisher)/add-member/ui/add-member-form'
  ).then((v) => ({
    default: v.AddPublisherMemberForm,
  }))
);
export const AddMemberPreviewTrigger = ({ publisherId }: { publisherId: number }) => {
  const [visible, setVisible] = useState(false);
  if (visible)
    return (
      <Suspense fallback={<Skeleton className="mt-4 h-[40px] w-full" />}>
        <AddPublisherMemberForm publisherId={publisherId} />
      </Suspense>
    );
  return (
    <Button
      onClick={() => {
        setVisible(true);
      }}
      endIcon={<Add />}
    >
      Пригласить участника
    </Button>
  );
};
