### Общая информация

Основа проекта - монорепозиторий на [turborepo](https://turbo.build/)

### Структура 
```
apps/ 
    card-api - внутреннее API для создания карт
    web - основное веб-приложение
    api-gateway - шлюз для доступа ко всем апи 
    (в том числе основного бека), используется только в development
packages/ 
    ui - ui-kit
    eslint
    typescript
...


### Ограничения
Установить dotenv
Установить nodemon
Чтобы работал pre-commit (lint-staged), нужно использовать node >= 23.6 (NODE_OPTIONS="--experimental-strip-types")