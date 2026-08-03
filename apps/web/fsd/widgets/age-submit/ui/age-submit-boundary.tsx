'use client';

import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';

import { SubmitAgeCard } from './age-submit-card';

export interface AgeSubmitBoundaryContainerProps {
  className?: string;
}

export const AgeSubmitBoundaryContainer = ({}: AgeSubmitBoundaryContainerProps) => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { age_limit, is_erotic, is_yaoi } = data;
  const { ageSubmitted } = useAgeSubmitted();

  const shouldShow = !ageSubmitted && (age_limit.id === 2 || is_erotic || is_yaoi);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-black/10 backdrop-blur-md" />
        <SubmitAgeCard />
      </div>
    </div>
  );
};
