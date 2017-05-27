const assert = require('assert');
const Greyhound = require('../app/greyhound/greyhound').model;
let greyhoundService = null;
const testHelper = require('./testHelper');
const eventService = require('../app/event/eventService');

describe('greyhoundService', () => {
    before((done) => {
        testHelper.setup(() => {
            greyhoundService = require('../app/greyhound/greyhoundService');
            done();
        });
    });
    let changeModel;
    before((done) => {
        const greyhoundAllen = {
            _id: '54a32fbee39b345cff5841b5',
            name: 'allen deed'
        };

        const greyhoundDeed = {
            _id: '54a32fbee39b345cff5841b9',
            name: 'deed'
        };

        const greyhoundBob = {
            _id: '54a32fbee39b345cff5841b8',
            name: 'bob'
        };

        const greyhoundChange = {
            _id: '54a32fbee39b345cff5841c8',
            name: 'change me'
        };
        changeModel = new Greyhound(greyhoundChange);
        changeModel.save(() => {
            new Greyhound(greyhoundDeed).save(() => {
                new Greyhound(greyhoundBob).save(() => {
                    new Greyhound(greyhoundAllen).save(done);
                });
            });
        });
    });

    describe('#findGreyhoundByName', () => {
        it('find greyhound bob using different case', (done) => {
            greyhoundService.findGreyhoundByName('boB').then((result) => {
                assert(result != null);
                assert.equal(result.name, 'bob');
                done();
            }, done).then(() => {}, done);
        });

        it('do not find greyhound bob using bo', (done) => {
            greyhoundService.findGreyhoundByName('bo').then((result) => {
                assert(result == null);
                done();
            }, done).then(() => {}, done);
        });

        it('find greyhound deed using deed', (done) => {
            greyhoundService.findGreyhoundByName('deed').then((result) => {
                assert(result != null);
                assert.equal(result.name, 'deed');
                done();
            }, done).then(() => {}, done);
        });
    });

    describe('#validateSireRef', () => {
        it('should validate a greyhounds sire ref', (done) => {
            const grey = new Greyhound({ name: 'james', sireRef: '54a32fbee39b345cff5841b8' });
            greyhoundService.validateSireRef(grey).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'james');
                done();
            }, done).then(() => {}, done);
        });

        it('should validate a greyhounds sire ref', (done) => {
            const grey = new Greyhound({ name: 'james', sireRef: '54a32fbee39b345cff5841b8', damRef: '54a32fbee39b345cff5841b8' });
            greyhoundService.validateSireRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds sire ref is invalid', (done) => {
            const grey = new Greyhound({ name: 'james', sireRef: 'oh no' });
            greyhoundService.validateSireRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds sire ref if it is the greyhounds id', (done) => {
            const grey = new Greyhound({ _id: '54a32fbee39b345cff5841b3', name: 'james', sireRef: '54a32fbee39b345cff5841b3' });
            greyhoundService.validateSireRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds sire ref cannot be found', (done) => {
            const grey = new Greyhound({ name: 'james', sireRef: '54a32fbee39b345cff5841b1' });
            greyhoundService.validateSireRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });
    });

    describe('#validateDamRef', () => {
        it('should validate a greyhounds dam ref', (done) => {
            const grey = new Greyhound({ name: 'james', damRef: '54a32fbee39b345cff5841b8' });
            greyhoundService.validateDamRef(grey).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'james');
                done();
            }, done).then(() => {}, done);
        });

        it('should validate a greyhounds dam ref but fail as sire and dam are he same', (done) => {
            const grey = new Greyhound({ name: 'james', sireRef: '54a32fbee39b345cff5841b8', damRef: '54a32fbee39b345cff5841b8' });
            greyhoundService.validateDamRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds dam ref is invalid', (done) => {
            const grey = new Greyhound({ name: 'james', damRef: 'oh no' });
            greyhoundService.validateDamRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds dam ref if it is the greyhounds id', (done) => {
            const grey = new Greyhound({ _id: '54a32fbee39b345cff5841b3', name: 'james', damRef: '54a32fbee39b345cff5841b3' });
            greyhoundService.validateDamRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });

        it('should reject a greyhounds dam ref cannot be found', (done) => {
            const grey = new Greyhound({ name: 'james', damRef: '54a32fbee39b345cff5841b1' });
            greyhoundService.validateDamRef(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });
    });

    describe('#validateGreyhoundIsNew', () => {
        it('should reject if greyhound exists', (done) => {
            const grey = new Greyhound({ name: 'bob' });
            greyhoundService.validateGreyhoundIsNew(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => {
                done();
            }).then(() => {
            }, done);
        });

        it('should fail when passed and an existing greyhound id', (done) => {
            const grey = new Greyhound({ _id: '54a32fbee39b345cff5841b8', name: 'bob' });
            greyhoundService.validateGreyhoundIsNew(grey).then(() => {
                done(new Error('this should not pass'));
            }, () => {
                done();
            }).then(() => {
            }, done);
        });

        it('should pass if it is new', (done) => {
            const grey = new Greyhound({ name: 'totes new' });
            greyhoundService.validateGreyhoundIsNew(grey).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'totes new');
                done();
            }, done).then(() => {
            }, done);
        });
    });

    describe('#createGreyhoundFromJson', () => {
        it('should pass if it is new', (done) => {
            greyhoundService.createGreyhoundFromJson({ name: 'really new' }).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'REALLY NEW');
                done();
            }, done).then(() => {
            }, done);
        });

        it('should reject if greyhound exists', (done) => {
            greyhoundService.createGreyhoundFromJson({ name: 'bob' }).then(() => {
                done(new Error('this should not pass'));
            }, () => {
                done();
            }).then(() => {
            }, done);
        });
    });

    describe('#updateGreyhoundFromJson', () => {
        it('should change the name', (done) => {
            greyhoundService.updateGreyhoundFromJson(changeModel, { name: 'new name' }).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'NEW NAME');
                done();
            }, done).then(() => {}, done);
        });

        it('set sire to bob', (done) => {
            greyhoundService.updateGreyhoundFromJson(changeModel, { name: 'new name', sireRef: '54a32fbee39b345cff5841b8' }).then((result) => {
                assert(result != null);
                assert.equal(result.name, 'NEW NAME');
                assert.equal(result.sireRef, '54a32fbee39b345cff5841b8');
                done();
            }, done).then(() => {}, done);
        });

        it('should reject if greyhound exists', (done) => {
            greyhoundService.updateGreyhoundFromJson(changeModel, { name: 'bob' }).then(() => {
                done(new Error('this should not pass'));
            }, () => { done(); }).then(() => {}, done);
        });
    });

    describe('events', () => {
        it('should issue create event on creation', (done) => {
            eventService.addListener('testCreate', 'Created Greyhound', () => {
                done();
            });
            greyhoundService.createGreyhoundFromJson({ name: 'event new' }).then(() => {}, done);
        });

        it('should issue update event on update', (done) => {
            eventService.addListener('testUpdate', 'Updated Greyhound', () => {
                done();
            });
            greyhoundService.updateGreyhoundFromJson(changeModel, { name: 'event update' }).then(() => {}, done);
        });

        it('should issue delete event on delete', (done) => {
            eventService.addListener('testDelete', 'Deleted Greyhound', () => {
                done();
            });
            greyhoundService.remove(changeModel).then(() => {}, done);
        });

        it('should issue create event on batch import', (done) => {
            eventService.addListener('testBatch', 'Created Greyhound', () => {
                done();
            });
            greyhoundService.processGreyhoundRow(['batchImportGrey', '', '']).then(() => {}, done);
        });

        afterEach(() => {
            eventService.removeListenerByName('testCreate');
            eventService.removeListenerByName('testUpdate');
            eventService.removeListenerByName('testDelete');
            eventService.removeListenerByName('testBatch');
        });
    });

    after((done) => {
        Greyhound.remove({}, () => {
            testHelper.tearDown(done);
        });
    });
});
