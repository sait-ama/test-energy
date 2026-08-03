'use client';

import {ComponentProps, ComponentPropsWithoutRef, FormEvent, lazy, MouseEvent, Suspense,} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useTheme} from 'next-themes';

import Activity from '@re/ui-kit/icons/activity';
import Coin from '@re/ui-kit/icons/coin';
import Cycle from '@re/ui-kit/icons/cycle';
import EditIcon from '@re/ui-kit/icons/edit';
import Feedback from '@re/ui-kit/icons/feedback';
import Premium from '@re/ui-kit/icons/premium';
import Ticket from '@re/ui-kit/icons/ticket';
import {Button, buttonVariants} from '@re/ui-kit/ui/button';
import {DropdownMenuSeparator} from '@re/ui-kit/ui/dropdown-menu';
import {Switch} from '@re/ui-kit/ui/switch';
import {ReText} from '@re/ui-kit/ui/text';
import {cn} from '@re/ui-kit/utils/cn';

import {useSiteConfig} from '~app/providers/site-config-provider';
import {FeedbackButtonAsync} from '~entities/feedback/ui/feedback.async';
import {UserAvatar} from '~entities/user/ui/user-avatar';
import {Routing} from '~shared/config/routing';
import {useBoolean} from '~shared/hooks/use-boolean';
import {useAccountModal} from '~shared/lib/account/use-account-modal';
import {AuthorizedLink} from '~shared/lib/auth/authorized-link';
import {useAuthModal} from '~shared/lib/auth/use-auth-modal';
import {useChargeModal} from '~shared/lib/charge/use-charge-modal';
import {useLogged} from '~shared/lib/session/use-logged';
import {useSession} from '~shared/lib/session/use-session';
import {TestProps} from '~shared/lib/test/utils/test-props';
import {useTourItem} from '~shared/lib/tour/items';
import {CookieService} from '~shared/utils/cookie-service';
import {UrlFormatter} from '~shared/utils/url-formatter';

const ChangePublisherOrderModal = lazy(() =>
    import(
        /* webpackChunkName: "ChangePublisherOrderModal" */ '~features/(publisher)/change-order/change-order'
        ).then((m) => ({
        default: m.ChangePublisherOrderModal,
    }))
);

export const UserAuthButtonMenuItem = () => {
    const {open: openAuthModal} = useAuthModal();

    return (
        <Button
            className="shrink-0"
            onClick={() => {
                openAuthModal();
            }}
        >
            Вход/Регистрация
        </Button>
    );
};

export type UserBalanceMenuItemProps = ComponentPropsWithoutRef<'button'> & {
    onClose?: () => void;
};

export const UserBalanceMenuItem = (props: UserBalanceMenuItemProps) => {
    const user = useSession()!;
    const {close} = useAccountModal();
    const {open} = useChargeModal();

    const handleOpenChargeModal = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        close();
        open();
    };

    return (
        <button
            onClick={handleOpenChargeModal}
            {...TestProps.id(`donate_menu_btn`)}
            className="flex w-full items-center justify-between"
            {...props}
        >
            <div className="flex items-center gap-2">
                <Coin size={16}/>
                <ReText size="xs" weight="semibold">
                    {parseInt(user.balance, 10)} монет
                </ReText>
            </div>
            <span
                className={buttonVariants({
                    size: 'sm',
                    className: 'px-4',
                })}
            >
        Пополнить
      </span>
        </button>
    );
};

