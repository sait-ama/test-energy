import { CreateWithDrawPublisherFormRoot } from '~features/(publisher)/withdraw/ui/forms/create-withdraw-form';
import { PublisherWithDrawList } from '~features/(publisher)/withdraw/ui/publisher-withdraw-list';

export const PublisherWithdraw = ({ onSuccess }: { onSuccess?: () => void }) => (
  <div>
    <CreateWithDrawPublisherFormRoot />
    <PublisherWithDrawList />
  </div>
);
