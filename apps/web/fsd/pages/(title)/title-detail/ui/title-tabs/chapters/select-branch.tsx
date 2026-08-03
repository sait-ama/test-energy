'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { BranchSchema } from '~shared/api/models/title';
import Person from '~shared/assets/placeholders/person';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';
import { useCurrentTitleBranch } from '../../../model/store';

const renderPublisherNames = (publishers) =>
  publishers.map((publisher, i) => {
    const isLast = publishers.length - 1 === i;

    return <>{`${publisher.name}${isLast ? '' : ', '}`}</>;
  });

type BranchCardProps = {
  branch: BranchSchema;
  isActive?: boolean;
} & ComponentPropsWithoutRef<'div'>;

const BranchCard = ({ branch, isActive, ...rest }: BranchCardProps) => (
  <div
    className={cn(
      'hover-card group flex cursor-pointer items-center gap-[12px] overflow-hidden p-2',
      isActive && '!border-primary border'
    )}
    {...rest}
  >
    <ImageRoot
      src={branch.img.mid || branch.img.low || ''}
      className="size-[80px] overflow-hidden rounded-sm"
    >
      <div className="size-full transition-transform duration-300 group-hover:scale-105">
        <ImageContent alt="branch" width={80} height={80} className="rounded-sm" />
        <ImageFallback>
          <Person size={36} className="text-muted-foreground" />
        </ImageFallback>
      </div>
    </ImageRoot>

    <div className="flex flex-col gap-[4px]">
      <ReText component="span" weight="semibold">
        {renderPublisherNames(branch.publishers)}
      </ReText>
      <ReText component="span" size="sm" weight="medium" color="muted-foreground">
        {branch.count_chapters} глав, {branch.total_votes} лайков
      </ReText>
    </div>
  </div>
);

interface SelectBranchProps {
  onClose?: () => void;
}

export const SelectBranch = (props: SelectBranchProps) => {
  const { onClose } = props;

  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const [activeBranch, setActiveBranch] = useCurrentTitleBranch();

  const branches = title?.branches || [];

  const handleSelectBranch = (branch) => {
    setActiveBranch(branch.id);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClose} className="self-start" variant="outline">
        Назад
      </Button>
      {branches.map((branch) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          isActive={activeBranch == branch.id}
          onClick={() => {
            handleSelectBranch(branch);
          }}
        />
      ))}
    </div>
  );
};
