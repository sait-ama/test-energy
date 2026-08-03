'use client';
import { useEffect } from 'react';
import Link from 'next/link';

import { Button, buttonVariants } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { SiteArticles } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { linkBaseVariants } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { CookieService } from '~shared/utils/cookie-service';

export function TelegramPromoToast() {
  const siteConfig = useSiteConfig();

  useEffect(() => {
    if (CookieService.get('promo-toast-tg')) return;
    setTimeout(() => {
      (async () => {
        const toast = await importToastAsync();

        toast('👀 Получай редкие карты и молнии просто так!', {
          id: 'promo-toast',
          duration: Infinity,
          dismissible: true,
          closeButton: true,
          onDismiss: () => {
            CookieService.set('promo-toast-tg', 'true');
          },
          toasterId: 'advertising',
          description: (
            <div className="flex flex-col gap-2">
              <ReText color="muted-foreground">
                Подпишись на&nbsp;
                <Link
                  prefetch={false}
                  href={siteConfig?.site.contacts?.social?.telegram ?? ''}
                  target="_blank"
                  className={linkBaseVariants()}
                >
                  наш телеграм
                </Link>
                &nbsp;и участвуй в розыгрышах карт, молний и тикетов!
              </ReText>
              <Link
                prefetch={false}
                href={siteConfig?.site.contacts?.social?.telegram ?? ''}
                target="_blank"
                className={buttonVariants({ size: 'sm', className: 'self-start px-2' })}
              >
                Подписаться
              </Link>
            </div>
          ),
        });
      })();
    }, 15_000);
  }, []);

  return null;
}

const COOKIE_CONSENT_KEY = 'cookie-accepted';

export function CookieConsentToast() {
  const siteConfig = useSiteConfig();

  const handleDismiss = () => {
    CookieService.set(COOKIE_CONSENT_KEY, 'true');
  };

  useEffect(() => {
    if (
      !siteConfig.articles?.[SiteArticles.COOKIE_USAGE] ||
      !siteConfig.articles?.[SiteArticles.CONFIDENTIALITY_AGREEMENT]
    )
      return;
    if (CookieService.get(COOKIE_CONSENT_KEY)) return;
    (async () => {
      const toast = await importToastAsync();

      toast('🍪 Мы используем cookie и обрабатываем ваши персональные данные!', {
        id: 'cookie-toast',
        duration: Infinity,
        dismissible: true,
        closeButton: true,
        onDismiss: handleDismiss,
        toasterId: 'advertising',
        description: (
          <div className="flex flex-col gap-2">
            <ReText color="muted-foreground" size="xs">
              Используя и просматривая сайт, вы даете согласие на&nbsp;
              <Link
                prefetch={false}
                href={Routing.Entry.main({
                  params: { id: siteConfig.articles?.[SiteArticles.PERSONAL_DATA_PROCESSING] },
                })}
                target="_blank"
                className={linkBaseVariants()}
              >
                обработку персональных данных
              </Link>
              . <br />
              Ознакомьтесь с{' '}
              <Link
                prefetch={false}
                href={Routing.Entry.main({
                  params: { id: siteConfig.articles?.[SiteArticles.CONFIDENTIALITY_AGREEMENT] },
                })}
                target="_blank"
                className={linkBaseVariants()}
              >
                политикой конфиденциальности
              </Link>
              &nbsp;и&nbsp;
              <Link
                prefetch={false}
                href={Routing.Entry.main({
                  params: { id: siteConfig.articles?.[SiteArticles.COOKIE_USAGE] },
                })}
                target="_blank"
                className={linkBaseVariants()}
              >
                политикой использования cookie-файлов
              </Link>
            </ReText>
            <Button
              variant="outline"
              className="self-end"
              size="sm"
              onClick={() => {
                toast.dismiss();
                handleDismiss();
              }}
            >
              Принимаю
            </Button>
          </div>
        ),
      });
    })();
  }, []);

  return null;
}
