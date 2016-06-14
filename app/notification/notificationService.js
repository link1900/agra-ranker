var notificationService = module.exports = {};

var q = require('q');
var logger = require('winston');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', '..', 'emails');
var emailTemplates = require('email-templates');

notificationService.from = process.env.EMAIL_FROM || 'noreply@localhost';
notificationService.siteUrl = process.env.SITE_URL || "http://localhost:3000";

notificationService.sendMailByTransport = function(email){
    email.from = process.env.EMAIL_FROM;
    if (notificationService.isActive()){
        return new Promise(function(resolve, reject){
            notificationService.smtpTransport.sendMail(email, function(error){
                if(error){
                    logger.error(error);
                    reject(error);
                }else{
                    logger.info("successfully sent email to " + email.to);
                    resolve();
                }
            });
        })

    } else {
        logger.warn("skipping email has email service is not active");
        Promise.resolve();
    }
};

notificationService.getSMTPSettings = function(){
    var settings = {};
    if (process.env.SMTP_HOST){
            settings.host = process.env.SMTP_HOST;
    }
    if (process.env.SMTP_PORT){
            settings.port = process.env.SMTP_PORT;
    }
    if (process.env.SMTP_USERNAME || process.env.SMTP_PASSWORD){
            settings.auth = {};
            if (process.env.SMTP_USERNAME){
                    settings.auth.user = process.env.SMTP_USERNAME;
            }
            if (process.env.SMTP_PASSWORD){
                    settings.auth.pass = process.env.SMTP_PASSWORD;
            }
    }

    return settings;
};

notificationService.isActive = function(){
    return process.env.SMTP_HOST != null && process.env.SMTP_PORT != null  && process.env.NODE_ENV != 'test';
};

notificationService.smtpTransport = nodemailer.createTransport(smtpTransport(notificationService.getSMTPSettings()));

/**
 * Sends an email using the configured smtp transport
 * mailOptions field include
 * from, to, subject, text, html
 */
notificationService.sendEmail = function(email){
    if (process.env.EMAIL_OVERRIDE){
        logger.info("changing email destination was " + email.to + " in now " + process.env.EMAIL_OVERRIDE);
        email.to = process.env.EMAIL_OVERRIDE;
    }

    return notificationService.getTemplate(email)
        .then(notificationService.parseTemplate)
        .then(notificationService.sendMailByTransport);
};

notificationService.getTemplate = function(email){
    var deferred = q.defer();
    emailTemplates(templatesDir, function(templateReadError, template) {
        if (templateReadError) {
            logger.error(new Error("failed to send email due to template error: " + templateReadError));
            deferred.reject(templateReadError);
        } else {
            email.templateService = template;
            deferred.resolve(email);
        }
    });
    return deferred.promise;
};

notificationService.parseTemplate = function(email){
    var deferred = q.defer();
    email.subs.siteUrl = notificationService.siteUrl;
    email.subs.siteName = "AGRA Ranker";
    email.subs.email = email.to;
    email.subject = notificationService.parseText(email.subject);
    email.templateService(email.template, email.subs, function(templateParseError, html, text) {
        if (templateParseError) {
            logger.error(new Error("failed to send email due to template parse error: " + templateParseError));
            deferred.reject(templateParseError);
        } else {
            email.html = html;
            email.text = text;
            deferred.resolve(email);
        }
    });
    return deferred.promise;
};

notificationService.parseText = function(text, replacers){
    return handlebars.compile(text)(replacers);
};