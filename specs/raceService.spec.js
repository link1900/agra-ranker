const assert = require('assert');
const testHelper = require('./testHelper');
const Race = require('../app/race/race').model;
const eventService = require('../app/event/eventService');

let raceService = null;

let race5;
describe('raceService', () => {
    before((done) => {
        testHelper.setup(() => {
            raceService = require('../app/race/raceService');
            done();
        });
    });

    beforeEach((done) => {
        testHelper.loadRaces(() => {
            testHelper.loadGreyhounds(() => {
                race5 = new Race({ _id: '54e7beb64751d30120fe63b5',
                    name: 'race5',
                    date: new Date(),
                    groupLevelName: 'Group 1',
                    distanceMeters: 515,
                    disqualified: false });
                race5.save(() => {
                    done();
                });
            });
        });
    });

    describe('#createRaceFromJson', () => {
        it('should create a race', (done) => {
            const body = { name: 'raceCreated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            raceService.createRaceFromJson(body).then((result) => {
                assert.notEqual(result, null);
                assert.equal(result.name, 'raceCreated');
                done();
            }).then(() => {}, done);
        });
    });

    describe('#updateRaceFromJson', () => {
        it('should update a race', (done) => {
            const body = { name: 'raceUpdated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            raceService.updateRaceFromJson(race5, body).then((result) => {
                assert.notEqual(result, null);
                assert.equal(result.name, 'raceUpdated');
                done();
            }).then(() => {}, done);
        });
    });

    describe('events', () => {
        it('should issue create event on creation', (done) => {
            eventService.addListener('testCreate', 'Created Race', () => {
                done();
            });
            const body = { name: 'raceCreated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            raceService.createRaceFromJson(body).then(() => {}, done);
        });

        it('should issue update event on update', (done) => {
            eventService.addListener('testUpdate', 'Updated Race', () => {
                done();
            });
            const body = { name: 'raceUpdated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            raceService.updateRaceFromJson(race5, body).then(() => {}, done);
        });

        it('should issue delete event on delete', (done) => {
            eventService.addListener('testDelete', 'Deleted Race', () => {
                done();
            });
            raceService.remove(race5).then(() => {}, done);
        });

        afterEach(() => {
            eventService.removeListenerByName('testCreate');
            eventService.removeListenerByName('testUpdate');
            eventService.removeListenerByName('testDelete');
        });
    });

    afterEach((done) => {
        testHelper.clearRaces(done);
    });

    after((done) => {
        testHelper.tearDown(done);
    });
});
