import React from 'react';

const ChannelPreviewPlaceholder = () => (
  <div className="mb-2 flex items-center gap-2 rounded-xl border border-transparent bg-[#111214] p-1 pr-2 transition-colors duration-200">
    {/* Плейсхолдер аватара */}
    <div>
      <div className="bg-secondary size-12 rounded-xl" />
    </div>
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        {/* Плейсхолдер названия канала */}
        <div className="bg-secondary h-3 w-24 rounded-sm" />
      </div>
      <div className="flex items-center gap-2">
        {/* Плейсхолдер для текста сообщения */}
        <div className="bg-secondary h-2 w-1/2 rounded-lg" />
      </div>
    </div>
  </div>
);

export { ChannelPreviewPlaceholder };
