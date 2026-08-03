'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import AddIcon from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { useActiveBranchId, useAvailableBranches } from '~entities/title/model/store';
import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';

export const EditTitleRoutingLayout = ({ children }: PropsWithChildren) => {
  const params = useParams<{ dir: string }>();
  const tab = usePathname().split('/').at(-1)!;
  const contentType = useContentType();
  const branches = useAvailableBranches();

  const [state, setState] = useControllableState({
    prop: tab,
    onChange: (tab) => {
      router.push(
        Routing.Title.chaptersEdit({ params: { dir: params.dir, tab: tab, contentType } })
      );
    },
  });

  const router = useRouter();

  const { value, setValue } = useActiveBranchId();

  return (
    <>
      {branches?.length > 1 ? (
        <div className="border-border my-3 rounded-md border p-3">
          <Select value={value} onValueChange={setValue}>
            <ReText>Выбор ветки...</ReText>
            <SelectTrigger>
              <SelectValue placeholder="Выбрать ветку..." />
            </SelectTrigger>
            <SelectContent>
              {branches?.map((it) => (
                <SelectItem key={it.id} value={String(it.id)}>
                  {it.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Tabs value={state} onValueChange={setState} className="flex flex-col gap-2">
        <div className="flex justify-between">
          <ScrollArea>
            <TabsList>
              <TabsTrigger value="chapters">Главы</TabsTrigger>
              <TabsTrigger value="bundles">Бандлы</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="chapters">
            <Button asChild color="secondary" startIcon={<AddIcon />}>
              <Link
                prefetch={false}
                href={Routing.Title.addChapter({
                  params: {
                    contentType: contentType,
                    dir: params.dir,
                  },
                  query: { branch: value },
                })}
              >
                Добавить главу
              </Link>
            </Button>
          </TabsContent>
          <TabsContent value="bundles">
            <Button color="secondary" asChild startIcon={<AddIcon />}>
              <Link
                prefetch={false}
                href={Routing.Title.addBundle({
                  params: {
                    dir: params.dir,
                    contentType,
                  },

                  query: { branchId: value },
                })}
              >
                Добавить бандл
              </Link>
            </Button>
          </TabsContent>
        </div>
        {children}
      </Tabs>
    </>
  );
};
