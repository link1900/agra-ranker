var expressService = module.exports = {};

var _ = require('lodash');
var q = require('q');

expressService.setTotalHeader = function(res, service){
    return service.count().then(function(count){
        res.set('total', count);
    });
};

expressService.parseSearchParams = function(req){
    var parsed = {};
    parsed.limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0){
        parsed.limit = req.param('per_page');
    }

    if (parsed.limit > 100) parsed.limit = 100;

    parsed.offset = 0;
    if (req.param('page') && req.param('page') > 0){
        parsed.offset = req.param('page')-1;
    }

    parsed.sort = {};
    if (req.param('sort_field') && req.param('sort_direction') && /asc|desc/i.test(req.param('sort_direction'))){
        parsed.sort[req.param('sort_field')] = req.param('sort_direction');
    }
    return parsed;
};

expressService.buildQueryFromRequest = function(req, fieldDefinitions){
    return expressService.buildQuery(fieldDefinitions, req.query);
};

/**
 * Takes a list of fields and converts it to mongo query
 */
expressService.buildQuery = function(fieldDefinitions, valuesMap){
    var specialChar = /[~=]|(\|\|)/;
    var queryFields = fieldDefinitions.map(function(fieldDefinition){
        if (fieldDefinition.match(specialChar)){
            return expressService.buildQueryForField(fieldDefinition, valuesMap);
        } else {
            return null;
        }
    });
    return queryFields.reduce(function(previousValue, currentValue){
        if (currentValue != null){
            return _.merge(previousValue, currentValue);
        } else {
            return previousValue;
        }
    }, {});
};

expressService.buildQueryForField = function(fieldDefinition, values){
    if (fieldDefinition.match(/(\|\|)/)){
        return expressService.buildQueryForOr(fieldDefinition,values);
    }
    if (fieldDefinition.match("=")){
        return expressService.buildQueryForEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match("~")){
        return expressService.buildQueryForLike(fieldDefinition, values);
    }
    return null;
};

expressService.buildQueryForEqual = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split("=");
    if (values[definition[1]] != null){
        query[definition[0]] = values[definition[1]];
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLike = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split("~");
    if (values[definition[1]] != null){
        query[definition[0]] = {'$regex': "^"+values[definition[1]], '$options' : 'i'};
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForOr = function(fieldDefinition, values){
    var fieldSets = fieldDefinition.split("||");
    var queryFields = fieldSets.map(function(fieldSet){
        return expressService.buildQueryForField(fieldSet, values);
    }).filter(function(queryField){
        return queryField != null;
    });

    if (queryFields.length > 1){
        return {"$or" : queryFields};
    } else {
        return null;
    }
};

expressService.addStandardMethods = function(controller, service){
    controller.setModel = function(req, res, next, id) {
        service.findById(id).then(function(model){
            if (!model) return next(new Error('Failed to load ' + id));
            req.model = model;
            return next();
        }, function(error){
            return next(error);
        });
    };

    controller.getOne = function(req, res){
        res.jsonp(req.model);
    };

    controller.destroy = function(req, res) {
        expressService.promToRes(service.remove(req.model), res);
    };
};

expressService.promToRes = function(promise, res){
    promise.then(function(result){
        res.jsonp(200, result);
    },function(error){
        expressService.errorResponse(res, error);
    }).catch(function(ex){
        expressService.errorResponse(res, ex);
    });
};

expressService.errorResponse = function(res, error){
    if (error instanceof Error && error.message != null){
        res.jsonp(400, {"error": error.message});
    } else {
        res.jsonp(400, {"error": error});
    }
};
