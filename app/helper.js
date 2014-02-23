var helper = module.exports = {};

var url = require('url');


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
    if (req.param('sort_field') && req.param('sort_direction') && /asc|des/i.test(req.param('sort_direction'))){
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