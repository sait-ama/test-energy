import type { Ref } from 'react';
import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';
import { SmartCaptcha as SmartCaptchaInstance } from '@yandex/smart-captcha';
import Reaptcha from 'reaptcha';

import { useRequestState } from '~app/providers/request-state-provider';
import { ConnectionCountry } from '~shared/config/constants';
import { useAppearanceDelay } from '~shared/hooks/use-appearance-delay';
import { publicEnv } from '~shared/utils/env';

export type CaptchaType = Reaptcha;

export enum CaptchaStrategies {
  RECAPTCHA = 'recaptcha',
  SMARTCAPTCHA = 'smartcaptcha',
}

// TODO: вынести в lib - это не переиспользуемый компонент ui
const useRecaptcha = () => {
  const ref = useRef<CaptchaType>(null);
  const disabled = publicEnv('RECAPTCHA_DISABLED') === 'true';

  const getToken = async () => {
    if (disabled) return 'WITHOUT_TOKEN';

    return ref.current?.getResponse();
  };

  const reset = () => {
    if (disabled) return;

    void ref.current?.reset();
  };

  return {
    data: { ref },
    state: { disabled },
    actions: {
      reset,
      getToken,
    },
  };
};

const useSmartCaptcha = () => {
  const [smartCaptchaKey, setSmartCaptchaKey] = useState<string | null>(null);
  const [key, setKey] = useState(1);
  const disabled = publicEnv('RECAPTCHA_DISABLED') === 'true';

  const getToken = async () => {
    if (disabled) return 'WITHOUT_TOKEN';

    return smartCaptchaKey;
  };

  const reset = () => {
    setKey((prev) => prev + 1);
    setSmartCaptchaKey(null);
  };

  return {
    data: {
      key,
      onSuccess: setSmartCaptchaKey,
    },
    state: { disabled },
    actions: {
      getToken,
      reset,
    },
  };
};

export const useCaptchaStrategy = () => {
  const { headers } = useRequestState();
  const header = publicEnv('CONNECTING_IP_HEADER');
  const country = headers[header] as ConnectionCountry | undefined;

  if (country === ConnectionCountry.RUSSIA) {
    return {
      strategy: CaptchaStrategies.SMARTCAPTCHA,
      key: 'smart-token' as const,
    };
  }

  return {
    strategy: CaptchaStrategies.RECAPTCHA,
    key: 'g-recaptcha-response' as const,
  };
};

export const useCaptcha = <T extends CaptchaStrategies>(
  strategy: T
): T extends CaptchaStrategies.RECAPTCHA
  ? ReturnType<typeof useRecaptcha>
  : ReturnType<typeof useSmartCaptcha> => {
  if (strategy === CaptchaStrategies.RECAPTCHA) return useRecaptcha();
  return useSmartCaptcha();
};

interface ReCaptchaProps {
  ref: Ref<CaptchaType>;
  disabled: boolean;
}

const ReCaptcha = (props: ReCaptchaProps) => {
  const { disabled, ...rest } = props;
  const { resolvedTheme } = useTheme();
  const [show, setShow] = useState(false);

  const delayShow = useAppearanceDelay(show, { appearanceDelay: 500 });

  if (disabled) return null;

  return (
    <div
      className={cn(
        'h-[70px] w-full overflow-hidden rounded-md',
        resolvedTheme === 'dark' ? 'bg-[#222]' : 'bg-[#f9f9f9]'
      )}
    >
      {!delayShow ? <Skeleton containerClassName="w-full h-full" className="h-full" /> : null}
      <Reaptcha
        className={cn(
          'relative max-w-[296px] translate-x-[-2px] translate-y-[-2px] overflow-hidden',
          !delayShow && 'hidden'
        )}
        onLoad={() => {
          setShow(true);
        }}
        sitekey={publicEnv('RECAPTCHA_KEY')}
        {...rest}
        theme={resolvedTheme as 'light' | 'dark'}
      />
    </div>
  );
};

interface SmartCaptchaProps {
  disabled: boolean;
  onSuccess: (token: string) => void;
  key: number;
}

const SmartCaptcha = (props: SmartCaptchaProps) => {
  const { disabled, ...rest } = props;
  const { resolvedTheme } = useTheme();

  if (disabled) return null;

  return (
    <div
      className={cn(
        'h-[70px] w-full overflow-hidden rounded-md',
        resolvedTheme === 'dark' ? 'bg-[#222]' : 'bg-[#f9f9f9]'
      )}
    >
      <SmartCaptchaInstance
        {...rest}
        theme={resolvedTheme as 'light' | 'dark'}
        sitekey={publicEnv('SMARTCAPTCHA_KEY')}
      />
    </div>
  );
};

type CaptchaProps<T extends CaptchaStrategies> = {
  strategy: T;
} & (T extends CaptchaStrategies.RECAPTCHA ? ReCaptchaProps : SmartCaptchaProps);

export const Captcha = <T extends CaptchaStrategies>(props: CaptchaProps<T>) => {
  if (props.strategy === CaptchaStrategies.RECAPTCHA)
    return <ReCaptcha {...(props as ReCaptchaProps)} />;
  return <SmartCaptcha {...(props as SmartCaptchaProps)} />;
};
