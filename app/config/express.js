'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');

module.exports = function(app) {
    app.set('showStackError', true);

    // Prettify HTML
    app.locals.pretty = true;

    app.locals.cache = 'memory';
		
    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        // Levels are specified in a range of 0 to 9, where-as 0 is
        // no compression and 9 is best compression, but slowest
        level: 9
    }));

    // Only use logger for development environment
    if (process.env.NODE_ENV === 'development') {
        app.use(express.logger('dev'));
    }

    // Enable jsonp
    app.enable('jsonp callback');

    app.configure(function() {
        // The cookieParser should be above session
        app.use(express.cookieParser());

        // Request body parsing middleware should be above methodOverride
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());

        app.configure('production', function () {
            app.use (function (req, res, next) {
                var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
                if (schema === 'https') {
                    next();
                } else {
                    res.redirect('https://' + req.headers.host + req.url);
                }
            });
        });

        // Routes should be at the last
        app.use(app.router);

        app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
            res.status(err.status || 500);
            res.jsonp({
                message: err.message
            });
        });

        // Setting static folder
        var staticPath = path.normalize(__dirname + '/../../client');
        app.use(express.static(staticPath));

    });
};
