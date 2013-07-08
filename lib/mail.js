/**
 * send mail class
 */

var nodemailer = require('nodemailer'),
util = require('../lib/util.js');

nodemailer.sendmail = true;

exports.send_mail = function(options, callback) {
	var _conf = {
		sender: 'admin@tuer.me',
        headers:{
        }
	};
    util.mix(_conf,options);
	nodemailer.send_mail(_conf, function(err, success) {
		if (err) callback(err);
		else callback(null,success);
	});
};

