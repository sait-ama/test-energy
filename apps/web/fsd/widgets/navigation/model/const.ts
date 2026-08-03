import { Routing } from '~shared/config/routing';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const createCatalogNav = () =>
  [
    {
      key: 'card',
      href: Routing.Card.catalog(),
      img: UrlFormatter.media('public/header-nav/top-card.webp'),
    },
    // {
    //     title: 'Обменов (в разработке)',
    //     href: '', //Routing.Card.catalog(),
    //     children: 'для особо коллекционирующих карты.',
    //     disabled: true,
    //     img: UrlFormatter.media('public/header-nav/top-exchange.png'),
    // },
  ] as const;

export const createTopNav = () =>
  [
    {
      key: 'users',
      href: Routing.User.top(),
      img: UrlFormatter.media('public/header-nav/top-user.webp'),
    },
    {
      key: 'guild',
      href: Routing.Club.top(),
      img: UrlFormatter.media('public/header-nav/top-guild.webp'),
    },
  ] as const;
