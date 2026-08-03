'use client';
import { UserPromoCodeFormSection } from '~pages/(user)/promocode/ui/user-promo-code-form-section';
import { TicketsUserHistoryListTable } from '~pages/(user)/promocode/ui/user-promo-codes-list';
import { Container } from '~shared/ui/container';

import { BackgroundFallingItems } from './background-items';

export const UserPromoCodePage = () => {
  return (
    <Container layout="slim" className="relative my-4 flex flex-col gap-2 overflow-x-clip">
      <div className="relative min-h-[470px] md:min-h-[600px]">
        <UserPromoCodeFormSection key="form" className="z-1000 m-auto mt-[155px]" />
        <BackgroundFallingItems />
      </div>
      <TicketsUserHistoryListTable />
    </Container>
  );
};
