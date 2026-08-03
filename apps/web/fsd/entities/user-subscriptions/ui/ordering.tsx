'use client';
import React from 'react';

import { followersOrdering } from '~entities/user-subscriptions/model/consts';
import { RouterMenuSelect } from '~shared/ui/router-menu/ui/router-menu-select';

export function FollowersOrdering() {
  return (
    <RouterMenuSelect
      fieldName="ordering"
      contentClassName="cs-modal-following"
      options={followersOrdering}
      className="h-10"
      defaultValue="-id"
    />
  );
}
