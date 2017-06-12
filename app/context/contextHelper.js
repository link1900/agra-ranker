import { createLoaders } from '../data/rankerDataLoaderHelper';

export function createContext() {
    const context = {};
    context.loaders = createLoaders();
    return context;
}
