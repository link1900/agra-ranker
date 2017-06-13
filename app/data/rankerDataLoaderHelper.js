import { createMongoLoader, createLoaderForMongooseModel } from '../common/mongoDataLoaderHelper';

/* eslint global-require: 0 */
export function createLoaders() {
    const mongoLoader = createMongoLoader();
    return {
        greyhound: createLoaderForMongooseModel(mongoLoader, require('../greyhound/greyhound').model),
        race: createLoaderForMongooseModel(mongoLoader, require('../race/race').model),
        placing: createLoaderForMongooseModel(mongoLoader, require('../placing/placing').model),
        rankingSystem: createLoaderForMongooseModel(mongoLoader, require('../ranking/rankingSystem').model)
    };
}