export const UserDetailMenuItem = (props: ComponentProps<'a'>) => {
    const user = useSession()!;
    const coinsTourProps = useTourItem('profile-menu-coins');
    const ticketsTourProps = useTourItem('profile-menu-tickets');

    if (!user) return null;

    return (
        <Link
            prefetch={false}
            href={Routing.User.detail({params: {id: user?.id, tab: 'about'}})}
            {...props}
            {...TestProps.id(`profile_menu_btn`)}
            className={cn('flex w-full items-center justify-between gap-2', props.className)}
        >
            <div className="flex items-center gap-3">
                <UserAvatar
                    alt={user?.username ?? ''}
                    avatarSrc={user?.avatar?.high}
                    frameSrc={user?.frame?.high}
                    size={42}
                />

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <ReText className="text-foreground font-semibold hover:underline">
                            {user?.username}
                        </ReText>
                        {user?.is_premium ? <Premium size={16}/> : null}
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2" {...ticketsTourProps}>
                            <Ticket size={16}/>
                            <ReText size="xs">{user?.ticket_balance}</ReText>
                        </div>
                        <div className="flex items-center gap-1" {...coinsTourProps}>
                            <Activity size={16}/>
                            <ReText size="xs">{user?.coins}</ReText>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const UserClubs = () => {
    const user = useSession()!;
    const [expanded, toggleExpanded] = useBoolean();
    const {close} = useAccountModal();

    if (!user.clubs?.length) return null;

    const clubs = expanded ? user.clubs : user.clubs.slice(0, 3);

    return (
        <>
            <div className="my-3 flex flex-wrap gap-2 px-3">
                {clubs.map((it) => (
                    <Link
                        prefetch={false}
                        href={Routing.Club.clubByDir({params: {dir: it.dir, tab: 'about'}})}
                        key={it.dir}
                        onClick={close}
                        className={buttonVariants({variant: 'flat', color: 'default', size: 'xs'})}
                    >
                        {it.name}
                    </Link>
                ))}
                {user.clubs.length > 3 ? (
                    <Button
                        size="xs"
                        color="secondary"
                        className="cursor-pointer font-semibold"
                        onClick={toggleExpanded}
                    >
                        {expanded ? 'Свернуть' : 'Развернуть'}
                    </Button>
                ) : null}
            </div>
            <DropdownMenuSeparator/>
        </>
    );
};
export const UserPublishers = ({className}: { className?: string }) => {
    const user = useSession()!;
    const [expanded, toggleExpanded] = useBoolean();
    const {close} = useAccountModal();

    if (!user.publishers?.length) return null;

    const editButton = (
        <Button color="secondary" className="min-w-none size-[22px]" circle size="xs">
            <EditIcon size={12}/>
        </Button>
    );

    const publishers = expanded ? user.publishers : user.publishers.slice(0, 3);

    return (
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
            {publishers.map((it, idx) => (
                <Link
                    href={Routing.Publisher.detail({params: {dir: it.dir, tab: 'about'}})}
                    {...TestProps.id(`team_${idx}_menu_btn`)}
                    onClick={close}
                    key={it.dir}
                    prefetch={false}
                    className={buttonVariants({variant: 'flat', color: 'default', size: 'xs'})}
                >
                    {it.name}
                </Link>
            ))}
            <Suspense fallback={editButton}>
                <ChangePublisherOrderModal>{editButton}</ChangePublisherOrderModal>
            </Suspense>
            {user.publishers.length > 3 ? (
                <Button
                    size="xs"
                    color="secondary"
                    className="cursor-pointer font-semibold"
                    onClick={toggleExpanded}
                >
                    {expanded ? 'Свернуть' : 'Развернуть'}
                </Button>
            ) : null}
        </div>
    );
};

export const useShowSubscription = () => {
    const {can_buy_premium_type} = useSession()!;

    return !!can_buy_premium_type;
};

export const UserSubscriptionMenuItem = () => {
    const show = useShowSubscription();
    const {is_premium} = useSession()!;

    if (!show) return null;

    return (
        <Link prefetch={false} href={Routing.User.subscription()}>
            <div
                className="from-primary/80 to-primary relative mb-2 flex h-16 w-full overflow-hidden rounded-sm bg-gradient-to-r">
                <Image
                    width="93"
                    height="93"
                    src="/subscription/subscribeMedal.webp"
                    alt="Medal"
                    className={cn(
                        'absolute top-0 left-20 translate-y-1/3 opacity-[0.2] dark:opacity-[0.011]'
                    )}
                />
                <Image
                    width="60"
                    height="60"
                    src="/subscription/subscribeStar.webp"
                    alt="Medal"
                    className={cn(
                        'absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 opacity-[0.2] dark:opacity-[0.2]'
                    )}
                />
                <Image
                    width="80"
                    height="80"
                    src="/subscription/subscribeStars.webp"
                    alt="Medal"
                    className={cn(
                        'absolute top-0 right-10 -translate-y-1/3 opacity-[0.2] dark:opacity-[0.2]'
                    )}
                />
                <Image
                    width="93"
                    height="93"
                    src="/subscription/subscribeShootingStar.webp"
                    alt="Medal"
                    className={cn(
                        'absolute top-0 bottom-0 -translate-x-1/3 -translate-y-1/3 opacity-[0.2] dark:opacity-[0.2]'
                    )}
                />

                <div className="flex flex-col justify-center px-4">
                    <ReText size="md" weight="semibold" color="primary-foreground" className="m-0">
                        {is_premium ? 'Мой Premium' : 'Активировать Premium'}
                    </ReText>
                    <ReText color="primary-foreground" size="xs" className="m-0">
                        Больше возможностей с подпиской
                    </ReText>
                </div>
            </div>
        </Link>
    );
};
export const ToggleThemeMenuItem = () => {
    const {setTheme, resolvedTheme} = useTheme();

    const handleToggleTheme = (e: FormEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div
            className="flex w-full items-center justify-between"
            {...TestProps.id(`theme_menu_btn`)}
            onClick={handleToggleTheme}
        >
            Тёмная тема
            {/*todo: refactor to Theme enum */}
            <Switch checked={resolvedTheme === 'dark'}/>
        </div>
    );
};

export const ToggleVersionMenuItem = () => {
    const {features} = useSiteConfig();

    if (!features.OLD_VERSION_SWITCH) return null;

    const handleToggleTheme = (e: FormEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        CookieService.set('site-version', 'old');
        window.location.href = '/';
    };

    return (
        <div className="flex w-full items-center justify-between" onClick={handleToggleTheme}>
            Вернуться на старую версию <Cycle size={20}/>
        </div>
    );
};

export const YearSummaryMenuItem = () => {
    const isLogged = useLogged();

    if (!isLogged) return null;

    return (
        <AuthorizedLink
            href={Routing.YearSummary.main()}
            className="relative block overflow-hidden rounded-sm bg-[linear-gradient(90deg,#CD476A_0%,#473BAB_100%)] p-4 transition-opacity duration-300 hover:opacity-70"
        >
            {/*<Image*/}
            {/*    draggable={false}*/}
            {/*    width={30}*/}
            {/*    height={30}*/}
            {/*    className="absolute right-0 top-0 select-none"*/}
            {/*    alt="snowflake icon"*/}
            {/*    src="/assets/year-summary/menu/right-snowflake.png"*/}
            {/*/>*/}
            {/*<Image*/}
            {/*    draggable={false}*/}
            {/*    width={30}*/}
            {/*    height={30}*/}
            {/*    className="absolute bottom-0 left-0 select-none"*/}
            {/*    alt="snowflake icon"*/}
            {/*    src="/assets/year-summary/menu/left-snowflake.png"*/}
            {/*/>*/}
            <Image
                draggable={false}
                width={218}
                height={80}
                className="absolute top-0 right-0 select-none"
                alt="snowflake icon"
                src={UrlFormatter.media('/year-summary/menu/right-snowflakes-bg.png')}
            />
            <Image
                draggable={false}
                width={218}
                height={80}
                className="absolute top-0 left-0 select-none"
                alt="snowflake icon"
                src={UrlFormatter.media('/year-summary/menu/left-snowflakes-bg.png')}
            />
            <ReText weight="semibold" size="md" className="relative !text-white">
                Итоги года
            </ReText>
        </AuthorizedLink>
    );
};
export const UserFeedbackMenuItem = () => {
    return (
        <FeedbackButtonAsync
            style={{margin: 2, padding: 16}}
            className="flex w-full justify-between"
            variant="ghost"
            endIcon={<Feedback/>}
        />
    );
};
