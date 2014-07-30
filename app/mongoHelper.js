var mongoHelper = module.exports = {};

var _ = require('lodash');
var q = require('q');

mongoHelper.findAny = function(dao, search){
    var deferred = q.defer();
    dao.find(search).exec(function(err, results){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};