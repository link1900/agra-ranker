import { keys } from 'lodash';
import mongoose from 'mongoose';

export function clearMongoDatabase() {
    const collectionNames = keys(mongoose.connection.collections);
    const proms = collectionNames.map((collectionName) => {
        const collection = mongoose.connection.collections[collectionName];
        return collection.remove({});
    });
    return Promise.all(proms);
}
