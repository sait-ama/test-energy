'use client';

import { BackgroundFallingItems } from '~pages/(user)/user-billing/ui/background-falling-items';
import { UserBillingHeader } from '~pages/(user)/user-billing/ui/user-billing-header';
import { UserBillingSubheader } from '~pages/(user)/user-billing/ui/user-billing-subheader';
import { UserBillingTable } from '~pages/(user)/user-billing/ui/user-billing-table';
import { Container } from '~shared/ui/container';

export const UserBillingPage = () => {
  return (
    <Container layout="slim" className="relative my-4 flex flex-col gap-2 overflow-x-clip">
      <div className="relative min-h-[470px] md:min-h-[490px]">
        <UserBillingHeader
          className="z-1000 mx-auto mt-[155px] gap-6"
          subheader={<UserBillingSubheader />}
        />
        <BackgroundFallingItems />
      </div>
      <UserBillingTable />
    </Container>
  );
};
