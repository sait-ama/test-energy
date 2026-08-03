import Link from 'next/link';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { Card, CardContent } from '@re/ui-kit/ui/card';
import { ReText } from '@re/ui-kit/ui/text';

import { Routing } from '~shared/config/routing';
import { Container } from '~shared/ui/container';

export const NewSiteFeatures = () => {
  return (
    <Container slim className="!px-0">
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.Entry.main({ params: { id: 75 } })} // TODO: Site Config ID
        target="_blank"
      >
        <Card className="hover-card m-[0_auto] w-full !cursor-default !bg-transparent px-2 py-1 shadow-lg">
          <CardContent className="flex items-center justify-between p-4" withHover={false}>
            <div>
              <ReText component="h3" size="lg" weight="semibold">
                Что нового
              </ReText>
              <ReText size="sm" color="muted-foreground">
                Узнайте о новых функциях этой версии!
              </ReText>
            </div>
            <Button className="select-none" variant="default" size="sm">
              Подробнее
              <ExternalLink className="ml-1 size-3" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </Container>
  );
};
