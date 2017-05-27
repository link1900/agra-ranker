const expressService = module.exports = {};

const _ = require('lodash');
const csv = require('csv');
const moment = require('moment-timezone');
const JSONStream = require('JSONStream');
const highland = require('highland');

expressService.setTotalHeader = function (res, service, query) {
    return service.count(query).then((count) => {
        res.set('total', count);
    });
};

expressService.parseSearchParams = function (req) {
    const parsed = {};
    parsed.limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0) {
        parsed.limit = parseInt(req.param('per_page'), 10);
    }

    if (parsed.limit > 100) parsed.limit = 100;

    parsed.offset = 0;
    if (req.param('page') && req.param('page') > 0) {
        parsed.offset = req.param('page') - 1;
    }

    parsed.sort = {};
    if (req.param('sort_field') && req.param('sort_direction') && /asc|desc/i.test(req.param('sort_direction'))) {
        parsed.sort[req.param('sort_field')] = req.param('sort_direction');
    }
    return parsed;
};

expressService.buildQueryFromRequest = function (req, fieldDefinitions) {
    return expressService.buildQuery(fieldDefinitions, req.query);
};

/**
 * Takes a list of fields and converts it to mongo query
 */
expressService.buildQuery = function (fieldDefinitions, valuesMap) {
    const queryFields = fieldDefinitions.map((fieldDefinition) => {
        return expressService.buildQueryForField(fieldDefinition, valuesMap);
    });
    return queryFields.reduce((previousValue, currentValue) => {
        if (currentValue != null) {
            return _.merge(previousValue, currentValue);
        } else {
            return previousValue;
        }
    }, {});
};

expressService.buildQueryForField = function (fieldDefinition, values) {
    if (fieldDefinition.match(/(\|\|)/)) {
        return expressService.buildQueryForOr(fieldDefinition, values);
    }
    if (fieldDefinition.match(/<=/)) {
        return expressService.buildQueryForLessThenOrEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match(/>=/)) {
        return expressService.buildQueryForGreaterThenOrEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match(/>/)) {
        return expressService.buildQueryForGreaterThen(fieldDefinition, values);
    }
    if (fieldDefinition.match(/</)) {
        return expressService.buildQueryForLessThen(fieldDefinition, values);
    }
    if (fieldDefinition.match('=')) {
        return expressService.buildQueryForEqual(fieldDefinition, values);
    }
    if (fieldDefinition.match('~')) {
        return expressService.buildQueryForLike(fieldDefinition, values);
    }

    return null;
};

