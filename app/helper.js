const helper = module.exports = {};

const url = require('url');
const _ = require('lodash');
const q = require('q');

helper.changeUrlParam = function (urlString, paramName, paramValue) {
    const urlObject = url.parse(urlString, true);
    urlObject.query[paramName] = paramValue;
    delete urlObject.search;
    return url.format(urlObject);
};

helper.buildPagingLinks = function (urlString, currentPage, lastPage) {
    const nextUrl = helper.changeUrlParam(urlString, 'page', currentPage + 1);
    const lastUrl = helper.changeUrlParam(urlString, 'page', lastPage);
    return {
        next: nextUrl,
        last: lastUrl
    };
};

helper.mergeBody = function (req, res, next) {
    req.model = _.extend(req.model, req.body);
    next();
};

helper.save = function (req, res) {
    req.model.save((err, savedModel) => {
        if (err) {
            res.jsonp({ error: err.errors });
        } else {
            res.jsonp(savedModel);
        }
    });
};

helper.saveEntityRequest = function (entityRequest) {
    const deferred = q.defer();
    entityRequest.newEntity.save((err, entity) => {
        if (err) {
            entityRequest.error = err;
            deferred.reject(entityRequest);
        } else {
            entityRequest.savedEntity = entity;
            deferred.resolve(entityRequest);
        }
    });
    return deferred.promise;
};

helper.promiseToResponse = function (promise, res) {
    promise.then((entityRequestResult) => {
        res.jsonp(200, entityRequestResult.savedEntity);
    })
    .fail((error) => {
        res.jsonp(400, { error: `failed: ${error}` });
    });
};

helper.responseFromPromise = function (res, promise) {
    promise.then((result) => {
        res.jsonp(200, result);
    }, (error) => {
        helper.errorResponse(res, error);
    }).catch((ex) => {
        helper.errorResponse(res, ex);
    });
};

helper.errorResponse = function (res, error) {
    if (error instanceof Error && error.message != null) {
        res.jsonp(400, { error: error.message });
    } else {
        res.jsonp(400, { error });
    }
};

helper.mergeEntityRequest = function (entityRequest) {
    const existing = _.clone(entityRequest.existingEntity.toObject());
    entityRequest.newEntity = _.extend(entityRequest.existingEntity, entityRequest.newEntity);
    entityRequest.existingEntity = existing;
    return q(entityRequest);
};

helper.checkExisting = function (dao, field, entityRequest) {
    const deferred = q.defer();
    const query = {};
    query[field] = entityRequest.newEntity[field];
    dao.findOne(query, (err, existingEntity) => {
        if (err) {
            deferred.reject(`error validate existing check: ${err}`);
        }
        if (existingEntity && !(entityRequest.newEntity._id && _.isEqual(existingEntity._id.toString(), entityRequest.newEntity._id.toString()))) {
            deferred.reject(`entity already exists with same ${field}`);
        } else {
            deferred.resolve(entityRequest);
        }
    });
    return deferred.promise;
};

helper.promiseResult = function (req, res, promise) {
    promise.then((result) => {
        res.jsonp(result.code, result.message);
    }).fail((result) => {
        res.jsonp(result.code, result.message);
    });
};

helper.getOne = function (req, res) {
    res.jsonp(req.model);
};

helper.runDistinctQuery = function (req, res) {
    req.dao.distinct(req.distinctField, (err, results) => {
        if (err) {
            res.jsonp(500, { error: 'failed to run query' });
        } else {
            res.jsonp(results);
        }
    });
};

helper.runQuery = function (req, res) {
    let limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0) {
        limit = parseInt(req.param('per_page'), 10);
    }

    if (limit > 100) limit = 100;

    let offset = 0;
    if (req.param('page') && req.param('page') > 0) {
        offset = req.param('page') - 1;
    }

    const sort = {};
    if (req.param('sort_field') && req.param('sort_direction') && /asc|desc/i.test(req.param('sort_direction'))) {
        sort[req.param('sort_field')] = req.param('sort_direction');
    }

    req.dao
        .find(req.searchQuery)
        .limit(limit)
        .skip(limit * offset)
        .sort(sort)
        .exec(
        (err, entities) => {
            if (err) {
                res.jsonp(500, { error: 'failed to run query' });
            } else {
                req.dao.count(req.searchQuery).exec((err2, count) => {
                    // add header link info for paging
                    res.links(helper.buildPagingLinks(req.url, offset + 1, count / limit));
                    res.set('total', count);
                    // send result
                    res.jsonp(entities);
                });
            }
        }
    );
};

helper.addField = function (query, field, statement) {
    if (query[field]) {
        query[field] = _.extend(query[field], statement);
    } else {
        query[field] = statement;
    }
};
