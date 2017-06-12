import DataLoader from 'dataloader';
import _ from 'lodash';
import { createEntity, saveEntity, findOrCreateEntity } from '../common/mongoHelper';

export function createMongoLoader() {
    const mongoDataLoaderOptions = { cacheKeyFn: key => JSON.stringify(key) };
    return new DataLoader((findRequests) => {
        return Promise.all(findRequests.map(runMongoFindRequest));
    }, mongoDataLoaderOptions);
}

export function createLoaderForMongooseModel(mongoLoader, model) {
    const loader = new DataLoader(ids => mongoIdIn(model, ids), { cacheKeyFn: myKey => myKey.toString() });

    loader.query = function (query, limit, sort, skip, projection) {
        return mongoLoader.load({ model, query, limit, sort, skip, projection });
    };

    loader.findOne = async function (query, options = {}) {
        const { limit, sort, skip, projection } = options;
        const results = await loader.query(query, limit, sort, skip, projection);
        return _.first(results);
    };

    loader.queryDirect = function (query, limit, sort, skip, projection) {
        return runMongoFindRequest({ model, query, limit, sort, skip, projection });
    };

    loader.queryAsStream = function (query, limit, sort, skip, projection) {
        return runMongoFindRequest({ model, query, limit, sort, skip, projection, stream: true });
    };

    loader.create = async function (data) {
        const createdEntity = await createEntity(model, data);
        if (data && data._id) {
            loader.clear(data._id);
            if (mongoLoader) {
                mongoLoader.clearAll();
            }
            if (loader._dataLoaders) {
                _.each(loader._dataLoaders, l => l.clearAll());
            }
        }
        if (createdEntity && createdEntity._id) {
            loader.prime(createdEntity._id, createdEntity);
        }
        return createdEntity;
    };

    loader.update = async function (entity) {
        if (entity && entity._id) {
            loader.clear(entity._id);
            if (mongoLoader) {
                mongoLoader.clearAll();
            }
            if (loader._dataLoaders) {
                _.each(loader._dataLoaders, l => l.clearAll());
            }
        }
        const updatedEntity = await saveEntity(entity);
        if (updatedEntity && updatedEntity._id) {
            loader.prime(updatedEntity._id.toString(), updatedEntity);
        }

        return updatedEntity;
    };

    /**
     * Will set the value for many documents in bulk.
     * Will return true unless options.returnResults is set.
     * @param query
     * @param values
     * @param options
     * @returns {Promise.<void>}
     */
    loader.updateMultiple = async (query, values, options = { multi: true }) => {
        await model.update(query, values, options);
        return null;
    };

    loader.findOrCreate = function (query, entity) {
        return findOrCreateEntity(model, query, entity);
    };

    loader._dataLoaders = {};

    loader.loadIn = async (value, field, filters = {}) => {
        const hash = `${field}:${JSON.stringify(filters)}`;
        if (!loader._dataLoaders[hash]) {
            loader._dataLoaders[hash] = new DataLoader(async (values) => {
                const fields = await mongoLoader.load({
                    model,
                    query: {
                        ...filters,
                        [field]: { $in: values }
                    }
                });
                const groupedFields = _.groupBy(fields, field);
                return values.map(inputValue => groupedFields[inputValue] || []);
            });
        }
        return loader._dataLoaders[hash].load(value);
    };

    return loader;
}

function runMongoFindRequest(findRequest) {
    const { model } = findRequest;
    let mongoQuery;
    if (findRequest.query && findRequest.projection) {
        mongoQuery = model.find(findRequest.query, findRequest.projection);
    } else {
        mongoQuery = model.find(findRequest.query);
    }
    if (findRequest.limit) {
        mongoQuery = mongoQuery.limit(findRequest.limit);
    }
    if (findRequest.skip) {
        mongoQuery = mongoQuery.skip(findRequest.skip);
    }
    if (findRequest.sort) {
        mongoQuery = mongoQuery.sort(findRequest.sort);
    }
    if (findRequest.stream) {
        return mongoQuery.stream();
    }
    return mongoQuery;
}

async function mongoIdIn(model, ids) {
    const results = await model.find({ _id: { $in: ids } });
    return ids.map(id => results.find(result => result._id.toString() === id.toString()));
}
