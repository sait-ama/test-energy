import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { BillingRepository } from '~entities/billing/model/repository';
import { PaypalActionType } from '~shared/api/models/billing';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const middleware = async (request: NextRequest) => {
  const searchParams = new URLSearchParams(request.nextUrl.search);

  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(
      UrlFormatter.createUrl(
        request.nextUrl.pathname,
        Routing.Home.main({
          query: {
            __notification: {
              type: 'toast',
              severity: 'error',
              message: 'Не передан token, обратитесь в поддержку',
            },
          },
        })
      )
    );
  }

  if (request.nextUrl.pathname.includes(PaypalActionType.CAPTURE)) {
    try {
      await BillingRepository.paypalAction({
        data: {
          action: PaypalActionType.CAPTURE,
          token,
        },
      });
      return NextResponse.redirect(
        UrlFormatter.createUrl(
          request.nextUrl.pathname,
          Routing.Home.main({
            query: {
              __notification: {
                type: 'toast',
                severity: 'error',
                message: 'Платеж успешно обработан',
              },
            },
          })
        )
      );
    } catch (e: unknown) {
      logger.error(e);

      return NextResponse.redirect(
        UrlFormatter.createUrl(
          request.nextUrl.pathname,
          Routing.Home.main({
            query: {
              __notification: {
                type: 'toast',
                severity: 'error',
                message: 'Произошла ошибка при обработке платежа',
              },
            },
          })
        )
      );
    }
  }

  if (request.nextUrl.pathname.includes(PaypalActionType.CANCEL)) {
    try {
      await BillingRepository.paypalAction({
        data: {
          action: PaypalActionType.CANCEL,
          token,
        },
      });
      return NextResponse.redirect(
        UrlFormatter.createUrl(
          request.nextUrl.pathname,
          Routing.Home.main({
            query: {
              __notification: {
                type: 'toast',
                severity: 'error',
                message: 'Платеж успешно отменен',
              },
            },
          })
        )
      );
    } catch (e: unknown) {
      logger.error(e);

      return NextResponse.redirect(
        UrlFormatter.createUrl(
          request.nextUrl.pathname,
          Routing.Home.main({
            query: {
              __notification: {
                type: 'toast',
                severity: 'error',
                message: 'Произошла ошибка при отмене платежа',
              },
            },
          })
        )
      );
    }
  }

  return NextResponse.next();
};

export const config = {
  include: /^\/payments\/paypal\/(cancel|capture)$/,
};
