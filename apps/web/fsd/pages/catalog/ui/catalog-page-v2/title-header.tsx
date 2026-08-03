'use client';

import { ReText } from '@re/ui-kit/ui/text';

import { ExpandableV2 } from '~shared/ui/expandable-v2';

import { useCatalogHeader } from './model/context';

export const TitleHeader = () => {
  const fieldSchema = useCatalogHeader();

  return (
    <div className="flex flex-col items-start gap-2 rounded-sm px-4 py-4 md:items-center md:py-8">
      <div>
        <ReText size="xl" className="font-semibold md:text-4xl">
          {fieldSchema?.name ? fieldSchema.name : 'Каталог'}
        </ReText>
      </div>
      <ReText size="md" className="text-muted-foreground">
        {fieldSchema?.description ? <ExpandableV2 text={fieldSchema.description} /> : null}
      </ReText>
    </div>
  );
};
