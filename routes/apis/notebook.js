var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
util = require('../../lib/util'),
querystring = require('querystring');

var notebookout = ['id', 'bgcolor', 'created_at', 'name'];

exports.user = function(req, res, next) {
	var uid = req.params.uid;
	if (uid) {
		tuerBase.findUser(uid, function(err, user) {
			if (err) next(err);
			else {
				var bookscount = user.notebooks + 1;
				tuerBase.findBy({
					owner: {
						'$in': [user._id.toString(), - 1]
					}
				},
				'notebooks', bookscount, function(err, notebooks) {
					if (err) next(err);
					else {
						for (var i = 0; i < notebooks.length; i++) {
							notebooks[i] = util.filterJson(notebooks[i], notebookout);
							if (notebooks[i].id === 1) {
								notebooks[i]['bgcolor'] = '4d67d1';
								notebooks[i]['created_at'] = user.created_at;
							}
						}
						util.setCharset(req, res, {
							data: notebooks,
							count: notebooks.length
						});
					}
				});
			}
		});
	} else {
		next(new restify.MissingParameterError('missing param uid'));
	}
};

exports.save = function(req, res, next) {
	if (req.body) {
		var bookname = req.body.bookname,
		owner = req.authorization.userdata._id.toString(),
		proxy = new EventProxy(),
		finded = function() {
			util.setCharset(req, res, {
				code: 'success',
				msg: '新建日记本成功'
			});
		},
		bgcolor = req.body.bgcolor || '4d67d1';
		if (!bookname || bookname.trim().length === 0) {
			next(new restify.MissingParameterError('missing bookname'));
			return;
		}
		if (bgcolor.length != 6) {
			next(new restify.InvalidArgumentError('bgcolor not invalid'));
			return;
		}
		proxy.assign('updateUser', 'saveBook', 'addfeed', finded);
		//增加限制个数的检测
		tuerBase.getIds('notebook', function(err, obj) {
			if (err) {
				next(err);
			} else {
				tuerBase.save({
					id: obj.id,
					owner: owner,
					name: name,
					bgcolor: bgcolor
				},
				'notebooks', function(err, books) {
					if (err) {
						next(err);
					} else {
						proxy.trigger('saveBook');
						tuerBase.updateById(owner, {
							'$inc': {
								notebook: 1
							}
						},
						'users', function(err) {
							if (err) {
								next(err);
							} else {
								proxy.trigger('updateUser');
							}
						});
						tuerBase.addFeed({
							type: 'notebook',
							uid: owner.toString(),
							id: books[0]._id.toString()
						},
						function(err) {
							if (err) {
								next(err);
							} else {
								proxy.trigger('addfeed');
							}
						});
					}
				});
			}
		});
	} else {
		next(new restify.MissingParameterError('missing params'));
	}
};
//默认日记不可编辑
exports.edit = function(req, res, next) {
	var bookid = req.params.id;
	if (bookid) {
		tuerBase.findById(bookid, 'notebooks', function(err, book) {
			if (err) next(err);
			else {
				var bookname = req.body.bookname,
				bgcolor = req.body.bgcolor,
				owner = req.authorization.userdata._id.toString();
				if (book.owner == - 1) {
					next(new restify.NotAuthorizedError('默认日记不能修改'));
				} else if (owner === book.owner) {
					var data = {};
					if (bookname) data['name'] = bookname;
					if (bgcolor) data['bgcolor'] = bgcolor;
					tuerBase.updateById(bookid, {
						'$set': data
					},
					'notebooks', function(err, book) {
						if (err) {
							next(err);
						} else {
							util.setCharset(req, res, {
								code: 'success',
								msg: '编辑日记本成功'
							});
						}
					});
				} else {
					next(new restify.NotAuthorizedError('not authorized'));
				}
			}
		});
	} else {
		next(new restify.MissingParameterError('missing params'));
	}
};
//默认日记不可以删除
exports.del = function(req, res, next) {
	var bookid = req.params.id;
	if (bookid) {
		tuerBase.findById(bookid, 'notebooks', function(err, book) {
			if (err) next(err);
			else {
				var owner = req.authorization.userdata._id.toString(),
                    bookid = book._id.toString(),
                    uid = owner;
				if (owner == - 1) {
					next(new restify.NotAuthorizedError('默认日记不能被删除'));
				} else if (owner === book.owner) {
					var proxy = new EventProxy(),
					finded = function() {
						util.setCharset(req, res, {
							code: 'success',
							msg: '删除日记本成功'
						});
					};
					proxy.assign('rmbook', 'rmbooklen', 'mvDefault', 'rmfeed', finded);

					tuerBase.removeFeed(bookid, function(err) {
						if (err) {
                            next(err);
						} else {
							proxy.trigger('rmfeed');
						}
					});

					tuerBase.removeById(bookid, 'notebooks', function(err, num) {
						if (err) {
                            next(err);
						} else {
							proxy.trigger('rmbook');
						}
					});

					tuerBase.getCount({
						notebook: bookid
					},
					'diary', function(err, len) {
						tuerBase.findBy({
							userid: uid.toString(),
							notebook: bookid
						},
						'diary', len, function(err, diaries) {
							if (err) {
                                next(err);
							} else {
								var ids = function() {
									var ret = [];
									diaries.forEach(function(item) {
										ret.push(item._id);
									});
									return ret;
								} ();
								tuerBase.findBy({
									owner: - 1
								},
								'notebooks', 1, function(err, notebooks) {
									if (err && ! notebooks.length) {
                                        next(err);
									} else {
										var defaultBookId = notebooks[0]._id.toString();
										tuerBase.update({
											_id: {
												'$in': ids
											}
										},
										{
											$set: {
												notebook: defaultBookId
											}
										},
										'diary', function(err, ret) {
											if (err) {
                                                next(err);
											} else {
												proxy.trigger('mvDefault');
											}
										});

									}
								});
							}
						});
					});

					tuerBase.updateById(uid, {
						'$inc': {
							notebook: - 1
						}
					},
					'users', function(err, user) {
						if (err) {
                            next(err);
						} else {
							proxy.trigger('rmbooklen');
						}
					});
				} else {
					next(new restify.NotAuthorizedError('not authorized'));
				}
			}
		});
	} else {
		next(new restify.MissingParameterError('missing params'));
	}
};

