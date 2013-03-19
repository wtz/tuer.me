var tuerBase = require('../model/base'),
config = require('../lib/config'),
mail = require('../lib/mail'),
util = require('../lib/util'),
pag = require('../lib/pag').pag,
Avatar = require('../lib/avatar'),
EventProxy = require('eventproxy').EventProxy;

exports.index = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {
		req.session.title = '首页';
		req.session.template = 'index';
		res.render('admin/index', {
			config: config,
			session: req.session
		});
	} else {
		res.redirect('login');
	}
};

exports.users = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {

		var page = req.params.page,
		space = 100,
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
		render = function(users, usersCount) {


			req.session.title = '用户管理';
			req.session.template = 'users';

            users.forEach(function(item){
			    item.avatarUrl = Avatar.getUrl(item._id);
		        util.setDay(item);
            });

			res.render('admin/users/index', {
				config: config,
				session: req.session,
				users: users,
				usersCount: usersCount,
				pag: new pag({
					cur: page + 1,
					space: space,
					total: usersCount,
					url: '/admin/users'
				}).init()
			});

		};

		proxy.assign('users', 'usersCount', render);

		tuerBase.findBySlice({
            isadmin:false || undefined
        },
		'users', split, split + space, function(err, lists) {
			if (err) {
				res.redirect('500');
			} else {
				proxy.trigger('users', lists);
			}
		});
		tuerBase.getCount({
            isadmin:false || undefined
        },
		'users', function(err, count) {
			if (err) {
				res.redirect('500');
			} else {
				proxy.trigger('usersCount', count);
			}
		});

	} else {
		res.redirect('login');
	}
};

exports.adminusers = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {

		var page = req.params.page,
		space = 100,
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
		render = function(users, usersCount) {


			req.session.title = '管理员列表';
			req.session.template = 'users';

            users.forEach(function(item){
			    item.avatarUrl = Avatar.getUrl(item._id);
		        util.setDay(item);
            });

			res.render('admin/users/admins', {
				config: config,
				session: req.session,
				users: users,
				usersCount: usersCount,
				pag: new pag({
					cur: page + 1,
					space: space,
					total: usersCount,
					url: '/admin/admins'
				}).init()
			});

		};

		proxy.assign('users', 'usersCount', render);

		tuerBase.findBySlice({
            isadmin:true
        },
		'users', split, split + space, function(err, lists) {
			if (err) {
				res.redirect('500');
			} else {
				proxy.trigger('users', lists);
			}
		});
		tuerBase.getCount({
            isadmin:true
        },
		'users', function(err, count) {
			if (err) {
				res.redirect('500');
			} else {
				proxy.trigger('usersCount', count);
			}
		});

	} else {
		res.redirect('login');
	}
};
exports.todos = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {
		req.session.title = 'TODO管理';
		req.session.template = 'todos';
		res.render('admin/todos/index', {
			config: config,
			session: req.session
		});
	} else {
		res.redirect('login');
	}
};
exports.appkey = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {
		req.session.title = 'APPKEY管理';
		req.session.template = 'api';
		res.render('admin/api/index', {
			config: config,
			session: req.session
		});
	} else {
		res.redirect('login');
	}
};
exports.tip = function(req, res) {
	if (req.session.is_login && req.session.userdata.isadmin) {
		req.session.title = '公告管理';
		req.session.template = 'tip';
		res.render('admin/tip/index', {
			config: config,
			session: req.session
		});
	} else {
		res.redirect('login');
	}
};

