'use client';
import React from 'react';

import { ExchangeSkeleton } from '~features/inventory/ui/exchanges/exchange-view';

export default () => (
  <div className="grid grid-cols-1 gap-3">
    {Array(14)
      .fill(0)
      .map((_, idx) => (
        <ExchangeSkeleton key={idx} />
      ))}
  </div>
);
