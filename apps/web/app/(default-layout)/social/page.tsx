import { lazy } from 'react';
import { Metadata } from 'next';

const LinkVk = lazy(() =>
  import(/* webpackChunkName: "LinkVk" */ '~pages/socials/link-vk').then((m) => ({
    default: m.LinkVk,
  }))
);

export const metadata: Metadata = {
  title: 'Привязка социальной сети',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SocialPage() {
  return <LinkVk />;
}

export const dynamic = 'force-dynamic';
