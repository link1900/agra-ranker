var helper = module.exports = {};

var url = require('url');
var _ = require('lodash');
var q = require('q');


helper.changeUrlParam = function(urlString, paramName, paramValue){
    var urlObject = url.parse(urlString, true);
    urlObject.query[paramName] = paramValue;
    delete urlObject.search;
    return url.format(urlObject);
};

helper.buildPagingLinks = function(urlString, currentPage, lastPage){
    var nextUrl = helper.changeUrlParam(urlString, 'page', currentPage+1);
    var lastUrl = helper.changeUrlParam(urlString, 'page', lastPage);
    return {
        next: nextUrl,
        last: lastUrl
    };
};

helper.cleanFk = function(dao, field, id, res){
    var query = {};
    query[field] = id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            res.send(500, 'error removing fk');
        } else {
            _.each(entities, function(entity){
                entity[field] = null;
                entity.save();
            });
        }
    });
};

helper.killChildren = function(dao, field, id, res){
    var query = {};
    query[field] = id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            res.send(500, 'error finding children to kill');
        } else {
            _.each(entities, function(entity){
                entity.remove();
            });
        }
    });
};

helper.pushChangeToFk = function(dao, fkField, parentId, parentValue, childField, res){
    var query = {};
    query[fkField] = parentId;
    dao.find(query).exec(function(err, entities){
        if (err) {
            console.log('error applying parent field to child field');
        } else {
            _.each(entities, function(entity){
                entity[childField] = parentValue;
                entity.save();
            });
        }
    });
};

helper.mergeBody = function(req, res, next) {
    req.model = _.extend(req.model, req.body);
    next();
};

helper.save = function(req, res) {
    req.model.save(function(err, savedModel) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(savedModel);
        }
    });
};

helper.savePromise = function(entity){
    var deferred = q.defer();
    entity.save(function(err, entity){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entity);
        }
    });
    return deferred.promise;
};

helper.saveEntityRequest = function(entityRequest){
    var deferred = q.defer();
    entityRequest.newEntity.save(function(err, entity){
        if (err){
            entityRequest.error = err;
            deferred.reject(entityRequest);
        } else {
            entityRequest.updatedEntity = entity;
            deferred.resolve(entityRequest);
        }
    });
    return deferred.promise;
};

helper.promiseToResponse = function(promise, res){
    promise.then(function(entityRequestResult){
        res.send(200, entityRequestResult.updatedEntity);
    })
    .fail(function(entityRequestResult){
        res.send(400, "update failed: " + entityRequestResult.error);
    });
};


helper.promiseResult = function(req, res, promise){
    promise.then(function(result){
        res.send(result.code, result.message);
    }).fail(function(result){
        res.send(result.code, result.message);
    });
};

helper.findPromise = function(query){
    var deferred = q.defer();
    query.exec(function(err, entities){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};


helper.getOne = function(req, res) {
    res.jsonp(req.model);
};

helper.runQuery = function(req, res) {
    var limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0){
        limit = req.param('per_page');
    }

    if (limit > 100) limit = 100;

    var offset = 0;
    if (req.param('page') && req.param('page') > 0){
        offset = req.param('page')-1;
    }

    var sort = {};
    if (req.param('sort_field') && req.param('sort_direction') && /asc|desc/i.test(req.param('sort_direction'))){
        sort[req.param('sort_field')] = req.param('sort_direction');
    }

    req.dao
        .find(req.searchQuery)
        .limit(limit)
        .skip(limit * offset)
        .sort(sort)
        .exec(
        function(err, entities) {
            if (err) {
                res.send(500, 'error running query');
            } else {
                req.dao.count(req.searchQuery).exec(function (err, count) {
                    //add header link info for paging
                    res.links(helper.buildPagingLinks(req.url, offset+1, count / limit));
                    res.set('total', count);
                    //send result
                    res.jsonp(entities);
                })
            }
        }
    );
};