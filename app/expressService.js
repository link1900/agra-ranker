var expressService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var csv = require('csv');
var moment = require('moment');
var JSONStream = require('JSONStream');

expressService.setTotalHeader = function(res, service, query){
    return service.count(query).then(function(count){
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
    var queryFields = fieldDefinitions.map(function(fieldDefinition){
        return expressService.buildQueryForField(fieldDefinition, valuesMap);
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
        return expressService.buildQueryForOr(fieldDefinition, values);
    }
    if (fieldDefinition.match(/<=/)){
        return expressService.buildQueryForLessThenOrEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match(/>=/)){
        return expressService.buildQueryForGreaterThenOrEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match(/>/)){
        return expressService.buildQueryForGreaterThen(fieldDefinition, values);
    }
    if (fieldDefinition.match(/</)){
        return expressService.buildQueryForLessThen(fieldDefinition, values);
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

expressService.buildQueryForGreaterThen = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split(">");
    if (values[definition[1]] != null){
        query[definition[0]] = {"$gt":  values[definition[1]]};
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLessThen = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split("<");
    if (values[definition[1]] != null){
        query[definition[0]] = {"$lt":  values[definition[1]]};
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForGreaterThenOrEqual = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split(">=");
    if (values[definition[1]] != null){
        query[definition[0]] = {"$gte":  values[definition[1]]};
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLessThenOrEqual = function(fieldDefinition, values){
    var query = {};
    var definition = fieldDefinition.split("<=");
    if (values[definition[1]] != null){
        query[definition[0]] = {"$lte":  values[definition[1]]};
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
            if (model == null) {
                res.jsonp(404, {"error": "entity not found"});
            } else {
                req.model = model;
                return next();
            }

        }, function(error){
            expressService.errorResponse(res, error);
        });
    };

    controller.getOne = function(req, res){
        if (req.model != null){
            res.jsonp(req.model);
        } else {
            res.jsonp(404, {"error": "entity not found"});
        }

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

expressService.standardSearch = function(req, res, service, fields){
    var query = expressService.buildQueryFromRequest(req, fields);
    var searchParams = expressService.parseSearchParams(req);
    return expressService.setTotalHeader(res, service, query).then(function(){
        return expressService.promToRes(service.find(query, searchParams.limit, searchParams.offset, searchParams.sort), res);
    });
};

expressService.streamCollectionToCSVResponse = function(req, res, service, fields, fileName, transformFunction){
    var query = expressService.buildQueryFromRequest(req, fields);
    var searchParams = expressService.parseSearchParams(req);
    var dbStream = service.findAsStream(query, null, searchParams.offset, searchParams.sort);
    var transformer = csv.transform(transformFunction);
    var stringifier = csv.stringify();

    res.setHeader('Content-disposition', 'attachment; filename='+expressService.generateFileName(fileName, "csv"));
    res.writeHead(200, {
        'Content-Type': 'text/csv'
    });

    dbStream.on('error', function (err) {
        expressService.errorResponse(res, err);
    });

    transformer.on('error', function (err) {
        expressService.errorResponse(res, err);
    });

    stringifier.on('error', function (err) {
        expressService.errorResponse(res, err);
    });

    dbStream.pipe(transformer).pipe(stringifier).pipe(res);
};

expressService.streamCollectionToJSONResponse = function(req, res, service, fields, fileName, mapFunction){
    var query = expressService.buildQueryFromRequest(req, fields);
    var searchParams = expressService.parseSearchParams(req);
    var dbStream = service.findAsStream(query, null, searchParams.offset, searchParams.sort);
    var jsonStream = JSONStream.stringify();
    res.setHeader('Content-disposition', 'attachment; filename='+expressService.generateFileName(fileName, "json"));
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    dbStream.on('error', function (err) {
        expressService.errorResponse(res, err);
    });

    dbStream.pipe(jsonStream).pipe(res);
};

expressService.generateFileName = function(prefix, extention){
    return prefix + "_" + moment().format('YYYYMMDDHHmmss').toString() + "." + extention;
};