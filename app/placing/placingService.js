const placingService = module.exports = {};

const _ = require('lodash');
const q = require('q');

const Placing = require('./placing').model;
const greyhoundService = require('../greyhound/greyhoundService');
const raceService = require('../race/raceService');
const mongoService = require('../mongoService');
const eventService = require('../event/eventService');
const baseService = require('../baseService');
const rankingSystemService = require('../ranking/rankingSystemService');

baseService.addStandardServiceMethods(placingService, Placing);

placingService.createPlacing = function (placingObject) {
    return placingService.preProcessPlacingObject(placingObject)
        .then(placingService.makePlacingModel)
        .then(placingService.preProcessModel)
        .then(placingService.validatePlacing)
        .then(placingService.create);
};

placingService.updatePlacing = function (existingModel, updatedBody) {
    return placingService.mergeWithExisting(existingModel, updatedBody)
        .then(placingService.preProcessModel)
        .then(placingService.validatePlacing)
        .then(placingService.update);
};

placingService.mergeWithExisting = function (existingModel, updatedBody) {
    return q(_.extend(existingModel, updatedBody));
};

placingService.makePlacingModel = function (placingObject) {
    return q(new Placing(placingObject));
};

placingService.preProcessModel = function (placing) {
    return placingService.setRaceFlyweight(placing)
        .then(placingService.setGreyhoundFlyweight);
};

placingService.preProcessPlacingObject = function (placing) {
    return placingService.convertGreyhoundNameToRef(placing);
};

placingService.convertGreyhoundNameToRef = function (placing) {
    if (placing != null && placing.greyhoundName != null) {
        const greyhoundName = placing.greyhoundName.trim();
        if (greyhoundName.length > 0) {
            return greyhoundService.findGreyhoundByName(placing.greyhoundName).then((findResult) => {
                if (findResult != null) {
                    placing.greyhoundRef = findResult._id;
                    delete placing.greyhoundName;
                    return q(placing);
                } else {
                    return greyhoundService.createGreyhoundFromJson({ name: placing.greyhoundName }).then((result) => {
                        if (result != null) {
                            placing.greyhoundRef = result._id;
                        }
                        delete placing.greyhoundName;
                        return q(placing);
                    });
                }
            });
        } else {
            return q(placing);
        }
    } else {
        return q(placing);
    }
};

placingService.setRaceFlyweight = function (placing) {
    if (placing != null && placing.raceRef != null) {
        return raceService.findById(placing.raceRef).then((model) => {
            if (model != null) {
                placing.race = model;
                return q(placing);
            } else {
                return q(placing);
            }
        });
    } else {
        return q(placing);
    }
};

placingService.setGreyhoundFlyweight = function (placing) {
    if (placing != null && placing.greyhoundRef != null) {
        return greyhoundService.findById(placing.greyhoundRef).then((model) => {
            if (model != null) {
                placing.greyhound = model;
                return q(placing);
            } else {
                return q(placing);
            }
        });
    } else {
        return q(placing);
    }
};

placingService.validatePlacing = function (placing) {
    if (!placing) {
        return q.reject('could not create a placing from given body');
    }

    if (!placing.placing) {
        return q.reject('placing field is required');
    }

    const validPlacings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'DNF', 'disqualified'];
    if (!_.includes(validPlacings, placing.placing)) {
        return q.reject(`placing was ${placing.placing} and must be one of ${validPlacings}`);
    }

    if (!placing.raceRef) {
        return q.reject('raceRef field is required');
    }

    if (placing.race && placing.raceRef !== placing.race._id.toString()) {
        return q.reject('race flyweight does not match raceRef');
    }

    if (!placing.greyhoundRef) {
        return q.reject('greyhoundRef field is required');
    }

    if (placing.greyhound && placing.greyhoundRef !== placing.greyhound._id.toString()) {
        return q.reject('greyhound flyweight does not match greyhoundRef');
    }

    if (placing.prizeMoney && !_.isNumber(placing.prizeMoney)) {
        return q.reject('prize money must be a valid number');
    }

    if (placing.time && !_.isNumber(placing.time)) {
        return q.reject('time must be a valid number');
    }

    return placingService.checkRaceRefExists(placing)
        .then(placingService.checkGreyhoundRefExists)
        .then(placingService.checkGreyhoundRefNotAlreadyUsed);
};

placingService.checkRaceRefExists = function (placing) {
    return raceService.findById(placing.raceRef).then((foundRace) => {
        if (foundRace) {
            return q(placing);
        } else {
            return q.reject('cannot find race ref for placing');
        }
    });
};

placingService.checkGreyhoundRefExists = function (placing) {
    return greyhoundService.findById(placing.greyhoundRef).then((found) => {
        if (found != null) {
            return q(placing);
        } else {
            return q.reject('cannot find greyhound ref for placing');
        }
    });
};

placingService.checkGreyhoundRefNotAlreadyUsed = function (placing) {
    const query = { _id: { $ne: placing._id }, raceRef: placing.raceRef, greyhoundRef: placing.greyhoundRef };
    return mongoService.find(Placing, query).then((foundModels) => {
        if (foundModels.length > 0) {
            return q.reject('cannot have same greyhound more then once in a single race');
        } else {
            return q(placing);
        }
    });
};

placingService.updatePlacingScores = async (placing) => {
    const scores = await rankingSystemService.getScoresForPlacing(placing);
    placing.scores = scores.filter(s => s);
    return placing.save();
};

eventService.addListener('placing race flyweight updater', 'Updated Race', (event) => {
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null) {
        return placingService.find({ raceRef: event.data.entity._id }).then((results) => {
            const proms = results.map((placingToUpdate) => {
                placingToUpdate.race = event.data.entity;
                return placingService.update(placingToUpdate);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener('placing race flyweight deleter', 'Deleted Race', (event) => {
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null) {
        return placingService.find({ raceRef: event.data.entity._id }).then((results) => {
            const proms = results.map((placing) => {
                return placingService.remove(placing);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener('placing greyhound flyweight updater', 'Updated Greyhound', (event) => {
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null) {
        return placingService.find({ greyhoundRef: event.data.entity._id }).then((results) => {
            const proms = results.map((placingToUpdate) => {
                placingToUpdate.greyhound = event.data.entity;
                return placingService.update(placingToUpdate);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener('placing greyhound deleted listener', 'Deleted Greyhound', (event) => {
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null) {
        return placingService.find({ greyhoundRef: event.data.entity._id }).then((results) => {
            const proms = results.map((placingToDelete) => {
                return placingService.remove(placingToDelete);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});
