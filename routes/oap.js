var tuerBase = require('../model/base'),
config = require('../lib/config'),
EventProxy = require('eventproxy').EventProxy;

var secret = function(req,res){
	if (req.session.is_login) {
		res.end('proceed to secret lair,extra data: ' + JSON.stringify(req.session.userdata));
	} else {
		res.redirect('404');
	}
};

exports.secret = secret;
