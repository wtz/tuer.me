var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
util = require('../../lib/util'),
querystring = require('querystring');

var diaryout = ['id', 'content', 'bookname', 'bookid', 'created_user', 'pageurl', 'privacy', 'location', 'mood', 'weather', 'img', 'created_at','commentcount'];

function batchDiary(data, isSelf) {
	if (data.mood === null) data.mood = '';
	if (data.weather === null) data.weather = '';
	if (data['location'] === null) data['location'] = '';
	if (data.img === false) data.img = '';
	if (data.created_at) data.created_at = new Date(data.created_at).valueOf();
	if (data.privacy == 1) {
		if (!isSelf) delete data['content'];
		data.privacy = 1;
	}
	return data;
}

function forBatchDiary(datas, isSelf) {
	for (var i = 0; i < datas.length; i++) {
		datas[i] = batchDiary(util.filterJson(datas[i], diaryout), isSelf);
	}
	return datas;
}

exports.info = function(req, res, next) {
	var id = req.params.id;
	if (id) {
		tuerBase.findDiaryById(id, function(err, data) {
			if (err) next(err);
			else {
				if (data) {
					var isSelf = req.authorization ? req.authorization.userdata._id.toString() == data.userid: false;
					data = batchDiary(util.filterJson(data, diaryout), isSelf);
					util.setCharset(req, res, data);
				} else {
					next(new restify.InvalidCredentialsError('this diary not exist'));
				}
			}
		});
	} else {
		next(new restify.MissingParameterError('missing param diary id'));
	}
};

exports.edit = function(req, res, next) {
	var id = req.params.id;
	if (req.body || id) {
		var content = req.body.content,
		bookid = req.body.bookid,
		privacy = req.body.privacy,
		location = req.body.location,
		mood = req.body.mood,
        forbid = req.body.forbid,
		weather = req.body.weather,
		update = {};

		if (content) {
			content = content.trim();
			if (content === '') {
				next(new restify.InvalidArgumentError('日记内容不能为空'));
				return;
			}
			if (content.length > 22000) {
				next(new restify.InvalidArgumentError('日记内容不能超过22000字'));
				return;
			}
			update['content'] = content;
		}

		if (privacy) {
			if (privacy != 1 && privacy != '0') {
				next(new restify.InvalidArgumentError('隐私参数不正确'));
				return;
			}
            update.privacy = privacy;
		}

		if (location) {
			location = location.trim();
			if (location.length > 10) {
				next(new restify.InvalidArgumentError('地点参数不能超过10个字'));
				return;
			}
			update.location = location;
		}

		if (mood) {
			if (mood != '0' && mood != 1 && mood != 2 && mood != 3) {
				next(new restify.InvalidArgumentError('心情参数不正确'));
				return;
			}
			update.mood = mood;
		}

		if (weather) {
			if (weather != '0' && weather != 1 && weather != 2 && weather != 3 && weather != 4) {
				next(new restify.InvalidArgumentError('天气参数不正确'));
				return;
			}
			update.weather = weather;
		}

		if (forbid) {
			if (forbid != 1 && forbid != '0') {
				next(new restify.InvalidArgumentError('forbid参数不正确'));
				return;
			}
			update.forbid = forbid;
		}

		if (bookid) {
			tuerBase.findById(bookid, 'notebooks', function(err, notebook) {
				if (err) next(err);
				else {
					update.bookid = notebook._id.toString();
					updateDiary(update);
				}
			});
		} else {
			updateDiary(update);
		}

		function updateDiary(update) {
			tuerBase.findById(id, 'diary', function(err, diary) {
				if (err) next(err);
				else {
					if (req.authorization.userdata._id.toString() != diary.userid.toString()) {
						next(new restify.NotAuthorizedError('not authorized'));
						return;
					}
					tuerBase.updateById(id, {
						$set: update
					},
					'diary', function(err, ret) {
						if (err) next(err);
						else {
							util.setCharset(req, res, {
								code: 'success',
								message: '修改成功'
							});
						}
					});
				}
			});
		}

	} else {
		next(new restify.MissingParameterError('missing param'));
	}
};

