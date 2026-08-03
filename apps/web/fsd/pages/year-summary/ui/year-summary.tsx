'use client';

import { memo, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import ArrowLeftIcon from '@re/ui-kit/icons/arrow-left';
import ArrowRightIcon from '@re/ui-kit/icons/arrow-right';
import Brand from '@re/ui-kit/icons/brand';
import DzenStarIcon from '@re/ui-kit/icons/dzen-star';
import ForwardIcon from '@re/ui-kit/icons/forward';
import PauseIcon from '@re/ui-kit/icons/pause';
import PlayIcon from '@re/ui-kit/icons/play';
import StarIcon from '@re/ui-kit/icons/star';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { useYearSummaryAll, useYearSummaryByUser } from '~entities/year-summary/model/queries';
import {
  StoriesBackdrop,
  StoriesItem,
  StoriesItemContent,
  StoriesOverlay,
  StoriesRoot,
  useStoriesPlayback,
} from '~features/stories/ui/stories';
import type { YearSummaryAllFieldTypes } from '~shared/api/models/year-summary';
import Person from '~shared/assets/placeholders/person';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface TitlesStoryProps {
  title: string;
  subtitle?: string;
  field: YearSummaryAllFieldTypes;
}

const useIsPersonalResults = (): boolean => {
  const params = useParams<{ id: string }>();
  const session = useSession();

  //@ts-ignore
  const isPersonalResults = params?.id == session?.id;

  return isPersonalResults;
};

const TitleStory = ({ title, field }: TitlesStoryProps) => {
  const { data: summaryAllData } = useYearSummaryAll({ variables: {} });

  const titles = summaryAllData?.titles?.[field] || [];
  const [title1, title2, title3] = titles;

  return (
    <div className="flex w-full flex-col items-center">
      <Link href={Routing.YearSummary.titles()}>
        <div className="relative h-[341px] w-[256px]">
          <div className="absolute right-0 bottom-0">
            <div className="after:bg-background relative h-[285px] w-[190px] overflow-hidden rounded-xs after:absolute after:inset-0 after:size-full after:opacity-[70%]">
              <Image
                draggable={false}
                fill
                alt="story image"
                src={UrlFormatter.media(title3?.cover.mid)}
              />
            </div>
          </div>
          <div className="absolute top-[33px] left-0">
            <div className="after:bg-background relative h-[285px] w-[190px] overflow-hidden rounded-xs after:absolute after:inset-0 after:size-full after:opacity-[70%]">
              <Image
                draggable={false}
                fill
                alt="story image"
                src={UrlFormatter.media(title2?.cover.mid)}
              />
            </div>
          </div>
          <div className="absolute top-0 left-[36px]">
            <div className="relative h-[285px] w-[190px] overflow-hidden rounded-xs">
              <Image
                draggable={false}
                fill
                alt="story image"
                src={UrlFormatter.media(title1?.cover.mid)}
              />
            </div>
          </div>
        </div>
        <ReText align="center" weight="semibold" size="lg" className="mt-5">
          &quot;{title1?.main_name}&quot;
        </ReText>
      </Link>
      <ReText align="center" weight="semibold" className="mt-3 !text-2xl sm:!text-3xl">
        {title}
      </ReText>
    </div>
  );
};

interface UserStoryImageProps {
  src: string;
  className?: string;
}

const UserStoryImage = (props: UserStoryImageProps) => {
  const { src, className } = props;

  return (
    <div className={cn('w-[213px] sm:w-[250px]', className)}>
      <Image
        priority
        draggable={false}
        width={285}
        height={380}
        alt="story image"
        src={src}
      ></Image>
    </div>
  );
};

interface UserStoryTitleTextProps {
  children: ReactNode;
}

const UserStoryTitleText = (props: UserStoryTitleTextProps) => {
  const { children } = props;

  return (
    <ReText align="center" weight="semibold" className="!text-2xl sm:!text-3xl">
      {children}
    </ReText>
  );
};

interface UserStorySubtitleTextProps {
  children: ReactNode;
}

const UserStorySubtitleText = (props: UserStorySubtitleTextProps) => {
  const { children } = props;

  return (
    <ReText align="center" weight="semibold" size="lg" className="mt-3">
      {children}
    </ReText>
  );
};

const ChapterProgressStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams().id;

  const isPersonalReults = useIsPersonalResults();

  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const yearTotals = userStats?.year_totals;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage src={UrlFormatter.media('public/year-summary/anime-4elik-1.png')} />
      <UserStoryTitleText>{t('n глав', { count: yearTotals?.views ?? 0 })}</UserStoryTitleText>
      <UserStorySubtitleText>
        было {isPersonalReults ? 'тобой' : ''} прочитано
      </UserStorySubtitleText>
    </div>
  );
};

