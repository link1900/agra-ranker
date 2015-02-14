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

expressService.buildQuery = function(req, fields){
    var query = {};
    var specialChar = /~/;
    fields.map(function(field){
        if (field.match(specialChar)){
            if (field.match("~")){
                var fieldParts = field.split("~");
                if (fieldParts.length == 2){
                    query[fieldParts[0]] = {'$regex': req.param(fieldParts[1]), '$options' : 'i'};
                }
            }
        } else {
            if (req.param(field) != null){
                query[field] = req.param(field);
            }
        }
    });
    return query;
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

    controller.create = function(req, res) {
        expressService.promToRes(service.createPlacing(req.body), res);
    };

    controller.update = function(req, res) {
        expressService.promToRes(service.updatePlacing(req.model, req.body), res);
    };

    controller.destroy = function(req, res) {
        expressService.promToRes(service.remove(req.model), res);
    };
};

expressService.promToRes = function(promise, res){
    promise.then(function(result){
        res.jsonp(200, result);
    },function(error){
        helper.errorResponse(res, error);
    }).catch(function(ex){
        helper.errorResponse(res, ex);
    });
};
