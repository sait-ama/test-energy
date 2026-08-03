import type { NextConfig } from 'next';

//...socials.map(social => ({
//   source: `/user/:id(\\d+)/${social}`,
//   destination: `/user/:id(\\d+)/social/${social}`,
//   permanent: true,
// } as NextConfig['redirects'][0]))
export const redirects: NextConfig['redirects'] = async () => [
  {
    source: '/user/:id(\\d+)',
    destination: '/user/:id/about',
    permanent: true,
  },
  {
    source: '/team/:slug*',
    destination: '/publisher/:slug*',
    permanent: true,
  },
  {
    source: '/customization/feed',
    destination: 'customization/feed/avatar',
    permanent: true,
  },
  {
    source: '/manga/top-100/:slug*',
    destination: '/manga/top/:slug*',
    permanent: true,
  },
  {
    source: '/clubs/:slug*',
    destination: '/guild/:slug*',
    permanent: true,
  },

  {
    source: '/posts/:slug*',
    destination: '/forum/:slug*',
    permanent: true,
  },
  {
    source: '/forum/posts/:slug*',
    destination: '/forum/:slug*',
    permanent: true,
  },
  // {
  //     source: '/social/:slug*',
  //     destination: '/auth/social/:slug*',
  //     permanent: false,
  // },
  // {
  //     source: '/auth/social/:slug*',
  //     destination: '/social/:slug*',
  //     permanent: false,
  // },
  { source: '/forum', destination: '/forum/feed', permanent: true },
  {
    source: '/user/settings',
    destination: '/user/settings/profile',
    permanent: true,
  },
  {
    source: `/user/:id(\\d+)/posts`,
    destination: `/user/:id(\\d+)/social/posts`,
    permanent: true,
  },
  {
    source: `/user/:id/exchanges`,
    destination: `/user/:id/social/exchanges`,
    permanent: true,
  },
  {
    source: `/user/:id/friends-requests`,
    destination: `/user/:id/social/friends-requests`,
    permanent: true,
  },
  {
    source: `/user/:id/subscriptions`,
    destination: `/user/:id/social/subscriptions`,
    permanent: true,
  },
  {
    source: `/user/:id/comments`,
    destination: `/user/:id/social/comments`,
    permanent: true,
  },
  {
    source: `/user/:id/subscription`,
    destination: `/user/subscription`,
    permanent: true,
  },
];
