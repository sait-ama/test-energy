import type { ComponentProps, ReactNode } from 'react';
import type { LinkProps } from 'next/link';

import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { UpdateCardCollectionParamsSchema } from '~shared/api/models/card-collections';
import type { OrderingSorts } from '~shared/api/models/post';
import type { SearchField } from '~shared/api/models/search';
import type { ShopItemTypes } from '~shared/api/models/shop';
import type { UserTopOrdering } from '~shared/api/models/user';
import { ContentTypes } from '~shared/config/constants';
import { EventDateType } from '~shared/lib/event-management/get-event';
import type { LogicalBinaryTypeIsomorphic } from '~shared/types/buisines';
import { publicEnv } from '~shared/utils/env';
import { UrlBuilder, UrlFormatter } from '~shared/utils/url-formatter';

export interface RoutingLinkProps
  extends Omit<LinkProps, 'href'>,
    Omit<ComponentProps<'a'>, 'href' | 'dir' | 'content'> {
  children: ReactNode;
}

export namespace Routing {
  export namespace ManageCardCollections {
    export const create = ({
      query,
    }: EndpointMeta<
      void,
      {
        name: string;
      }
    >) => new UrlBuilder('/user/card-collection/add/').query(query).build();
    export const edit = ({
      query,
      params,
    }: EndpointMeta<Pick<UpdateCardCollectionParamsSchema, 'collection_id'>, void>) =>
      new UrlBuilder(`/user/card-collection/${params!.collection_id}/update/`).query(query).build();
  }
  export namespace Upgrade {
    export const main = () => new UrlBuilder('/user/inventory/cards-upgrade/').build();
  }
  export namespace Quiz {
    export interface QuizDetailVariables {
      params: {
        id: string;
      };
      query?: {};
    }

    export const detail = (opts: QuizDetailVariables) =>
      new UrlBuilder(`/quiz/${opts.params.id}/`).build();

    export interface QuizEditVariables {
      params: {
        id: string;
      };
      query?: {};
    }
    export const edit = (opts: QuizEditVariables) =>
      new UrlBuilder(`/quiz/${opts.params.id}/edit`).build();

    export const create = () => new UrlBuilder('/quiz/add/').build();
  }
  export namespace Moment {
    export const shorts = () => '/moment/shorts';

    export interface MomentDetailVariables {
      params: {
        dir: string;
      };
      query?: {};
    }

    export const detail = (variables: MomentDetailVariables) => `/moment/${variables.params.dir}`;
  }

  export namespace Home {
    export interface Notification {
      type: 'toast';
      message: string;
      severity: 'error' | 'success' | 'info' | 'warning';
    }

    export interface HomeRouteVariables {
      query?: {
        __notification: Notification;
      };
    }

    export const main = ({ query }: HomeRouteVariables) => {
      const query_: any = query;

      if (query_?.__notification) {
        query_.__notification = JSON.stringify(query_.__notification);
      }

      return UrlFormatter.addQuery('/', query_);
    };
  }
  export namespace EventsPromo {
    export const get = ({ event }: { event: Omit<EventDateType, ''> }) => {
      return `/${event}`;
    };
  }
  export namespace Character {
    export interface CharacterByIdRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
      query?: {};
    }

    export const main = ({ params }: CharacterByIdRouteVariables) => `/character/${params?.id}`;
    export const add = () => '/character/add';

