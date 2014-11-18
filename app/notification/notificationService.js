var notificationService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var logger = require('winston');
var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
notificationService.active = process.env.SENDGRID_USERNAME != null &&
    process.env.SENDGRID_PASSWORD != null &&
    process.env.NODE_ENV != 'test';
notificationService.from = process.env.EMAIL_FROM || 'noreply';

/**
 * Sends an email using send grid
 */
notificationService.sendEmail = function(to, subject, message){
    if (notificationService.active){
        var deferred = q.defer();
        var email = new sendgrid.Email();
        if (process.env.EMAIL_OVERRIDE){
            email.addTo(process.env.EMAIL_OVERRIDE);
        } else {
            email.addTo(to);
        }
        email.setFrom();
        email.setSubject(subject);
        email.addSubstitution('-name-', to);
        email.setText('Hi -name-,\n\n'+message+'\n\nRegards');
        sendgrid.send(email, function(err, result) {
            if(err){
                logger.error("failed to send email due to : " + err);
                deferred.reject(err);

            }else{
                logger.info("successfully sent email to " + email.to);
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    } else {
        logger.warn("email was not sent as the email service was not active");
        return q({"email":"skipped"});
    }
};
