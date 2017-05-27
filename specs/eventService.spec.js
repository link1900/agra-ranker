const q = require('q');
const testHelper = require('./testHelper');

let eventService = null;

describe('eventService', () => {
    before((done) => {
        testHelper.setup(() => {
            eventService = require('../app/event/eventService');
            done();
        });
    });

    it('gets to a listener', (done) => {
        eventService.addListener('eventTest1', 'test1', () => {
            done();
        });
        eventService.logEvent({ type: 'test1' });
    });

    it('will return a promise when requiring confirmation', (done) => {
        let reached = false;
        eventService.addListener('eventTest2', 'test2', () => {
            reached = true;
            return q(true);
        });
        eventService.logEvent({ type: 'test2' }, true).then(() => {
            if (reached === true) {
                done();
            } else {
                done("didn't reach the listener");
            }
        });
    });

    after((done) => {
        eventService.removeListenerByName('eventTest1');
        eventService.removeListenerByName('eventTest2');
        testHelper.tearDown(done);
    });
});