expressService.buildQueryForEqual = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('=');
    if (values[definition[1]] != null) {
        query[definition[0]] = values[definition[1]];
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForGreaterThen = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('>');
    if (values[definition[1]] != null) {
        query[definition[0]] = { $gt: values[definition[1]] };
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLessThen = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('<');
    if (values[definition[1]] != null) {
        query[definition[0]] = { $lt: values[definition[1]] };
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForGreaterThenOrEqual = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('>=');
    if (values[definition[1]] != null) {
        query[definition[0]] = { $gte: values[definition[1]] };
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLessThenOrEqual = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('<=');
    if (values[definition[1]] != null) {
        query[definition[0]] = { $lte: values[definition[1]] };
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForLike = function (fieldDefinition, values) {
    const query = {};
    const definition = fieldDefinition.split('~');
    if (values[definition[1]] != null) {
        query[definition[0]] = { $regex: `^${values[definition[1]]}`, $options: 'i' };
        return query;
    } else {
        return null;
    }
};

expressService.buildQueryForOr = function (fieldDefinition, values) {
    const fieldSets = fieldDefinition.split('||');
    const queryFields = fieldSets.map((fieldSet) => {
        return expressService.buildQueryForField(fieldSet, values);
    }).filter((queryField) => {
        return queryField != null;
    });

    if (queryFields.length > 1) {
        return { $or: queryFields };
    } else {
        return null;
    }
};

expressService.addStandardMethods = function (controller, service) {
    controller.setModel = function (req, res, next, id) {
        service.findById(id).then((model) => {
            if (model == null) {
                return res.jsonp(404, { error: 'entity not found' });
            } else {
                req.model = model;
                return next();
            }
        }, (error) => {
            expressService.errorResponse(res, error);
        });
    };

    controller.getOne = function (req, res) {
        if (req.model != null) {
            res.jsonp(req.model);
        } else {
            res.jsonp(404, { error: 'entity not found' });
        }
    };

    controller.destroy = function (req, res) {
        expressService.promToRes(service.remove(req.model), res);
    };

    controller.create = function (req, res) {
        expressService.promToRes(service.createFromJson(req.body), res);
    };

    controller.update = function (req, res) {
        expressService.promToRes(service.updateFromJson(req.model, req.body), res);
    };
};

expressService.promToRes = function (promise, res) {
    promise.then((result) => {
        res.jsonp(200, result);
    }, (error) => {
        expressService.errorResponse(res, error);
    }).catch((ex) => {
        expressService.errorResponse(res, ex);
    });
};

expressService.errorResponse = function (res, error) {
    if (error instanceof Error && error.message != null) {
        res.jsonp(400, { error: error.message });
    } else {
        res.jsonp(400, { error });
    }
};

expressService.standardSearch = function (req, res, service, fields) {
    const query = expressService.buildQueryFromRequest(req, fields);
    const searchParams = expressService.parseSearchParams(req);
    return expressService.setTotalHeader(res, service, query).then(() => {
        return expressService.promToRes(service.find(query, searchParams.limit, searchParams.offset, searchParams.sort), res);
    });
};

expressService.streamCollectionToCSVResponse = function (res, findOptions, service, fileName, transformFunction) {
    const dbStream = service.findAsStream(findOptions.query, findOptions.limit, findOptions.offset, findOptions.sort);
    const transformer = csv.transform(transformFunction);

    dbStream.on('error', (err) => {
        expressService.errorResponse(res, err);
    });

    transformer.on('error', (err) => {
        expressService.errorResponse(res, err);
    });

    expressService.streamToCSVResponse(res, fileName, dbStream.pipe(transformer));
};

expressService.streamToCSVResponse = function (res, fileName, stream) {
    const stringifier = csv.stringify();

    res.setHeader('Content-disposition', `attachment; filename=${expressService.generateFileName(fileName, 'csv')}`);
    res.writeHead(200, {
        'Content-Type': 'text/csv'
    });

    stringifier.on('error', (err) => {
        expressService.errorResponse(res, err);
    });

    stream.pipe(stringifier).pipe(res);
};

expressService.streamCollectionToJSONResponse = function (req, res, service, fields, fileName, mapFunction) {
    const query = expressService.buildQueryFromRequest(req, fields);
    const searchParams = expressService.parseSearchParams(req);
    const dbStream = service.findAsStream(query, null, searchParams.offset, searchParams.sort);
    let stream = highland(dbStream);
    const jsonStream = JSONStream.stringify();
    res.setHeader('Content-disposition', `attachment; filename=${expressService.generateFileName(fileName, 'json')}`);
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    dbStream.on('error', (err) => {
        expressService.errorResponse(res, err);
    });

    if (mapFunction != null) {
        stream = stream.map(mapFunction);
    }

    stream.pipe(jsonStream).pipe(res);
};

expressService.streamPdfToResponse = function (res, pdfStream, fileName) {
    res.setHeader('Content-disposition', `attachment; filename=${expressService.generateFileName(fileName, 'pdf')}`);
    res.writeHead(200, {
        'Content-Type': 'application/pdf'
    });

    pdfStream.pipe(res);
};

expressService.generateFileName = function (prefix, extention) {
    return `${prefix}_${moment().format('YYYYMMDDHHmmss').toString()}.${extention}`;
};
