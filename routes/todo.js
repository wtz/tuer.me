var tuerBase = require('../model/base'),
config = require('../lib/config'),
pag = require('../lib/pag').pag,
EventProxy = require('eventproxy').EventProxy;

exports.finished = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	res.header('Content-Type', 'application/json');
	var id = req.body.id,
	uid = req.session.userdata._id;
	if (!id) {
		res.send('{"ret":false,"error":"非法操作"}');
	} else {
		var proxy = new EventProxy(),
		render = function(user, todo) {
		};
		proxy.assign('user', 'todo');
		tuerBase.findUser(uid, function(err, user) {
			if (err) {
				res.send('{"ret":false,"error":"' + err + '"}');
			} else {
				tuerBase.findById(id, 'todos', function(err, todo) {
					if (err) {
						res.send('{"ret":false,"error":"' + err + '"}');
					} else {
                        var finished = todo.finished ? false : true;
						tuerBase.updateById(id, {
							'$set': {
                                finished:finished 
							}
						},
						'todos', function(err) {
							if (err) {
								res.send('{"ret":false,"error":"' + err + '"}');
							} else {
								res.send('{"ret":true,"finished":'+finished+'}');
							}
						});
					}
				});
			}
		});
	}

};

exports.index = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	var uid = req.session.userdata._id,
	space = 30,
	page = isNaN(req.query.page) ? 0: req.query.page - 1,
	proxy = new EventProxy(),
	render = function(user, todolist) {
		req.session.title = "我的TODO";
		req.session.template = "todo-index";
		req.session.success = req.flash('success');
		req.session.error = req.flash('error');
		res.render('todo/index', {
			todolist: todolist,
			pag: new pag({
				cur: page + 1,
				space: space,
				total: user.todocount,
				split: '=',
				url: '/todo?page'
			}).init(),
			user: user,
			session: req.session,
			config: config
		});
	};

	proxy.assign('user', 'todolist', render);

	tuerBase.findUser(uid, function(err, user) {
		if (err) {
			res.redirect('500');
		} else {
			proxy.trigger('user', user);
			tuerBase.findBySortSlice({
				userid: uid.toString()
			},
			{
				important: - 1,
				_id: - 1
			},
			'todos', page * space, page * space + space, function(err, todolist) {
				if (err) {
					res.redirect('500');
				} else {
					proxy.trigger('todolist', todolist);
				}
			});
		}
	});
};

exports.detail = function(req, res) {
	var id = req.params.id,
	space = 30,
	page = isNaN(req.query.page) ? 0: req.query.page - 1,
	proxy = new EventProxy(),
	render = function(user, isSelf, todolist) {

		req.session.title = user.nick + "的TODO";
        if(isSelf) req.session.template = "mytodo";
        else req.session.template = "tododetail";

		res.render('todo/detail', {
			todolist: todolist,
			isSelf: isSelf,
			pag: new pag({
				cur: page + 1,
				space: space,
				total: user.todocount,
				split: '=',
				url: '/todo/' + id + '?page'
			}).init(),
			user: user,
			session: req.session,
			config: config
		});
	};
	proxy.assign('user', 'isSelf', 'todolist', render);
	tuerBase.findUser(id, function(err, user) {
		if (err || ! user) {
			res.redirect('404');
		} else {
			proxy.trigger('user', user);
			var isSelf = req.session.is_login ? req.session.userdata._id.toString() == user._id: false;
			proxy.trigger('isSelf', isSelf);
			tuerBase.findBySortSlice({
				userid: user._id.toString()
			},
			{
				important: - 1,
				_id: - 1
			},
			'todos', page * space, page * space + space, function(err, todolist) {
				if (err) {
					res.redirect('500');
				} else {
					proxy.trigger('todolist', todolist);
				}
			});
		}
	});
};

exports.save = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	var uid = req.session.userdata._id,
	content = req.body.content,
	important = req.body.important,
	finished = false;
	if (!content && ! important) {
		req.flash('error', '非法操作');
		res.redirect('back');
		return;
	}
	if (content.trim().length > 100 || content.trim().length < 1) {
		req.flash('error', 'todo内容应小于100字大于0字');
		res.redirect('back');
		return;
	}
	if (!important.trim() || isNaN(important) || important < 0 || important > 100) {
		req.flash('error', '优先级应该为数字并大于0小于100');
		res.redirect('back');
		return;
	}
	tuerBase.save({
		content: content,
		finished: finished,
		userid: uid,
		important: parseInt(important, 10)
	},
	'todos', function(err, ret) {
		if (err) {
			req.flash('error', err);
			res.redirect('back');
		} else {
			tuerBase.updateById(uid, {
				'$inc': {
					'todocount': 1
				}
			},
			'users', function(err) {
				if (err) {
					req.flash('error', err);
				} else {
					req.flash('success', '新增todo成功');
                    
				}
				res.redirect('back');
                tuerBase.addFeed({
                    type:'todo',
                    uid:uid.toString(),
                    id:ret[0]['_id'].toString()
                },function(err,ret){
                    if(err) throw err;
                });
			});
		}
	});
};

exports.update = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	var uid = req.session.userdata._id,
	id = req.body.id,
	important = req.body.important;
	if (!id && ! important) {
		req.flash('error', '非法操作');
		res.redirect('back');
		return;
	}
	if (!important.trim() || isNaN(important) || important < 0 || important > 100) {
		req.flash('error', '优先级应该为数字并大于0小于100');
		res.redirect('back');
		return;
	}
	tuerBase.updateById(id, {
		'$set': {
			important: parseInt(important, 10)
		}
	},
	'todos', function(err) {
		if (err) {
			req.flash('error', err);
		} else {
			req.flash('success', '修改优先级成功');
		}
		res.redirect('back');
	});

};

exports.remove = function(req, res) {
	if (!req.session.is_login) {
		res.redirect('login');
		return;
	}
	var uid = req.session.userdata._id,
	id = req.body.id;
	if (!id) {
		req.flash('error', '非法操作');
		res.redirect('back');
		return;
	}

	tuerBase.removeById(id, 'todos', function(err) {
		if (err) {
			req.flash('error', err);
			res.redirect('back');
		} else {
			tuerBase.updateById(uid, {
				'$inc': {
					'todocount': - 1
				}
			},
			'users', function(err) {
				if (err) {
					req.flash('error', err);
				} else {
					req.flash('success', '删除todo条目成功');
				}
				res.redirect('back');
                tuerBase.removeFeed(id,function(err){
                    if(err) throw err;
                });
			});
		}
	});
};

