var tuerBase = require('../model/base'),
xss = require('xss'),
config = require('../lib/config'),
EventProxy = require('eventproxy').EventProxy;

var index = function(req, res) {
	if (req.session.is_login) {
		var id = req.session.userdata._id.toString(),
		proxy = new EventProxy(),
		render = function(ftips, dtips) {
			var data = ftips.concat(dtips);
            for(var i=0;i<data.length;i++){
                if(data[i].content) data[i].content = xss(data[i].content,{whiteList:{},stripIgnoreTag:true});
            }
			res.header('Content-Type', 'application/json');
			res.send('{"data":' + JSON.stringify(data) + '}');
		};

		proxy.assign('frinedsTips', 'diaryTips', render);

		tuerBase.findFriendsByUserId(id, function(err, tips) {
			if (err) {
				res.redirect('json_error');
			} else {
				proxy.trigger('frinedsTips', tips);
			}
		});

		tuerBase.findDiaryTipsByUserId(id, function(err, tips) {
			if (err) {
				res.redirect('json_error');
			} else {
				proxy.trigger('diaryTips', tips);
			}
		});
	} else {
		res.redirect('login');
	}
};

exports.index = index;
