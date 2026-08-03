import { memo } from 'react';

import type { SubscriptionCardFabricProps } from '~entities/user-subscriptions/ui/card-fabric';
import { SubscriptionCardFabric } from '~entities/user-subscriptions/ui/card-fabric';
import { UnSubscribeButton } from '~features/author-unsubscribe/ui/unsubscribe-button';

export const SubscriptionCardFabricWithAction = memo(
  (props: Omit<SubscriptionCardFabricProps, 'footer'>) => (
    <SubscriptionCardFabric
      {...props}
      footer={<UnSubscribeButton subType={props.subType} entityId={props.subscribtion.id} />}
    />
  )
);
