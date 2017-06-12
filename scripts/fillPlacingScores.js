import logger from 'winston';
import { runScriptSetup, runScript } from './scriptHelper';
import { runFunctionForStream } from '../app/common/streamHelper';
import { createContext } from '../app/context/contextHelper';
import placingService from '../app/placing/placingService';

async function run() {
    await runScriptSetup();
    const context = createContext();
    const placingStream = context.loaders.placing.queryAsStream({});
    await runFunctionForStream(placingStream, updatePlacingScores);
    return true;
}

async function updatePlacingScores(placing) {
    if (!placing) {
        return null;
    }
    logger.info(`Updating placing scores for placing ${placing._id.toString()}`);
    return placingService.updatePlacingScores(placing);
}

runScript(run);
