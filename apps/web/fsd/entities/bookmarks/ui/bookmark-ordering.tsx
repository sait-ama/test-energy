import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { BOOKMARK_ORDERING_DEFAULT, BOOKMARK_ORDERING_OPTIONS } from '../model/const';

export interface BookmarkOrderingProps {
  ordering: string;
  setOrdering: (ordering: string) => void;
}

export const BookmarkOrdering = ({ ordering, setOrdering }: BookmarkOrderingProps) => {
  const defaultValue = BOOKMARK_ORDERING_DEFAULT;

  return (
    <Select
      onValueChange={setOrdering}
      value={ordering || defaultValue}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="h-9">
        <SelectValue placeholder="Сортировать" />
      </SelectTrigger>
      <SelectContent className="flex-0 grow-0">
        <SelectGroup>
          {BOOKMARK_ORDERING_OPTIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
