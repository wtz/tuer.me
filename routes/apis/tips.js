var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
util = require('../../lib/util'),
querystring = require('querystring');

var tipsout = ['_id', 'content', 'id', 'type'];

exports.all = function(req, res, next) {
	var id = req.authorization.userdata._id.toString(),
	proxy = new EventProxy(),
	render = function(ftips, dtips) {
		var data = ftips.concat(dtips);
		for (var i = 0; i < data.length; i++) {
			if (data[i].nick) {
				data[i].type = 'user';
				data[i].content = data[i].nick + '开始关注你了';
			} else {
				data[i].type = 'reply';
				data[i].content = data[i].content.slice(0, 15) + '有了一条新回复';
			}

			data[i] = util.filterJson(data[i], tipsout);
		}
		util.setCharset(req, res, {
			data: data,
			count: data.length
		});
	};
	proxy.assign('frinedsTips', 'diaryTips', render);
	tuerBase.findFriendsByUserId(id, function(err, tips) {
		if (err) {
			next(err);
		} else {
			proxy.trigger('frinedsTips', tips);
		}
	});

	tuerBase.findDiaryTipsByUserId(id, function(err, tips) {
		if (err) {
			next(err);
		} else {
			proxy.trigger('diaryTips', tips);
		}
	});
};

exports.del = function(req, res, next) {
	var id = req.params.id;
	if (id) {
		tuerBase.findById(id, 'diary', function(err, diary) {
			if (err) {
				tuerBase.findById(id, 'users', function(err, user) {
					if (err) {
						next(err);
					} else {
						tuerBase.removeFriendsTips(req.authorization.userdata._id.toString(),user._id);
						util.setCharset(req, res, {
							code: 'success',
							msg: '删除消息成功'
						});
					}
				});
			} else {
				tuerBase.removeDiaryTips(req.authorization.userdata._id, diary._id);
				util.setCharset(req, res, {
					code: 'success',
					msg: '删除消息成功'
				});
			}
		});
	} else {
		next(new restify.MissingParameterError('missing param id'));
	}
};

