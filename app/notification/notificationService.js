var notificationService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var logger = require('winston');
var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
notificationService.active = process.env.SENDGRID_USERNAME != null &&
    process.env.SENDGRID_PASSWORD != null &&
    process.env.NODE_ENV != 'test';
notificationService.from = process.env.EMAIL_FROM || 'noreply@localhost';
notificationService.siteUrl = process.env.SITE_URL || "http://localhost:3000";

notificationService.createNewEmail = function(){
    return new sendgrid.Email();
};

/**
 * Sends an email using send grid
 */
notificationService.sendEmail = function(email){
    if (notificationService.active){
        var deferred = q.defer();
        if (process.env.EMAIL_OVERRIDE){
            to = process.env.EMAIL_OVERRIDE;
        }

        email.addSubstitution('-siteUrl-', notificationService.siteUrl);
        email.addSubstitution('-siteName-', "AGRA Ranker");
        email.setText(email.text + "\n\nBest regards,\nThe -siteName- Team\n-siteUrl-");
        email.setFrom(notificationService.from);
        email.fromname = "Agra Ranker";

        sendgrid.send(email, function(err, result) {
            if(err){
                logger.error("failed to send email due to : " + err);
                deferred.reject(err);

            }else{
                logger.info("successfully sent email to " + to);
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    } else {
        logger.warn("email was not sent as the email service was not active");
        return q({"email":"skipped"});
    }
};