exports.del = function(req, res, next) {
	if (req.body) {
		if (req.body.id) {
            var id = req.body.id;
			tuerBase.findById(id, 'diary', function(err, diary) {
				if (err) next(err);
				else {
					if (req.authorization.userdata._id.toString() != diary.userid.toString()) {
						next(new restify.NotAuthorizedError('not authorized'));
						return;
					}
					proxy = new EventProxy();
					var removed = function() {
						util.setCharset(req, res, {
							code: 'success',
							message: '删除日记成功'
						});
					};
					proxy.assign('rmdiary', 'rmcomments', 'rmpics', 'rmcounts', 'rmfeed', removed);
					var filelist = diary['filelist'] || {};
					tuerBase.removeById(diary._id.toString(), 'diary', function(err, ret) {
						if (err) throw err;
						else proxy.trigger('rmdiary');
					});
					util.removePic(filelist, function(err) {
						if (err) throw err;
						else proxy.trigger('rmpics');
					});
					tuerBase.removeBy({
						related_id: diary._id.toString()
					},
					'comment', function(err, ret) {
						if (err) throw err;
						else proxy.trigger('rmcomments');
					});
					tuerBase.updateById(diary.userid, {
						'$inc': {
							diarycount: - 1
						}
					},
					'users', function(err) {
						if (err) throw err;
						else proxy.trigger('rmcounts');
					});
					tuerBase.removeFeed(diary._id.toString(), function(err) {
						if (err) throw err;
						else proxy.trigger('rmfeed');
					});
				}
			});
		} else {
			next(new restify.MissingParameterError('missing param id'));
		}
	} else {
		next(new restify.MissingParameterError('missing param'));
	}
};

