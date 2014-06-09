var tuerBase = require('../model/base'),
fs = require('fs-extra'),
uuid = require('node-uuid'),
path = require('path'),
util = require('../lib/util'),
Avatar = require('../lib/avatar'),
pag = require('../lib/pag').pag,
config = require('../lib/config'),
rootdir = config.rootdir,
EventProxy = require('eventproxy').EventProxy;

exports.upload = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	var uid = req.session.userdata._id,
	uploadPic = req.files.file,
	date = new Date(),
	temp_path = uploadPic.path,
	type = function() {
		var _type;
		try {
			_type = '.' + uploadPic.type.split('/')[1];
		} catch(e) {
			return ".undef";
		}
		return _type;
	} (),
	url = 'simg/' + date.getYear() + date.getMonth() + '/' + uuid.v1() + type,
	host = 'http://img.tuer.me/',
	filepath = rootdir + '/public/' + url;
	tuerBase.findUser(uid, function(err, user) {
		if (err) {
			res.send('<script>window.top.uploadSucces(' + JSON.stringify({
				error: err
			}) + ')</script>');
		} else {
			fs.move(temp_path, filepath, function(err) {
				if (err) {
					res.send('<script>window.top.uploadSucces(' + JSON.stringify({
						error: err
					}) + ')</script>');
				} else {
					tuerBase.save({
						uid: user.id,
						url: host + url
					},
					'images', function(err, data) {});
					res.send('<script>window.top.uploadSucces(' + JSON.stringify({
						uid: user.id,
						url: host + url
					}) + ')</script>');
				}
			});
		}
	});
};

