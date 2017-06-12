import { createMongoLoader, createLoaderForMongooseModel } from '../common/mongoDataLoaderHelper';

/* eslint global-require: 0 */
export const modelTypes = {
    placing: require('../placing/placing').model
};

export function createLoaders() {
    const mongoLoader = createMongoLoader();
    return {
        placing: createLoaderForMongooseModel(mongoLoader, require('../placing/placing').model)
    };
}
