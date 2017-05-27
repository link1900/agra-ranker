const Placing = require('../app/placing/placing').model;
const Greyhound = require('../app/greyhound/greyhound').model;
const Race = require('../app/race/race').model;
const testHelper = require('./testHelper');
const eventService = require('../app/event/eventService');

let placingService = null;

let placingOne;
describe('placingService', () => {
    before((done) => {
        testHelper.setup(() => {
            placingService = require('../app/placing/placingService');
            done();
        });
    });

    beforeEach((done) => {
        const greyhoundAllen = {
            _id: '54a32fbee39b345cff5841b5',
            name: 'allen deed'
        };

        const greyhoundBob = {
            _id: '54e905574751d30120fe63b7',
            name: 'bob'
        };

        const raceShootOut = {
            _id: '54a32fc7e39b345cff5857d1',
            distanceMeters: 500,
            groupLevelName: 'Group 2',
            name: 'SHOOT OUT',
            disqualified: false
        };

        placingOne = new Placing({ _id: '54e905804751d30120fe63b9', placing: '5', raceRef: '54a32fc7e39b345cff5857d1', greyhoundRef: '54e905574751d30120fe63b7' });
        new Race(raceShootOut).save(() => {
            new Greyhound(greyhoundAllen).save(() => {
                new Greyhound(greyhoundBob).save(() => {
                    placingOne.save(() => {
                        done();
                    });
                });
            });
        });
    });

    describe('#createPlacing', () => {
        it('should fail if missing greyhound ref', (done) => {
            const body = { placing: '2', raceRef: '531d1f72e407586c21476ea8' };
            placingService.createPlacing(body).then(() => {
                done(new Error('I should not be called'));
            }, () => { done(); });
        });

        it('should fail if missing greyhound ref', (done) => {
            const body = { placing: '2', greyhoundRef: '54a32fbee39b345cff5841b5' };
            placingService.createPlacing(body).then(() => {
                done(new Error('I should not be called'));
            }, () => { done(); });
        });

        it('new placing should generate an event', (done) => {
            const body = { placing: '2', raceRef: '54a32fc7e39b345cff5857d1', greyhoundRef: '54a32fbee39b345cff5841b5' };
            eventService.addListener('testCreatePlacing', 'Created Placing', () => {
                done();
            });
            placingService.createPlacing(body).then(() => {}, done);
        });

        after(() => {
            eventService.removeListenerByName('testCreatePlacing');
        });
    });

    describe('#updatePlacing', () => {
        it('should generate an event', (done) => {
            const body = { placing: '6' };
            eventService.addListener('testUpdatePlacing', 'Updated Placing', () => {
                done();
            });
            placingService.updatePlacing(placingOne, body).then(() => {}, done);
        });

        after(() => {
            eventService.removeListenerByName('testUpdatePlacing');
        });
    });

    describe('#remove', () => {
        it('should generate an event', (done) => {
            eventService.addListener('testDeletePlacing', 'Deleted Placing', () => {
                done();
            });
            placingService.remove(placingOne).then(() => {}, done);
        });

        after(() => {
            eventService.removeListenerByName('testDeletePlacing');
        });
    });

    describe('listeners', () => {
        it('should delete placing on greyhound delete', (done) => {
            const event = { type: 'Deleted Greyhound', data: { entity: { _id: '54e905574751d30120fe63b7' } } };
            eventService.logEvent(event, true).then(() => {
                Placing.find({ _id: placingOne._id }, (err, res) => {
                    if (res.length > 0) {
                        done(new Error('found placings when I should not have'));
                    } else {
                        done();
                    }
                });
            });
        });

        it('should delete placing on race delete', (done) => {
            const event = { type: 'Deleted Race', data: { entity: { _id: '54a32fc7e39b345cff5857d1' } } };
            eventService.logEvent(event, true).then(() => {
                Placing.find({ _id: placingOne._id }, (err, res) => {
                    if (res.length > 0) {
                        done(new Error('found placings when I should not have'));
                    } else {
                        done();
                    }
                });
            });
        });
    });

    afterEach((done) => {
        Placing.remove({}, () => {
            done();
        });
    });

    after((done) => {
        testHelper.tearDown(done);
    });
});
