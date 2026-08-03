import baseDataProvider from './baseDataProvider';
import { customMethods } from './custom';

export default {
    ...baseDataProvider,
    ...customMethods,
};
