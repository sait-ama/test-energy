## Run

Мы используем yarn, на данный момент версии 1.22.19 - иначе будет конфликт зависимостей с либой от VK:

При первом запуске:

0. `npm install -G yarn@1.22.19`
1. `yarn` - установка зависимостей
2. `yarn dev` - запуск проекта
3. Далее следуем на http://localhost:3000

## Commitlint

Может не работать с PowerShell, используйте Bash
Используются дефолтные правила и наименования, подробнее ниже:
https://www.conventionalcommits.org/ru/v1.0.0

## API

Типы API прописываем в shared/api/models/<entity_name>.ts
У каждого запроса есть:

- <Action>RequestSchema - данные, предоставляемые на вход: query параметры, body и тд
- <Action>ResponseSchema - ответ, полученные от сервера

В каждой сущности могут быть следующие файлы:

- endpoints.ts: Файл с описанием путей для эндпоинтов, query параметров при необходимости.
  **Query прописывается в shared**

```ts
export const createShopItem = () => `/api/v2/shop/`;
```

- repository.ts: Файл с описанием данных, принимаемых на вход и выход, методом и путем запроса

```ts
export const buyShopItem = async (shopItemId: number) => api.post<void>(ShopEndpoints.buyShopItemById(shopItemId)).then((v) => v.data);
```

- query-keys.ts: Файл с описанием ключей для useQuery. Первый параметр - entity-related, второй (опционально) - объект
  со следующими ключами:

```ts
export const getOrderById = (orderId: number) => [
    'shop-item',
    {
        authDepend: true,
        params: { orderId },
    },
];
```

**Если запрос зависит от авторизации, добавлем authDepend флаг**

TODO: Number = String in query key hashing

- queries.ts: Файл с GET-запросами или стейтом из react query:
  ** При создании любой квери необходимо создать две функции**

```ts
// getKeyFunc - для префетчей на сервере и соответствия
export const getOrderByIdQuery = (id: number) =>
    ({
        queryKey: ShopQueryKeys.getOrderById(id),
        queryFn: () => ShopRepository.getOrderById(id),
        enabled: !!id,
    }) satisfies UseQueryOptions<UserOrderSchema>;
// useFunc - для использования данных на клиенте: use client or noSSR
export const useShopCatalogPaginatedListQuery = (query: ShopPaginatedListRequestSchema) => useInfiniteQuery(getShopCatalogPaginatedListQuery(query));
```

- mutations.ts: Файл с экшенами (POST, PUT, DELETE, PATCH and etc)

```ts
export const useBuyShopItemMutation = () =>
    useOptimisticMutation<void, DefaultError, { shopItemId: number }>({
        invalidate: [ShopQueryKeys.getShopCatalog()],
        mutationFn: ({ shopItemId }) => ShopRepository.buyShopItem(shopItemId),
    });
```

## Project Structure

Проект создается по идеям FSD - feature-sliced design - архитектуры.

**Файлы пишутся в стайле component-name, с маленькой буквы**

Уровни и их использование:

- shared - ui-kit, переиспользуемые компоненты, тулзы для тестирования, описание API, глобальные типы
- entity - реализация апишки, переиспользуемые entity-related компоненты, необходимые на feature уровне
- feature - реализация экшенов апишки, ориентир на **действие на клиенте = фича**
- widgets - сбор готовых компонентов более верхнего уровня
- pages - реализация полноценных страниц
- app - root providers, configs and etc
