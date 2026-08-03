import Edit from '@re/ui-kit/icons/edit';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { ClubManageMemberForm } from '~features/(guild-manage)/ui/guild-manage-member-form';
import type { MemberSchema } from '~shared/api/models/guild-club';

export const ManageMember = ({
  member,
  className,
}: { member: MemberSchema } & { className?: string }) => {
  return (
    <Dialog modal>
      <DialogTrigger asChild>
        <Button variant="flat" color="primary" className={className} circle>
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">Изменения участника {member.user.username}</DialogTitle>
        <ClubManageMemberForm key={member.role + member.user.id} member={member} />
      </DialogContent>
    </Dialog>
  );
};
