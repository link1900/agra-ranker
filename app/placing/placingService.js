var placingService = module.exports = {};

var _ = require('lodash');
var q = require('q');

var Placing = require('./placing').model;
var greyhoundService = require('../greyhound/greyhoundService');
var raceService = require('../race/raceService');
var mongoService = require('../mongoService');
var eventService = require('../event/eventService');
var baseService = require('../baseService');

baseService.addStandardServiceMethods(placingService, Placing);

placingService.createPlacing = function(placingObject){
    return placingService.preProcessPlacingObject(placingObject)
        .then(placingService.makePlacingModel)
        .then(placingService.preProcessModel)
        .then(placingService.validatePlacing)
        .then(placingService.create);
};

placingService.updatePlacing = function(existingModel, updatedBody){
    return placingService.mergeWithExisting(existingModel, updatedBody)
        .then(placingService.preProcessModel)
        .then(placingService.validatePlacing)
        .then(placingService.update);
};

placingService.mergeWithExisting = function(existingModel, updatedBody){
    return q(_.extend(existingModel, updatedBody));
};

placingService.makePlacingModel = function(placingObject){
    return q(new Placing(placingObject));
};

placingService.preProcessModel = function(placing){
    return placingService.setRaceFlyweight(placing)
        .then(placingService.setGreyhoundFlyweight);
};

placingService.preProcessPlacingObject = function(placing){
    return placingService.convertGreyhoundNameToRef(placing);
};

placingService.convertGreyhoundNameToRef = function(placing){
    if (placing != null && placing.greyhoundName != null){
        return greyhoundService.createGreyhoundByName(placing.greyhoundName).then(function(result){
            if (result != null && result.model != null){
                placing.greyhoundRef = result.model._id;
            }
            delete placing.greyhoundName;
            return q(placing);
        });
    } else {
        return q(placing);
    }
};

placingService.setRaceFlyweight = function(placing){
    if (placing != null && placing.raceRef != null){
        return raceService.findById(placing.raceRef).then(function(model){
            if (model != null){
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

placingService.setGreyhoundFlyweight = function(placing){
    if (placing != null && placing.greyhoundRef != null){
        return greyhoundService.findById(placing.greyhoundRef).then(function(model){
            if (model != null){
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

placingService.validatePlacing = function(placing){
    if (placing == null){
        return q.reject("could not create a placing from given body");
    }

    if (placing.placing == null){
        return q.reject("placing field is required");
    }

    var validPlacings = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","DNF","disqualified"];
    if (!_.contains(validPlacings,placing.placing)){
        return q.reject("placing was " +placing.placing + " and must be one of " + validPlacings);
    }

    if (placing.raceRef == null){
        return q.reject("raceRef field is required");
    }

    if (placing.race != null && placing.raceRef != placing.race._id){
        return q.reject("race flyweight does not match raceRef");
    }

    if (placing.greyhoundRef == null){
        return q.reject("greyhoundRef field is required");
    }

    if (placing.greyhound != null && placing.greyhoundRef != placing.greyhound._id){
        return q.reject("greyhound flyweight does not match greyhoundRef");
    }

    return placingService.checkRaceRefExists(placing)
        .then(placingService.checkGreyhoundRefExists)
        .then(placingService.checkGreyhoundRefNotAlreadyUsed);
};

placingService.checkRaceRefExists = function(placing){
    return raceService.findById(placing.raceRef).then(function(foundRace){
        if (foundRace != null){
            return q(placing);
        } else {
            return q.reject("cannot find race ref for placing");
        }
    });
};

placingService.checkGreyhoundRefExists = function(placing){
    return greyhoundService.findById(placing.greyhoundRef).then(function(found){
        if (found != null){
            return q(placing);
        } else {
            return q.reject("cannot find greyhound ref for placing");
        }
    });
};

placingService.checkGreyhoundRefNotAlreadyUsed = function(placing){
    var query = {"_id": {"$ne" : placing._id}, "raceRef":placing.raceRef, "greyhoundRef": placing.greyhoundRef};
    return mongoService.find(Placing, query).then(function(foundModels){
        if (foundModels.length > 0){
            return q.reject("cannot have same greyhound more then once in a single race");
        } else {
            return q(placing);
        }
    });
};

eventService.addListener("placing race flyweight updater","Updated Race", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return placingService.find({raceRef: event.data.entity._id}).then(function(results){
            var proms = results.map(function(placingToUpdate){
                placingToUpdate.race = event.data.entity;
                return placingService.update(placingToUpdate);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener("placing race flyweight deleter","Delete Race", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return placingService.find({raceRef: event.data.entity._id}).then(function(results){
            var proms = results.map(function(placing){
                return placingService.remove(placing);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener("placing greyhound flyweight updater","Updated Greyhound", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return placingService.find({greyhoundRef: event.data.entity._id}).then(function(results){
            var proms = results.map(function(placingToUpdate){
                placingToUpdate.greyhound = event.data.entity;
                return placingService.update(placingToUpdate);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener("placing greyhound deleted listener","Deleted Greyhound", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return placingService.find({greyhoundRef: event.data.entity._id}).then(function(results){
            var proms = results.map(function(placingToDelete){
                return placingService.remove(placingToDelete);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});