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
    fields.map(function(field){
        if (req.param(field) != null){
            query[field] = req.param(field);
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
};