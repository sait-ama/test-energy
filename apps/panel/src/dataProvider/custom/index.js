import * as billingMethods from './billing';
import * as cardsMethods from './cards';
import * as commentsMethods from './comments';
import * as formMethods from './forms';
import * as infoMethods from './info';
import * as statisticsMethods from './statistics';
import * as titleMethods from './title';

export const customMethods = {
    ...infoMethods,
    ...commentsMethods,
    ...billingMethods,
    ...titleMethods,
    ...formMethods,
    ...statisticsMethods,
    ...cardsMethods,
};