const CategoriesProgressStory = () => {
  const userId = useParams().id;
  const isPersonalReults = useIsPersonalResults();
  const contentType = useContentType();

  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const categories = userStats?.categories || [];
  const [topCategory] = categories;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage src={UrlFormatter.media('public/year-summary/anime-4elik-3.png')} />

      <UserStoryTitleText>{topCategory?.name}</UserStoryTitleText>
      <UserStorySubtitleText>
        {isPersonalReults ? 'твоя' : ''} любимая категория
      </UserStorySubtitleText>

      <div className="mt-5 flex flex-wrap justify-center gap-2 px-2 md:w-1/2">
        {Array.from({ length: 5 }, (_, index) => categories[index]).map((category) => (
          <Button
            color="secondary"
            size="sm"
            key={category!.id}
            endIcon={
              <ReText component="span" size="xs" color="primary">
                {category!.views_count}
              </ReText>
            }
          >
            <Link
              target="_blank"
              href={Routing.Title.catalog({
                params: { content: contentType },
                query: { categories: category!.id },
              })}
            >
              {category!.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
const GenreProgressStory = () => {
  const userId = useParams().id;
  const contentType = useContentType();

  const isPersonalResults = useIsPersonalResults();

  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const genres = userStats?.genres || [];
  const [topGenre] = genres;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage src={UrlFormatter.media('public/year-summary/anime-4elik-4.png')} />
      <UserStoryTitleText>{topGenre?.name}</UserStoryTitleText>
      <UserStorySubtitleText>{isPersonalResults ? 'твой' : ''} любимый жанр</UserStorySubtitleText>

      <div className="mt-5 flex flex-wrap justify-center gap-2 px-2 md:w-1/2">
        {Array.from({ length: 5 }, (_, index) => genres[index]).map((genre) => (
          <Button
            asChild
            color="secondary"
            size="sm"
            key={genre!.id}
            endIcon={
              <ReText component="span" size="xs" color="primary">
                {genre!.views_count}
              </ReText>
            }
          >
            <Link
              target="_blank"
              href={Routing.Title.catalog({
                params: { content: contentType },
                query: { genres: genre!.id },
              })}
            >
              {genre!.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

const RatingStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams().id;
  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const rating = userStats?.rating;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage src={UrlFormatter.media('public/year-summary/anime-4elik-2.png')} />

      <UserStoryTitleText>
        Средняя оценка
        <span className="inline-flex items-center gap-2">
          {rating?.avg} <StarIcon size={40} className="text-warning w-xl sm:w-3xl" />
        </span>
      </UserStoryTitleText>
      <UserStorySubtitleText>
        {t('из n поставленных оценок', { count: rating?.count ?? 0 })}
      </UserStorySubtitleText>
    </div>
  );
};

const CommentLikesStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams().id;

  const isPersonalReults = useIsPersonalResults();

  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const comments = userStats?.comments;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage
        src={UrlFormatter.media('public/year-summary/anime-4elik-6.png')}
        className="-mb-[50px]"
      />

      <UserStoryTitleText>{t('n лайков', { count: comments?.likes ?? 0 })}</UserStoryTitleText>
      <UserStorySubtitleText>
        поставили на {isPersonalReults ? 'твои' : ''} комментарии{' '}
      </UserStorySubtitleText>
    </div>
  );
};

const CommentCountStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams().id;

  const isPersonalReults = useIsPersonalResults();

  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const comments = userStats?.comments;

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage src={UrlFormatter.media('public/year-summary/anime-4elik-5.png')} />
      <UserStoryTitleText>
        {t('n комментариев', { count: comments?.count ?? 0 })}
      </UserStoryTitleText>
      <UserStorySubtitleText>{isPersonalReults ? 'тобой' : ''} написано</UserStorySubtitleText>
    </div>
  );
};

const BookmarksStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams().id;
  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const bookmarks = userStats?.bookmarks || [];
  const totalCount = bookmarks.reduce((acc, value) => acc + value.bookmarks_count, 0);

  return (
    <div className="flex w-full flex-col items-center">
      <UserStoryImage
        src={UrlFormatter.media('public/year-summary/anime-4elik-7.png')}
        className="w-[180px] sm:w-[210px]"
      />
      <UserStoryTitleText>{t('n тайтлов', { count: totalCount })}</UserStoryTitleText>
      <UserStorySubtitleText>было добавлено в закладки</UserStorySubtitleText>

      <div className="mt-5 flex flex-wrap justify-center gap-2 px-2 md:w-1/2">
        {bookmarks.map((bookmark) => (
          <Button
            asChild
            color="secondary"
            size="sm"
            key={bookmark.id}
            endIcon={
              <ReText component="span" size="xs" color="primary">
                {bookmark.bookmarks_count}
              </ReText>
            }
          >
            <Link
              prefetch={false}
              target="_blank"
              href={Routing.User.bookmarks({ query: { type: bookmark.id } })}
            >
              {bookmark.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

const ShortSummaryStory = () => {
  const t = useTranslations('yearSummary');

  const userId = useParams<{ id: string }>().id;

  const isPersonalResults = useIsPersonalResults();

  const { data: user } = useUserSuspenseQuery(
    { variables: { params: { userId } } },
    { enabled: !isPersonalResults }
  );
  const { data: userStats } = useYearSummaryByUser({
    variables: { params: { userId: Number(userId) } },
  });

  const yearTotals = userStats?.year_totals;

  const bookmarks = userStats?.bookmarks || [];
  const totalBookmarksCount = bookmarks.reduce((acc, value) => acc + value.bookmarks_count, 0);

  const titleText = <>Итоги года</>;
  const subtitleText = isPersonalResults ? (
    <>
      Поделитесь с другими пользователями <br />
      своими результатами
    </>
  ) : (
    <>
      <span className="line-clamp-2 text-center">{user?.username}</span>
    </>
  );

  return (
    <div className="flex w-full flex-col items-center px-5">
      <div className="bg-background relative mb-5 flex h-[160px] w-full max-w-[400px] overflow-hidden rounded-[22px] border border-[#CD476A]">
        <Image
          className="right-lg absolute top-2 w-[140px]"
          priority
          draggable={false}
          width={285}
          height={380}
          alt="story image"
          src={UrlFormatter.media('public/year-summary/anime-4elik-7.png')}
        />
        <div className="relative flex flex-col justify-end gap-4 p-[20px]">
          <ReText weight="semibold" size="lg">
            Прочитано
          </ReText>
          <div className="flex h-[48px] items-center justify-start self-start rounded-full bg-[#CD476A] px-4">
            <ReText weight="semibold" size="lg" className="!text-white">
              {t('n глав', { count: yearTotals?.views ?? 0 })}
            </ReText>
          </div>
        </div>
      </div>
      <div className="bg-background relative mb-7 flex h-[160px] w-full max-w-[400px] justify-end overflow-hidden rounded-[22px] border border-[#473BAB]">
        <Image
          className="absolute top-2 left-0 w-[160px] -scale-x-100"
          priority
          draggable={false}
          width={285}
          height={380}
          alt="story image"
          src={UrlFormatter.media('public/year-summary/anime-4elik-4.png')}
        />
        <div className="relative flex max-w-[70%] flex-col justify-end gap-4 p-[20px]">
          <ReText
            weight="semibold"
            size="lg"
            className="m:self-start w-fit self-end text-end break-words sm:text-start"
          >
            В закладки добавлено
          </ReText>
          <div className="flex h-[48px] items-center justify-start self-end rounded-full bg-[#473BAB] px-4 sm:self-start">
            <ReText weight="semibold" size="lg" className="!text-white">
              {t('n тайтлов', { count: totalBookmarksCount })}
            </ReText>
          </div>
        </div>
      </div>
      <UserStoryTitleText>{titleText}</UserStoryTitleText>
      <UserStorySubtitleText>{subtitleText}</UserStorySubtitleText>
    </div>
  );
};

const UserIntroStory = () => {
  const params = useParams<{ id: string }>();

  const session = useSession();
  const { data: user } = useUserSuspenseQuery(
    { variables: { params: { userId: params?.id } } },
    { enabled: !!params.id }
  );
  const userImgSrc = user?.avatar?.high;

  const isPersonalResults = user?.id == session?.id;
  const titleText = isPersonalResults ? <>Твои итоги года</> : <>Итоги года</>;
  const subtitleText = isPersonalResults ? (
    <>Дальше идут твои личные итоги года!</>
  ) : (
    <>
      <span className="line-clamp-2 text-center">{user?.username}</span>
    </>
  );

  return (
    <div className="flex w-full flex-col items-center">
      <Link
        className="cursor-pointer"
        href={user ? Routing.User.detail({ params: { id: user.id, tab: 'about' } }) : '#'}
      >
        <div className="relative mb-[40px] flex h-[310px] w-[320px] justify-center">
          {userImgSrc ? (
            <Image
              className="right-md border-border absolute bottom-0 overflow-hidden rounded-[14px] border"
              src={UrlFormatter.media(userImgSrc)}
              alt="new-year-hat"
              width={230}
              height={230}
            />
          ) : (
            /* gif isnt playing with ImageRoot/ImageFallback :( */
            <div className="right-md border-border absolute bottom-0 flex size-[230px] items-center justify-center rounded-[14px] border">
              <Person size={230} />
            </div>
          )}
          <Image
            className="-left-md absolute top-0"
            src={UrlFormatter.media('public/year-summary/new-year-hat.webp')}
            alt="new-year-hat"
            width={290}
            height={270}
          />
        </div>
      </Link>
      <UserStoryTitleText>{titleText}</UserStoryTitleText>
      <UserStorySubtitleText>{subtitleText}</UserStorySubtitleText>
    </div>
  );
};

const AllIntroStory = () => (
  <div className="flex w-full flex-col items-center">
    <div className="relative mb-[40px] flex h-[280px] w-[310px] justify-center">
      <Brand className="right-md absolute bottom-0" size={230} />
      <Image
        className="-left-md absolute top-0"
        src={UrlFormatter.media('public/year-summary/new-year-hat.webp')}
        alt="new-year-hat"
        width={290}
        height={270}
      />
    </div>
    <UserStoryTitleText>Итоги 2024</UserStoryTitleText>
    <UserStorySubtitleText>
      Мы подготовили для тебя <br />
      результаты этого года
    </UserStorySubtitleText>
  </div>
);

const YearSummaryStoriesHeader = memo(() => {
  const { storyId } = useStoriesPlayback();
  const params = useParams<{ id: string }>();

  const session = useSession();
  const { data: user } = useUserSuspenseQuery(
    { variables: { params: { userId: params?.id } } },
    { enabled: !!params.id }
  );

  const isPersonalResults = user?.id == session?.id;

  const userResultsElement = isPersonalResults ? (
    <>Личные итоги</>
  ) : (
    <>
      Итоги
      <Link
        href={user ? Routing.User.detail({ params: { id: user.id, tab: 'about' } }) : '#'}
        className="cursor-pointer"
        title={`Профиль ${user?.username}`}
      >
        {user?.username || ''}
      </Link>
    </>
  );
  const siteResultsElement = <>Итоги сайта</>;
  const isUserResultsStory = storyId?.startsWith('user');

  return (
    <div className="absolute top-5 flex w-full items-center justify-between px-4">
      <Button asChild>
        <Link href={Routing.YearSummary.main()} target="_blank">
          Итоги 2024 года
        </Link>
      </Button>
      <ReText weight="semibold" component="h3" className="ml-2 inline-flex items-center gap-2">
        <DzenStarIcon />
        <span className="xs:max-w-[200px] xs:text-nowrap sm:xs:max-w-[400px] max-w-[150px] overflow-hidden text-ellipsis">
          {isUserResultsStory ? userResultsElement : siteResultsElement}
        </span>
      </ReText>
    </div>
  );
});

const YearSummaryStoriesActions = memo(() => {
  const { isPlaying, resume, pause, storyId } = useStoriesPlayback();
  const userId = useParams<{ id: string }>().id;

  const togglePlayState = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleShare = async () => {
    const slide = storyId.startsWith('user') ? storyId : undefined;
    const url = UrlFormatter.createUrl(
      window.location.origin,
      Routing.YearSummary.byUser({
        params: { id: userId },
        query: { slide },
      })
    );

    const toast = await importToastAsync();

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована');
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Не получилось скопировать значение');
    }
  };
  return (
    <div className="bottom-lg absolute flex w-full items-center justify-between px-4">
      <Button circle color="secondary" onClick={togglePlayState}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button circle onClick={handleShare}>
        <ForwardIcon />
      </Button>
    </div>
  );
});

const YearSummaryStoriesBackdrop = () => {
  return (
    <div className="after:bg-background after:absolute after:inset-0 after:size-full after:opacity-[40%]">
      <Image
        alt="story backdrop"
        width={800}
        height={560}
        src={UrlFormatter.media('public/year-summary/story-backdrop.png')}
      />
    </div>
  );
};

const YearSummaryStoriesNextButton = memo(() => {
  const { next, hasNext } = useStoriesPlayback();

  return (
    <Button
      onClick={next}
      disabled={!hasNext}
      circle
      color="secondary"
      className="absolute top-1/2 right-4"
    >
      <ArrowRightIcon />
    </Button>
  );
});

const YearSummaryStoriesPrevButton = memo(() => {
  const { prev, hasPrev } = useStoriesPlayback();

  return (
    <Button
      onClick={prev}
      disabled={!hasPrev}
      circle
      color="secondary"
      className="absolute top-1/2 left-4"
    >
      <ArrowLeftIcon />
    </Button>
  );
});

const StoriesSite = memo(() => {
  return (
    <>
      <StoriesItemContent id="all-intro" className="flex w-full items-center justify-center">
        <AllIntroStory />
      </StoriesItemContent>
      <StoriesItemContent
        id="all-title-comments"
        className="flex w-full items-center justify-center"
      >
        <TitleStory field="comments" title="Собрал больше всего комментариев" />
      </StoriesItemContent>
      <StoriesItemContent id="all-title-votes" className="flex w-full items-center justify-center">
        <TitleStory field="votes" title="Получил больше всего лайков" />
      </StoriesItemContent>
      <StoriesItemContent id="all-title-views" className="flex w-full items-center justify-center">
        <TitleStory field="views" title="Самый популярный тайтл в этом году" />
      </StoriesItemContent>
      <StoriesItemContent
        id="all-title-bookmarks"
        className="flex w-full items-center justify-center"
      >
        <TitleStory field="bookmarks" title="Больше всего закладок" />
      </StoriesItemContent>
    </>
  );
});

const StoriesUser = memo(() => (
  <>
    <StoriesItemContent id="user-intro" className="flex w-full items-center justify-center">
      <UserIntroStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-ukogobolshe" className="flex w-full items-center justify-center">
      <ChapterProgressStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-genres" className="flex w-full items-center justify-center">
      <GenreProgressStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-categories" className="flex w-full items-center justify-center">
      <CategoriesProgressStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-rating" className="flex w-full items-center justify-center">
      <RatingStory />
    </StoriesItemContent>
    <StoriesItemContent
      id="user-comments-count"
      className="flex w-full items-center justify-center"
    >
      <CommentCountStory />
    </StoriesItemContent>
    <StoriesItemContent
      id="user-comments-likes"
      className="flex w-full items-center justify-center"
    >
      <CommentLikesStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-bookmarks" className="flex w-full items-center justify-center">
      <BookmarksStory />
    </StoriesItemContent>
    <StoriesItemContent id="user-short-summary" className="flex w-full items-center justify-center">
      <ShortSummaryStory />
    </StoriesItemContent>
  </>
));

const allStats = [
  { id: 'all-intro' },
  { id: 'all-title-views' },
  { id: 'all-title-comments' },
  { id: 'all-title-votes' },
  { id: 'all-title-bookmarks' },
];
const userStats = [
  { id: 'user-intro' },
  { id: 'user-ukogobolshe' },
  { id: 'user-genres' },
  { id: 'user-categories' },
  { id: 'user-rating' },
  { id: 'user-comments-count' },
  { id: 'user-comments-likes' },
  { id: 'user-bookmarks' },
  { id: 'user-short-summary' },
];

export const YearSummaryPage = memo(() => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const defaultSlide = searchParams.get('slide') ?? undefined;
  const session = useSession();

  //@ts-ignore
  const isPersonalResults = params?.id == session?.id;

  const items = [...(isPersonalResults ? allStats : []), ...userStats];

  return (
    <StoriesRoot
      defaultStory={defaultSlide}
      playOnInit={!defaultSlide}
      items={items}
      className="mb:inset-y-0 fixed inset-y-[56px] w-full max-w-[500px] flex-[1] select-none md:static md:max-h-[80vh]"
    >
      <StoriesBackdrop className="">
        <YearSummaryStoriesBackdrop />
      </StoriesBackdrop>
      <StoriesItem>
        <StoriesSite />
        <StoriesUser />
      </StoriesItem>
      <StoriesOverlay>
        <YearSummaryStoriesHeader />
        <YearSummaryStoriesActions />
        <YearSummaryStoriesNextButton />
        <YearSummaryStoriesPrevButton />
      </StoriesOverlay>
    </StoriesRoot>
  );
});
