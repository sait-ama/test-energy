import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

import { useInfiniteQuery } from '@tanstack/react-query';

import { HERO_CARD_ORDERING } from '~entities/inventory/model/const';
import {
  getCustomizationsKey,
  getHeroCardsByUserInfiniteQuery,
  useCardForms,
} from '~entities/inventory/model/queries';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { UserSchemaFragment } from '~shared/api/models/common';
import { Type } from '~shared/api/models/forms';
import {
  UNIFIED_INVENTORY_ITEM_TYPE,
  UnifiedInventoryItemTypeSchema,
} from '~shared/api/models/inventory';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';
import { useSession } from '~shared/lib/session/use-session';
import { Form } from '~shared/ui/form';
import { useStrictContext } from '~shared/utils/use-strict-context';
import { valueIs } from '~shared/utils/valueIs';

export const EXCHANGE_MAX_ITEMS = 10;

export const EXCHANGE_TYPE = UNIFIED_INVENTORY_ITEM_TYPE;
export type ExchangeTypeSchema = UnifiedInventoryItemTypeSchema;

export type FiltersSchema = {
  card: {
    title: {
      value: null | string;
    };
    search: {
      value: string;
    };
    filter: {
      value: string | null;
      variants: Type[];
    };
    ordering: {
      value: string;
      variants: Type[];
    };
    rank: {
      value: string;
      variants: Type[];
    };
  };
  avatar: {};
  wallpaper: {};
  frame: {};
};

export type FiltersStoreSchema = {
  value: FiltersSchema;
  setValue: Dispatch<SetStateAction<FiltersSchema>>;
};

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const { data: cardFormsData } = useCardForms();
  //@ts-ignore
  const cardRankVariants = cardFormsData?.content?.ranks || [];

  const searchParams = useSearchParams();

  const defaultValues = useMemo(() => {
    const filters: FiltersSchema = {
      card: {
        title: {
          value: null,
        },
        search: {
          value: '',
        },
        filter: {
          value: null,
          variants: [],
        },
        ordering: {
          value: '-id',
          variants: HERO_CARD_ORDERING,
        },
        rank: {
          value: 'all',
          variants: [{ id: 'all', name: 'Все' }, ...cardRankVariants],
        },
      },
      avatar: {},
      wallpaper: {},
      frame: {},
    };

    Object.entries(filters).forEach(([type, typeFilters]) => {
      if (!typeFilters) return;

      Object.entries(typeFilters).forEach(([filterName, filterSchema]) => {
        const param = searchParams.get(`${type}-${filterName}`);

        if (!param) return;
        if ('variants' in filterSchema && !filterSchema.variants.find((v) => v.id == param)) return;

        //@ts-ignore
        if (param) filters[type][filterName] = param;
      });
    });

    return filters;
  }, []);

  const form = useForm<FiltersSchema>({ defaultValues });

  return <Form {...form}>{children}</Form>;
};

export const useFilters = useFormContext<FiltersSchema>;

export type ExchangeTargetTabsSchema = 'creator' | 'partner';
export type ExchangesContextSchema = {
  creator: UserSchemaFragment;
  partner: UserSchemaFragment;
  target: ExchangeTargetTabsSchema;
  setTarget: Dispatch<SetStateAction<ExchangeTargetTabsSchema>>;
  type: ExchangeTypeSchema;
  setType: Dispatch<SetStateAction<ExchangeTypeSchema>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
};

export const ExchangesContext = createContext<ExchangesContextSchema | null>(null);

export const ExchangesProvider = ({ children }: { children: ReactNode }) => {
  const { id: targetId } = useParams<{ id: string }>();

  const { data: partner } = useUserSuspenseQuery({
    variables: { params: { userId: String(targetId) } },
  });
  const session = useSession();

  const [target, setTarget] = useState<ExchangeTargetTabsSchema>('creator');
  const [type, setType] = useState<ExchangeTypeSchema>('card');
  const [message, setMessage] = useState<string>('');

  const value: ExchangesContextSchema = {
    creator: session!,
    partner: partner!,

    target,
    setTarget,
    type,
    setType,
    message,
    setMessage,
  };
  return <ExchangesContext.Provider value={value}>{children}</ExchangesContext.Provider>;
};

export const useExchangesStore = () => useStrictContext(ExchangesContext);

export const useExchangeType = () => {
  const { type, setType: _setType } = useExchangesStore();

  const setType = (type: string) => {
    if (!EXCHANGE_TYPE.includes(type) || !valueIs<ExchangeTypeSchema>(type, true)) return;
    _setType(type);
  };

  return {
    type: type || 'card',
    setType,
  };
};

export const useExchangeItems = () => {
  const { type } = useExchangeType();
  const exchangesStore = useExchangesStore();
  const targetUser = exchangesStore[exchangesStore.target];

  const [filters] = useDebouncedValue(useWatch() as FiltersSchema, 200);

  const pathname = usePathname();

  useEffect(() => {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([type, typeFilters]) => {
      if (!typeFilters) return;

      Object.entries(typeFilters).forEach(([filterName, filterSchema]) => {
        if (!filterSchema.value) return;

        searchParams.set(`${type}-${filterName}`, filterSchema.value);
      });
    });

    window.history.replaceState(null, '', `${pathname}?${searchParams.toString()}`);
  }, [filters]);

  const key = useMemo(() => {
    const params = {
      userId: targetUser.id,
    };

    const query = { is_exchangeable: 1 };

    if (type === 'card') {
      return getHeroCardsByUserInfiniteQuery({
        variables: {
          params,
          query: {
            ...query,
            card__rank: filters.card.rank.value !== 'all' ? filters.card.rank.value : undefined,
            ordering: filters.card.ordering.value,
            card__title__main_name__iexact: filters.card.search.value,
            card__is_exchangeable: 1,
            card__title_id: filters.card.title.value ?? undefined,
          },
        },
      });
    }

    return getCustomizationsKey({
      variables: {
        params,
        query: {
          ...query,
          filter_by: type,
        },
      },
    });
  }, [type, targetUser, filters]);

  return useInfiniteQuery({
    ...key,
    select: (options) => ({
      ...options,
      pages: options.pages.map((page) => ({
        ...page,
        results: page.results.map((it) => ({
          type,
          model: it,
        })),
      })),
    }),
  });
};
