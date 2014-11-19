'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var mongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = function(app, passport, db) {
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

    var sessionSec = process.env.SESSION_SECRET;

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

        // Express/Mongo session storage
        app.use(express.session({
            secret: sessionSec,
            store: new mongoStore({
                db: db.connection.db,
                collection: 'sessions'
            })
        }));

        // Use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        // Connect flash for flash messages
        app.use(flash());

        // Routes should be at the last
        app.use(app.router);

        // Setting static folder
        app.use(express.static(rootPath + '/public'));

    });
};
