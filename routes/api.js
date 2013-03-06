var config = require('../lib/config'),
escape = require('jade').runtime.escape,
pag = require('../lib/pag').pag,
util = require('../lib/util'),
EventProxy = require('eventproxy').EventProxy,
Avatar = require('../lib/avatar'),
tuerBase = require('../model/base');

exports.index = function(req, res) {
	req.session.title = 'API';
	req.session.template = 'api';
	res.render('api/index', {
		config: config,
		session: req.session
	});
};

exports.apply = function(req, res) {
	req.session.title = 'APPKEY申请';
	req.session.template = 'api';
	req.session.error = req.flash('error');
	res.render('api/apply', {
		config: config,
		session: req.session
	});
};

exports.edit = function(req, res) {

	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}

	tuerBase.findOne({
		userid: req.session.userdata._id.toString()
	},
	'apis', function(err, data) {
		if (err) {
			req.flash('error', err);
			res.redirect('back');
			return;
		}
		if (!data) {
			res.redirect('/api/apply');
			return;
		}

		req.session.title = 'APPKEY管理';
		req.session.template = 'api';
		req.session.error = req.flash('error');
		res.render('api/edit', {
			config: config,
			session: req.session,
            api:data
		});

	});

};

exports.update = function(req,res){

	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}

	var appname = req.body.appname.trim(),
	appabout = req.body.appabout.trim(),
	appaddress = req.body.appaddress.trim(),
	appcallback = req.body.appcallback.trim(),
	type = req.body.type;

	//校验
	var urlreg = /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;

	if (!appname || ! appabout || ! appaddress || ! appcallback || ! type) {
		req.flash('error', '提交数据不全');
		res.redirect('back');
		return;
	}
	if (appname.length > 20) {
		req.flash('error', '应用名称不能超过20个字节');
		res.redirect('back');
		return;
	}
	if (appabout.length > 200) {
		req.flash('error', '应用介绍不能超过200个字节');
		res.redirect('back');
		return;
	}
	if (appaddress.length > 50) {
		req.flash('error', '应用地址不能超过50个字节');
		res.redirect('back');
		return;
	}
	if (appcallback.length > 50) {
		req.flash('error', '回调地址不能超过50个字节');
		res.redirect('back');
		return;
	}
	if (!urlreg.test(appaddress)) {
		req.flash('error', '应用地址不合法,必须为http开头的URL地址');
		res.redirect('back');
		return;
	}
	if (!urlreg.test(appcallback)) {
		req.flash('error', '回调地址不合法,必须为http开头的URL地址');
		res.redirect('back');
		return;
	}

	tuerBase.findOne({
		userid: req.session.userdata._id
	},
	'apis', function(err, data) {
		if (err) {
			req.flash('error', err);
			res.redirect('back');
			return;
		}
		if (!data) {
			req.flash('error', '您还没有申请过appkey，请先申请');
			res.redirect('/api/apply');
			return;
		}
        console.log(appabout);
		tuerBase.updateById(data._id.toString(),{
            '$set':{
			    appname: appname,
			    appabout: appabout,
			    appaddress: appaddress,
			    appcallback: appcallback,
			    type: type
            }
		},
		'apis', function(err, data) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
				return;
			}

			req.session.template = 'api';
			req.session.title = 'APPKEY修改结果';

			res.render('api/result', {
				config: config,
				session: req.session,
                message:'修改成功!'
			});
		});

	});


};

exports.save = function(req, res) {

	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}

	var appname = req.body.appname.trim(),
	appabout = req.body.appabout.trim(),
	appaddress = req.body.appaddress.trim(),
	appcallback = req.body.appcallback.trim(),
	agree = req.body.agree,
	type = req.body.type;

	//校验
	var urlreg = /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;

	if (!appname || ! appabout || ! appaddress || ! appcallback || ! type) {
		req.flash('error', '提交数据不全');
		res.redirect('back');
		return;
	}
	if (appname.length > 20) {
		req.flash('error', '应用名称不能超过20个字节');
		res.redirect('back');
		return;
	}
	if (appabout.length > 200) {
		req.flash('error', '应用介绍不能超过200个字节');
		res.redirect('back');
		return;
	}
	if (appaddress.length > 50) {
		req.flash('error', '应用地址不能超过50个字节');
		res.redirect('back');
		return;
	}
	if (appcallback.length > 50) {
		req.flash('error', '回调地址不能超过50个字节');
		res.redirect('back');
		return;
	}
	if (!urlreg.test(appaddress)) {
		req.flash('error', '应用地址不合法,必须为http开头的URL地址');
		res.redirect('back');
		return;
	}
	if (!urlreg.test(appcallback)) {
		req.flash('error', '回调地址不合法,必须为http开头的URL地址');
		res.redirect('back');
		return;
	}
	if (!agree) {
		req.flash('error', '您必须阅读并确认开发者协议');
		res.redirect('back');
		return;
	}

	tuerBase.findOne({
		userid: req.session.userdata._id
	},
	'apis', function(err, data) {
		if (err) {
			req.flash('error', err);
			res.redirect('back');
			return;
		}
		if (data) {
			req.flash('error', '您已经申请过app key了，一个帐号只能申请一次,您可以到帐号设置中进行修改之前申请过的信息');
			res.redirect('back');
			return;
		}

		tuerBase.save({
			appname: appname,
			appabout: appabout,
			appaddress: appaddress,
			appcallback: appcallback,
			type: type,
			appkey: null,
			userid: req.session.userdata._id
		},
		'apis', function(err, data) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
				return;
			}

			req.session.template = 'api';
			req.session.title = 'api申请结果';

			res.render('api/result', {
				config: config,
                message:'恭喜您申请app key成功，您提交的信息如果被审核通过会第一时间发送到您的注册邮箱。',
				session: req.session
			});
		});

	});

};

exports.market = function(req, res) {

	var page = req.params.page,
	space = 15,
	proxy = new EventProxy();
	if (page && isNaN(page)) {
		res.redirect('404');
		return;
	} else if (page == undefined || page == 1) {
		page = 0;
	} else {
		page = page - 1;
	}

	var split = page * space,
	render = function(apis, apiscount) {
		req.session.title = '兔耳应用市场';
		req.session.template = 'api';

		res.render('api/market', {
			config: config,
			session: req.session,
			pag: new pag({
				cur: page + 1,
				space: space,
				total: apiscount,
				url: '/api/market'
			}).init(),
			apis: apis,
			apiscount: apiscount
		});
	};

	proxy.assign('Apis', 'ApisCount', render);

	tuerBase.findBySlice({},
	'apis', split, split + space, function(err, lists) {
		if (err) {
			res.redirect('500');
		} else {
			proxy.trigger('Apis', lists);
		}
	});

	tuerBase.getCount({},
	'apis', function(err, count) {
		if (err) {
			res.redirect('500');
		} else {
			proxy.trigger('ApisCount', count);
		}
	});

};

