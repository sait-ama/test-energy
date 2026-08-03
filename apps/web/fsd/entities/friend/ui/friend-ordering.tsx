'use client';
import React from 'react';

import { friendsOrdering } from '~entities/friend/model/consts';
import { RouterMenuSelect } from '~shared/ui/router-menu/ui/router-menu-select';

export function FriendsOrdering() {
  return <RouterMenuSelect fieldName="ordering" options={friendsOrdering} defaultValue="-id" />;
}