    export interface EditCharacterByIdRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
      query?: {};
    }

    export const edit = ({ params }: EditCharacterByIdRouteVariables) =>
      `/character/${params.id}/edit`;
  }

  export namespace YearSummary {
    export const main = () => `/year-summary/`;

    export interface YearSummaryByUserRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
      query: {
        slide?: string;
      };
    }

    export const byUser = ({ params, query }: YearSummaryByUserRouteVariables) =>
      new UrlBuilder(`/year-summary/${params.id}/`).query(query).build();
    export const titles = () => `/year-summary/titles/`;
  }

  export namespace Entry {
    export interface EntryRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const main = ({ params }: EntryRouteVariables) => `/entry/${params.id}`;
  }

  export namespace Deck {
    export interface DeckOpenRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const open = ({ params }: DeckOpenRouteVariables) => `/deck/${params.id}/open`;
  }

  export namespace Search {
    export interface SearchRouteVariables {
      query: {
        query?: string;
        field: SearchField;
      };
    }

    export const search = ({ query }: SearchRouteVariables) =>
      UrlFormatter.addQuery(UrlFormatter.createUrl('/search'), query);
  }

  export namespace Title {
    export enum TitleDetailTabs {
      MAIN = 'main',
      CHAPTERS = 'chapters',
    }

    export interface TitleAddVariables {
      params: {
        content: string;
      };
    }

    export const add = ({ params }: TitleAddVariables) => `/${params.content}/add`;

    export interface TitleChaptersEditVariables {
      params: {
        dir: string;
        tab: string;
        contentType: ContentTypes;
      };
    }

    export const chaptersEdit = ({ params }: TitleChaptersEditVariables) =>
      `/${params.contentType}/${params.dir}/edit/${params.tab}`;

    export interface TitleAddBundleVariables {
      query: unknown;
      params: {
        contentType: ContentTypes;
        dir: string;
      };
    }

    export const addBundle = ({ query, params }: TitleAddBundleVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/${params.contentType}/${params.dir}/add/bundle`),
        query
      );

    export interface TitleAddChapterVariables {
      params: {
        contentType: ContentTypes;
        dir: string;
      };
      query: unknown;
    }

    export const addChapter = ({ params, query }: TitleAddChapterVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/${params.contentType}/${params.dir}/add/chapter`),
        query
      );

    export interface TitleSimilarVariables {
      params: {
        dir: string;
        content: ContentTypes;
      };
    }

    export const similar = ({ params }: TitleSimilarVariables) =>
      UrlFormatter.createUrl(`/${params.content}/${params.dir}/similar`);

    export interface TitleListVariables {
      params: {
        content: ContentTypes;
        id: NumberIsomorphic;
      };
      query?: unknown;
    }

    export const list = ({ query, params }: TitleListVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/${params.content}`, 'list', params.id),
        query || {}
      );

    export interface TitleHotVariables {
      params: {
        content: ContentTypes;
      };
      query?: unknown;
    }

    export const hot = ({ params, query }: TitleHotVariables) =>
      UrlFormatter.addQuery(UrlFormatter.createUrl(`/${params.content}`, 'hot-updates'), query);

    export interface TitleDetailVariables {
      params: {
        dir: string;
        tab?:
          | 'main'
          | 'chapters'
          | 'moments'
          | 'cards'
          | 'comments'
          | 'characters'
          | 'posts'
          | 'voiceover';
        content: ContentTypes;
      };
    }

    export const detail = ({ params }: TitleDetailVariables) =>
      UrlFormatter.createUrl(`/${params.content}`, params.dir, params.tab);

    export interface TitleCatalogVariables {
      params: {
        content: ContentTypes;
      };
      query?: unknown;
      normalizedParams?: Record<string, SingleOrMultiOf<string | number>>;
    }

    export const catalog = ({ params, query, normalizedParams }: TitleCatalogVariables) =>
      new UrlBuilder(`/${params.content}`)
        .addNormalizedParams(normalizedParams)
        .query(query || {})
        .build();

    export interface TitleTopVariables {
      params: {
        content: ContentTypes;
        tab?: string;
      };
      query?: unknown;
    }

    export const top = ({ query, params }: TitleTopVariables) =>
      UrlFormatter.addQuery(UrlFormatter.createUrl(`/${params.content}`, 'top', params.tab), query);

    export interface TitleEditVariables {
      params: {
        content: ContentTypes;
        dir: string;
      };
      query?: unknown;
    }

    export const edit = ({ params, query }: TitleEditVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/${params.content}`, params.dir, 'edit'),
        query
      );

    export interface TitleEditChaptersVariables {
      params: {
        content: ContentTypes;
        dir: string;
      };
      query?: unknown;
    }

    export const editChapters = ({ params, query }: TitleEditChaptersVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/${params.content}`, params.dir, 'edit', 'chapters'),
        query
      );
  }

  export namespace Chapter {
    export interface ChapterRouteVariables {
      query?: {
        page?: number;
      };
      params: {
        titleDir: string;
        content: ContentTypes;

        id: NumberIsomorphic;
      };
    }

    export const main = ({ params, query }: ChapterRouteVariables) => {
      if (params.content === ContentTypes.SERIES) {
        return new UrlBuilder()
          .add(`/${params.content}`)
          .add(params.titleDir)
          .add('watch')
          .query({
            query,
            episode: params.id,
          })
          .build();
      }

      return new UrlBuilder()
        .add(`/${params.content}`)
        .add(params.titleDir)
        .add(String(params.id))
        .query(query)
        .build();
    };

    export type ChapterEditVariables = any;

    // TODO: FIX ME
    export const editChapter = ({ chapterId, branchId }: ChapterEditVariables) =>
      new UrlBuilder().add(`chapters/${chapterId}/`).query({ branch: branchId }).build();

    export interface ChapterAddVariables {
      params: {
        content: ContentTypes;
        titleDir: string;
      };
      query: {
        branchId: NumberIsomorphic;
      };
    }

    export const add = ({ params, query }: ChapterAddVariables) =>
      new UrlBuilder()
        .add(params.content)
        .add(params.titleDir)
        .add('chapter/add')
        .query(query)
        .build();
  }

  export namespace Collection {
    export const main = () => '/collections/';
    export const add = () => '/collections/add/';

    export interface UpdateCollectionVariables {
      params: {
        id: NumberIsomorphic;
      };
      query?: {};
    }

    export const update = ({ params }: UpdateCollectionVariables) =>
      `/collections/${params.id}/edit/`;

    export interface GetCollectionVariables {
      params: {
        id: NumberIsomorphic;
      };
      query?: {};
    }

    export const getByID = ({ params }: GetCollectionVariables) => `/collections/${params.id}/`;

    export interface CollectionListVariables {
      params?: {};
      query?: {
        user_id?: NumberIsomorphic;
      };
    }

    export const list = (variables: CollectionListVariables) =>
      new UrlBuilder(Collection.main()).query(variables?.query).build();
  }

  export namespace Badge {
    export interface BadgeDetailRouteVariables {
      params: {
        id: string | number;
      };
    }

    export const detail = ({ params }: BadgeDetailRouteVariables) =>
      UrlFormatter.createUrl('/badge', params.id);

    export const allList = () => UrlFormatter.createUrl('/badge');
  }

  export namespace User {
    export const promocode = () => '/user/promocode';
    export const billing = () => '/user/billing';
    export const deactivate = () => '/user/delete';
    export type SubTypes = {
      social: 'exchanges' | 'friends-requests' | 'posts' | 'subscriptions' | 'comments';
    };
    export const socialsArr = [
      'exchanges',
      'friends-requests',
      'posts',
      'subscriptions',
      'comments',
    ] as const;
    export const socials = new Set(socialsArr);

    export interface UserDetailedRouteVariables<T extends string> {
      params: {
        tab?: T;
        id: NumberIsomorphic;
        subTab?: SubTypes[T];
      };
      query?: unknown;
    }

    export const detail = <T extends string>({ params, query }: UserDetailedRouteVariables<T>) => {
      return UrlFormatter.addQuery(
        UrlFormatter.createUrl('/user', params.id, params.tab, params.subTab),
        query
      );
    };

    export interface UserCreateExchangeRouteVariables {
      params: {
        id: string | number;
      };
      query?: unknown;
    }

    export const createExchange = ({ params, query }: UserCreateExchangeRouteVariables) =>
      UrlFormatter.addQuery(UrlFormatter.createUrl('/user', params.id, 'create/exchange'), query);

    export interface UserSettingsRouteVariables {
      params: {
        tab: string;
      };
    }

    export const settings = ({ params }: UserSettingsRouteVariables) =>
      UrlFormatter.createUrl('/user', 'settings', params.tab);

    export interface UserBookmarksVariables {
      query: unknown;
    }

    export const bookmarks = ({ query }: UserBookmarksVariables) =>
      new UrlBuilder('/user/bookmarks').query(query || {}).build();

    export interface UserNotificationsRouteVariables {
      params: {
        tab?: NumberIsomorphic;
      };
      query?: unknown;
    }

    export const notifications = ({ params, query }: UserNotificationsRouteVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl('/user/notifications', params.tab || '0'),
        query || {}
      );

    export interface ChatRouteVariables {
      params?: {
        chatId: number | string;
      };
    }

    export const chat = (props: ChatRouteVariables) => {
      const { params } = props ?? {};
      return UrlFormatter.createUrl(`/chat${params?.chatId ? '#' + params.chatId : ''}`);
    };

    export const top = () => UrlFormatter.createUrl('/user/top');

    export interface UserTopRouteVariables {
      params: {
        tab: UserTopOrdering;
      };
    }

    export const topDetail = ({ params }: UserTopRouteVariables) =>
      UrlFormatter.createUrl('/user/top', params.tab);

    export interface AchievementsRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const achievements = ({ params }: AchievementsRouteVariables) =>
      `/user/${params.id}/achievements`;

    export interface BadgesRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const badges = ({ params }: BadgesRouteVariables) => `/user/${params.id}/badges`;

    export interface FollowersRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const followers = ({ params }: FollowersRouteVariables) =>
      `/user/${params.id}/followers`;

    export interface SubscriptionRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const subscription = () => `/user/subscription`;

    export interface FriendsRouteVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const friends = ({ params }: FriendsRouteVariables) => `/user/${params.id}/friends`;

    export const history = () => `/user/history`;

    export namespace Battlepass {
      export const info = () => '/user/battlepass/info';
      export const tasks = () => '/user/battlepass/tasks';
      export const rewards = () => '/user/battlepass/rewards';

      export namespace Games {
        export const puzzle = () => '/user/battlepass/games/puzzle';
        export const memory = () => '/user/battlepass/games/memory';
        export const quiz = () => '/user/battlepass/games/quiz';
        export const findDifference = () => '/user/battlepass/games/difference';
      }
    }

    export interface UserRequestsVariables {
      query?: unknown;
    }

    export const requests = ({ query }: UserRequestsVariables) =>
      UrlFormatter.addQuery('/user/requests', query);
  }

  export namespace Creator {
    export interface CreatorDetailVariables {
      params: {
        id: NumberIsomorphic;
      };
    }

    export const detail = ({ params }: CreatorDetailVariables) =>
      UrlFormatter.createUrl('/creator', params.id);

    export const add = () => '/creator/add';
  }

  export namespace Publisher {
    export type ProfileTab =
      | 'about'
      | 'titles'
      | 'feed'
      | 'advertisement'
      | 'comments'
      | 'strikes'
      | 'posts'
      | 'contract'
      | 'statistic';

    export interface PublisherDetailVariables {
      params: {
        dir: string;
        tab?: ProfileTab;
      };
    }

    export const detail = ({ params }: PublisherDetailVariables) =>
      UrlFormatter.createUrl('/publisher', params.dir, params.tab);
    export type SettingsTab =
      | 'monetization'
      | 'something'
      | 'profile'
      | 'members'
      | 'documents'
      | 'social';

    export interface PublisherSettingsVariables {
      params: {
        dir: string;
        tab?: SettingsTab;
      };
    }

    export const settings = ({ params }: PublisherSettingsVariables) =>
      UrlFormatter.createUrl('/publisher', params.dir, 'settings/', params.tab);

    export const add = () => '/publisher/add';

    export interface PublisherAdDetailsVariables {
      params: {
        dir: string;
        titleDir: string;
      };
      query?: {
        promo?: string;
      };
    }

    export const adDetails = ({ params, query }: PublisherAdDetailsVariables) =>
      new UrlBuilder()
        .add('/publisher')
        .add(params.dir)
        .add('/advertisement')
        .add(params.titleDir)
        .query(query)
        .build();
  }

  export namespace Card {
    export interface CardEditVariables {
      params: { id: NumberIsomorphic };
    }

    export const edit = ({ params }: CardEditVariables) =>
      UrlFormatter.createUrl(`/card/${params.id}/edit`);

    export interface CardAddVariables {
      query: unknown;
    }

    export const add = ({ query }: CardAddVariables) =>
      UrlFormatter.addQuery(UrlFormatter.createUrl(`/card/add`), query);

    export const id = ({ params }: CardEditVariables) =>
      UrlFormatter.createUrl(`/card/${params.id ?? params.cardId}`);

    export const catalog = (opts?: { query?: any }) => UrlFormatter.createUrl(`/card`, opts?.query);
  }

  export namespace Shop {
    export interface ShopCatalogVariables {
      params: {
        tab: 'feed' | 'pro';
        type?: ShopItemTypes;
      };
      query?: {
        item: string;
      };
    }

    export const catalog = ({ params, query }: ShopCatalogVariables) =>
      UrlFormatter.addQuery(
        UrlFormatter.createUrl(`/customization/${params.tab}/${params.type}`),
        query
      );
  }

  export namespace Social {
    export interface SocialMainVariables {
      query: unknown;
    }

    export const main = ({ query }: SocialMainVariables) => UrlFormatter.addQuery('/social', query);
  }

  export namespace Feedback {
    export const main = () => '/feedback';
  }

  export namespace Forum {
    export namespace ByDir {
      export interface EditPostVariables {
        params: { dir: string };
        query?: {
          tags?: NumberIsomorphic[];
          title?: NumberIsomorphic;
          publisher?: NumberIsomorphic;
          user?: NumberIsomorphic;
        };
      }

      export const edit = ({ query = {}, params: { dir } }: EditPostVariables) =>
        UrlFormatter.addQuery(`/forum/${dir}/edit`, query);

      export interface ByDirRouteVariables {
        params: {
          dir: string;
        };
      }

      export const get = ({ params }: ByDirRouteVariables) =>
        new UrlBuilder(`/forum/${params.dir}/`).build();
    }

    export namespace Create {
      export interface CreatePostVariables {
        query?: {
          tags?: NumberIsomorphic[];
          title?: NumberIsomorphic;
          publisher?: NumberIsomorphic;
          user?: NumberIsomorphic;
        };
      }

      export const create = ({ query = {} }: CreatePostVariables) =>
        UrlFormatter.addQuery('/forum/create/', query);
    }

    export namespace Feed {
      export interface ForumFeedVariables {
        query: {
          title?: NumberIsomorphic;
          publisher?: NumberIsomorphic;
          user?: NumberIsomorphic;
          week?: LogicalBinaryTypeIsomorphic;
          exclude_tag?: NumberIsomorphic | NumberIsomorphic[];
          search?: string;
          tags?: NumberIsomorphic[];
          ordering?: OrderingSorts;
        };
      }

      export const base = 'forum/feed';
      export const get = ({
        query: { ordering = '-id', week = false, ...query } = {},
      }: ForumFeedVariables) =>
        UrlFormatter.addQuery(`/${base}/`, { ...query, ordering, week: week ? 1 : 0 });
    }
  }

  export namespace Club {
    export const clubs = () => UrlFormatter.createUrl('/guilds/');

    export const add = () => UrlFormatter.createUrl('/guild/add/');

    export const top = () => UrlFormatter.createUrl('/guild/top');

    export interface SettingsByDirRouteVariables {
      params: {
        dir: string;
        tab: 'about' | 'members' | 'donations' | 'destroy';
      };
    }

    export const clubByDirSettings = ({ params }: SettingsByDirRouteVariables) =>
      UrlFormatter.createUrl(`/guild/${params.dir}/settings/${params.tab}`);

    export interface ByDirRouteVariables {
      params: {
        dir: string;
        tab: 'about' | 'requests' | 'posts' | 'upgrades' | 'boost';
      };
    }

    export interface RequestsByDirRouteVariables {
      params: {
        dir: string;
        tab: 'members' | 'items';
      };
    }

    export const clubByDirRequests = ({ params }: RequestsByDirRouteVariables) =>
      UrlFormatter.createUrl(`/guild/${params.dir}/requests/${params.tab}`);

    export const clubByDir = ({ params }: ByDirRouteVariables) =>
      UrlFormatter.createUrl(`/guild/${params.dir}/${params.tab}`);
  }

  export namespace BotBugReportTg {
    export interface BotBugReportVariables {
      query: {
        eventId: NumberIsomorphic;
        userId: NumberIsomorphic;
      };
    }

    export const get = ({ query }: BotBugReportVariables) => {
      return UrlFormatter.addQuery(publicEnv('BUG_REPORT_URL'), {
        start: btoa(`${query.userId || ''}_${query.eventId || ''}`),
      });
    };
  }
}
