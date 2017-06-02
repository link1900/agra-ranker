const bluebird = require('bluebird');
const scriptStarter = require('./scriptStarter');
const placingService = require('../app/placing/placingService');

async function run() {
    await scriptStarter.runSetup();
    const placings = await placingService.find({ _id: '561272931e9d1d0300eed572' });
    // run out of memory
    const updatedPlacings = await Promise.all(placings.map(async (placing) => {
        return placingService.updatePlacingScores(placing);
    }));
    console.log(JSON.stringify(updatedPlacings, null, 2));
}

run().then(() => {
    process.exit(0);
}).catch((err) => {
    console.err(err);
    process.exit(1);
});
