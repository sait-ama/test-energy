import { ReText } from '@re/ui-kit/ui/text';

export interface StatCardProps {
  icon: any;
  label: string;
  value: string;
}

export const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <li className="border-border rounded-sm border p-4">
    <Icon className="size-lg text-muted-foreground" />
    <ReText component="h4" size="sm" weight="medium" color="muted-foreground" className="mt-2">
      {label}
    </ReText>
    <ReText component="p" size="xl" weight="semibold" className="mt-xxs">
      {value}
    </ReText>
  </li>
);
