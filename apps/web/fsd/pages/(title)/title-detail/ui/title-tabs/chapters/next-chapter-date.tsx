import DayJS from 'dayjs';
import dayjs from 'dayjs';

import TimeReverse from '@re/ui-kit/icons/time-reverse';
import { Alert } from '@re/ui-kit/ui/alert';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { useCurrentTitleBranch } from '~pages/(title)/title-detail/model/store';
import { NArray } from '~shared/utils/NArray';

export const NextChapterDate = () => {
  const [activeBranchId] = useCurrentTitleBranch();
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const branch2Bulk = NArray.newBy(title?.branches ?? []).recordBy(
    (it) => String(it.id),
    (v) => v
  );
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  if (!branch2Bulk[activeBranchId]) return null;

  const { new_chapter_date } = branch2Bulk[activeBranchId];

  if (!new_chapter_date) return null;

  if (dayjs(new_chapter_date).isBefore(dayjs())) return null;

  const formattedDate = DayJS(new_chapter_date).format(dateFormat);

  return (
    <Alert className="bg-secondary/50 flex items-center gap-2 rounded-md border-2 border-dashed">
      <TimeReverse />
      <ReText color="muted-foreground" size="sm">
        Следующий эпизод выйдет
      </ReText>
      {formattedDate}
    </Alert>
  );
};