exports.save = function(req, res, next) {
	if (req.body) {
		var bookid = req.body.bookid,
		content = req.body.content,
		location = req.body.location,
		weather = req.body.weather,
		mood = req.body.mood,
		privacy = req.body.privacy || 0,
		forbid = req.body.forbid || 0;

		if (!bookid || !content || !location || !weather || !mood || !forbid) {
			next(new restify.InvalidArgumentError('参数不全'));
			return;
		}

		if ((privacy != '0' && privacy != 1) || (forbid != '0' && forbid != 1)) {
			next(new restify.InvalidArgumentError('privacy forbid参数不正确'));
			return;
		}

		if (content) {
			content = content.trim();
			if (content === '') {
				next(new restify.InvalidArgumentError('日记内容不能为空'));
				return;
			}
			if (content.length > 22000) {
				next(new restify.InvalidArgumentError('日记内容不能超过22000字'));
				return;
			}
		}

		if (privacy) {
			if (privacy != 1 && privacy != '0') {
				next(new restify.InvalidArgumentError('隐私参数不正确'));
				return;
			}
		}

		if (location) {
			location = location.trim();
			if (location.length > 10) {
				next(new restify.InvalidArgumentError('地点参数不能超过10个字'));
				return;
			}
		}

		if (mood) {
			if (mood != '0' && mood != 1 && mood != 2 && mood != 3) {
				next(new restify.InvalidArgumentError('心情参数不正确'));
				return;
			}
		}

		if (weather) {
			if (weather != '0' && weather != 1 && weather != 2 && weather != 3 && weather != 4) {
				next(new restify.InvalidArgumentError('天气参数不正确'));
				return;
			}
		}

		if (forbid) {
			if (forbid != 1 && forbid != '0') {
				next(new restify.InvalidArgumentError('forbid参数不正确'));
				return;
			}
		}

		var savedata = {
			content: content,
			userid: req.authorization.userdata._id.toString(),
			filelist: {},
			mood: mood,
			weather: weather,
            location:location,
			privacy: privacy,
			forbid: forbid,
			commentcount: 0
		};

		tuerBase.findById(bookid, 'notebooks', function(err, notebook) {
			if (err) next(err);
			else {
				savedata.notebook = notebook._id.toString();
				save(savedata);
			}
		});

		function save(savedata) {
			tuerBase.getIds('diary', function(err, obj) {
				if (err) next(err);
				else {
					savedata['id'] = obj.id;
					tuerBase.save(savedata, 'diary', function(err, data) {
						if (err) next(err);
						else {
							tuerBase.updateById(savedata.userid, {
								'$inc': {
									diarycount: 1
								}
							},
							'users', function(err) {
								if (err) next(err);
								else {
									tuerBase.addFeed({
										type: 'diary',
										uid: savedata.userid,
										id: data[0]['_id'].toString()
									},
									function(err) {
										if (err) next(err);
										else {
											util.setCharset(req, res, {
												code: 'success',
												message: '日记写入成功',
                                                id:obj.id
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	} else {
		next(new restify.MissingParameterError('missing param'));
	}
};

exports.user = function(req, res, next) {
	var uid = req.params.uid;
	if (uid) {
		var len = req.query.count || 10,
		page = req.query.page || 1,
		proxy = new EventProxy(),
		finded = function(diarys, count, isSelf) {
			diarys = forBatchDiary(diarys, isSelf);
			util.setCharset(req, res, {
				data: diarys,
				count: count
			});
		};

		page = isNaN(page) ? 1: (page < 1 ? 1: page);

		proxy.assign('diarys', 'count', 'isSelf', finded);

		tuerBase.findUser(uid, function(err, user) {

			if (err) next(err);
			else {
				var source = {
					userid: user._id.toString()
				};
				//判断是否为自己察看 
				var isSelf = req.authorization ? req.authorization.user_id == user.id: false;

				proxy.trigger('isSelf', isSelf);

				tuerBase.findDiaryBy(source, (len * (page - 1)), len * page, function(err, diarys) {
					if (err) next(err);
					else proxy.trigger('diarys', diarys);
				});

				tuerBase.getCount(source, 'diary', function(err, count) {
					if (err) next(err);
					else proxy.trigger('count', count);
				});
			}
		});

	} else {
		next(new restify.MissingParameterError('missing param user uid'));
	}
};
exports.notebook = function(req, res, next) {
	var bookid = req.params.bookid;
	if (bookid) {
		var len = req.query.count || 10,
		page = req.query.page || 1,
		uid = req.query.uid,
		proxy = new EventProxy(),
		finded = function(diarys, count, isSelf) {
			diarys = forBatchDiary(diarys, isSelf);
			util.setCharset(req, res, {
				data: diarys,
				count: count
			});
		};
		page = isNaN(page) ? 1: (page < 1 ? 1: page);
		proxy.assign('diarys', 'count', 'isSelf', finded);

		if (uid) {
			tuerBase.findUser(uid, function(err, user) {
				if (err) next(err);
				else {
					var isSelf = req.authorization ? req.authorization.user_id == user.id: false;
					proxy.trigger('isSelf', isSelf);
					tuerBase.findById(bookid, 'notebooks', function(err, notebook) {
						if (err) next(err);
						else {
							if (notebook.owner == user._id.toString() || notebook.owner == - 1) {
								var source = {
									userid: user._id.toString(),
									notebook: notebook._id.toString()
								};
								tuerBase.findDiaryBy(source, (len * (page - 1)), len * page, function(err, diarys) {
									if (err) next(err);
									else proxy.trigger('diarys', diarys);
								});
								tuerBase.getCount(source, 'diary', function(err, count) {
									if (err) next(err);
									else proxy.trigger('count', count);
								});
							} else {
								next(new restify.InvalidCredentialsError('this notebook not for uid:' + uid));
							}
						}
					});
				}
			});
		} else {
			next(new restify.MissingParameterError('missing param user uid'));
		}

	} else {
		next(new restify.MissingParameterError('missing param user uid'));
	}
};
exports.news = function(req, res, next) {
	var len = req.query.count || 10,
	page = req.query.page || 1,
	proxy = new EventProxy(),
	finded = function(diarys, count) {
		diarys = forBatchDiary(diarys);
		util.setCharset(req, res, {
			count: count,
			data: diarys
		});
	};

	page = isNaN(page) ? 1: (page < 1 ? 1: page);

	proxy.assign('diarys', 'count', finded);

	tuerBase.findDiaryBy({},
	len * (page - 1), len * page, function(err, diarys) {
		if (err) next(err);
		else proxy.trigger('diarys', diarys);
	});

	tuerBase.getCount({},
	'diary', function(err, count) {
		if (err) next(err);
		else proxy.trigger('count', count);
	});

};
exports.follow = function(req, res, next) {
	var uid = req.params.uid;
	if (uid) {
		var len = req.query.count || 10,
		page = req.query.page || 1,
		proxy = new EventProxy(),
		finded = function(diarys, count) {
			diarys = forBatchDiary(diarys);
			util.setCharset(req, res, {
				data: diarys,
				count: count
			});
		};
		page = isNaN(page) ? 1: (page < 1 ? 1: page);
		proxy.assign('diarys', 'count', finded);
		tuerBase.findUser(uid, function(err, user) {
			if (err) next(err);
			else {
				tuerBase.findDiaryByUsers(user.firends, false, len * (page - 1), len * page, function(err, diarys) {
					if (err) next(err);
					else proxy.trigger('diarys', diarys);
				});

				tuerBase.getCount({
					privacy: 0,
					userid: {
						'$in': user.firends
					}
				},
				'diary', function(err, count) {
					if (err) next(err);
					else proxy.trigger('count', count);
				});
			}
		});
	} else {
		next(new restify.MissingParameterError('missing param user uid'));
	}
};

