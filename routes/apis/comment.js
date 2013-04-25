var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
mail = require('../../lib/mail'),
util = require('../../lib/util'),
querystring = require('querystring');

var commentout = ['_id', 'related_id', 'userpage', 'nick', 'profile', 'content', 'userid', 'created_at'];

exports.info = function(req, res, next) {
	var id = req.params.id;
	if (id) {
		var len = req.query.count || 10,
		page = req.query.page || 1,
		proxy = new EventProxy(),
		finded = function(comments, count) {
			for (var i = 0; i < comments.length; i++) {
				comments[i] = util.filterJson(comments[i], commentout);
			}
			util.setCharset(req, res, {
				data: comments,
				count: count
			});
		};

		proxy.assign('comments', 'count', finded);

		page = isNaN(page) ? 1: (page < 1 ? 1: page);
		tuerBase.findById(id, 'diary', function(err, diary) {
			if (err) {
				next(err);
			} else {
				id = diary._id.toString();
				tuerBase.findCommentSlice(id, len * (page - 1), len * page, function(err, comments) {
					if (err) {
						next(err);
					} else {
						proxy.trigger('comments', comments);
					}
				});
				tuerBase.getCount({
					"related_id": id
				},
				'comment', function(err, count) {
					if (err) {
						next(err);
					} else {
						proxy.trigger('count', count);
					}
				});
			}
		});

	} else {
		next(new restify.MissingParameterError('missing param diary id'));
	}
};

exports.save = function(req, res, next) {
	if (req.body) {
		var diaryid = req.params.id,
		content = req.body.content,
		replyid = req.body.replyid,
		replyname = req.body.replyname,
		userid = req.authorization.userdata._id.toString();
		//校验
		if (!diaryid || ! content) {
			next(new restify.InvalidArgumentError('diaryid content为必选'));
			return;
		}
		if (content.length <= 0 || content.length > 5000) {
			next(new restify.InvalidArgumentError("评论内容不能为空或超过5000个字节"));
			return;
		}

		if (replyid && replyname) {
			saveData['content'] = '@' + replyname + ' ' + content;
		}

		tuerBase.findById(diaryid, 'diary', function(err, diarydata) {
			if (!err) {
				if (diarydata.forbid == 1) {
					next(new restify.InvalidArgumentError('此日记不允许被评论'));
					return;
				}
				diaryid = diarydata._id.toString();
				var saveData = {
					content: content,
					related_id: diaryid,
					userid: userid
				};
				tuerBase.save(saveData, 'comment', function(err, data) {
					if (err) {
						next(err);
					} else {
						tuerBase.update({
							_id: diarydata._id
						},
						{
							'$inc': {
								'commentcount': 1
							}
						},
						'diary', function(err) {
							if (err) {
								next(err);
							} else {
								tuerBase.updateById(userid, {
									'$inc': {
										'tocommentcount': 1
									}
								},
								'users', function(err) {
									if (!err) {
										if (diarydata.userid !== userid) tuerBase.addDiaryTips(diarydata.userid, diaryid);
										if (replyid && replyid != userid) tuerBase.addDiaryTips(replyid, diaryid);
										util.setCharset(req, res, {
											code: 'success',
											msg: '回复成功'
										});
									} else {
										next(err);
									}
								});
							}
						});
					}
				});
			} else {
				next(err);
			}
		});

	} else {
		next(new restify.MissingParameterError('missing param'));
	}
};

exports.del = function(req, res, next) {
	if (req.body) {
		var commentid = req.params.id,
		userid = req.authorization.userdata._id.toString(),
		diaryid = req.body.diaryid,
		proxy = new EventProxy(),
		removeComment = function(comment, diary) {
			if (comment.related_id == userid || diary.userid == userid || comment.userid == userid) {
				deletecomment(commentid, diary._id, comment);
			} else {
				next(new restify.MissingParameterError('无权删除'));
			}
		};
		//校验
		if (!commentid && ! diaryid) {
			next(new restify.InvalidArgumentError('diary和commentid必选'));
			return;
		}

		function deletecomment(id, diaryid, comment) {

			var deleteproxy = new EventProxy(),
			render = function(user) {
				util.setCharset(req, res, {
					code: 'success',
					msg: '删除成功'
				});
				mail.send_mail({
					to: user['accounts'],
					subject: '您在兔耳网的评论被删除了!',
					html: '下面是您的评论备份.<br/> ----------<br/> ' + comment.content
				},
				function(err, status) {
					console.log(status);
				});
			};

			deleteproxy.assign('user', 'removecomment', 'updatecount', 'updateusercount', render);

			tuerBase.removeById(id, 'comment', function(err) {
				if (err) {
                    next(err);
				} else {
					deleteproxy.trigger('removecomment');
				}
			});

			tuerBase.findById(comment.userid, 'users', function(err, user) {
				if (err) {
                    next(err);
				} else {
					deleteproxy.trigger('user', user);
				}
			});

			tuerBase.update({
				_id: diaryid
			},
			{
				'$inc': {
					'commentcount': - 1
				}
			},
			'diary', function(err) {
				if (err) {
                    next(err);
				} else {
					deleteproxy.trigger('updatecount');
				}
			});

			tuerBase.updateById(comment.userid, {
				'$inc': {
					'tocommentcount': - 1
				}
			},
			'users', function(err) {
				if (err) {
                    next(err);
				} else {
					deleteproxy.trigger('updateusercount');
				}
			});
		}

		proxy.assign('comment', 'diary', removeComment);

		tuerBase.findById(commentid, 'comment', function(err, comment) {
			if (err) {
                next(err);
			} else {
				proxy.trigger('comment', comment);
			}
		});

		tuerBase.findById(diaryid, 'diary', function(err, diary) {
			if (err) {
                next(err);
			} else {
				proxy.trigger('diary', diary);
			}
		});
	} else {
		next(new restify.MissingParameterError('missing param'));
	}
};

