import logger from 'winston';
import mongoose from 'mongoose';
import { isObject, keys } from 'lodash';

mongoose.Promise = Promise;
const ObjectId = mongoose.Types.ObjectId;

export function isObjectId(objectId) {
    if (objectId && objectId.toString) {
        return ObjectId.isValid(objectId.toString());
    } else {
        return false;
    }
}

function connectionToString(connection) {
    if (connection) {
        let hosts = '';
        let name = '';
        if (connection.hosts && connection.hosts.length > 0) {
            hosts = connection.hosts.map(host => host.host).join(',');
        }
        if (connection.host) {
            hosts = connection.host;
        }
        if (connection.name) {
            name = connection.name;
        }
        return `${name} @ ${hosts}`;
    } else {
        return '';
    }
}

export function modelToString(model) {
    if (!model) {
        return 'invalid model or object';
    }
    if (model.toObject) {
        return JSON.stringify(model.toObject());
    }

    if (isObject(model)) {
        return JSON.stringify(model);
    }

    return 'invalid model or object';
}

export function convertMongoError(error) {
    if (!error) {
        return new Error('Invalid error thrown from mongoose');
    }

    if (error.code === 11000) {
        return new Error(`Attempted to insert a duplicate into mongo. Original error: ${error.message}`);
    }

    return error;
}

export async function createEntity(dao, entity) {
    try {
        return await dao.create(entity);
    } catch (error) {
        throw convertMongoError(error);
    }
}

export async function saveEntity(entity) {
    try {
        return await entity.save();
    } catch (error) {
        throw convertMongoError(error);
    }
}

export async function findOrCreateEntity(dao, query, entity) {
    const found = await dao.findOne(query);
    if (found) {
        return found;
    } else {
        return createEntity(dao, entity);
    }
}

export async function connectionToMongo(mongoUrl, connectionOptions) {
    try {
        if (mongoIsConnected(mongoose.connection)) {
            logger.info(`Already connected to database ${connectionToString(mongoose.connection)}`);
            return null;
        }
        const connection = await mongoose.connect(mongoUrl, connectionOptions);
        logger.info(`Connected to database ${connectionToString(mongoose.connection)}`);
        return connection;
    } catch (err) {
        logger.error(`Error connecting to ${connectionToString(mongoose.connection)} with error`, err);
        return err;
    }
}

export function mongoIsConnected(connection) {
    return connection.readyState === 1 || connection.readyState === 2;
}

export function clearMongoDatabase() {
    const collectionNames = keys(mongoose.connection.collections);
    const proms = collectionNames.map((collectionName) => {
        const collection = mongoose.connection.collections[collectionName];
        if (collection.opts.capped === false) {
            return collection.remove({});
        }
        return {};
    });
    return Promise.all(proms);
}
