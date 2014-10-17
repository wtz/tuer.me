var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
util = require('../../lib/util'),
querystring = require('querystring');

var userout = ['id', 'nick', 'pageurl', 'profile', 'about', 'created_at','friends'];

exports.info = function(req, res, next) {
  var uid = req.params.uid;
  if (uid) {
    tuerBase.findUser(uid, function(err, data) {
      if (err) next(err);
      else {
        if (data) {
          data = util.filterJson(data, userout);
          util.setCharset(req, res, data);
        } else {
          next(new restify.InvalidCredentialsError('user is not exist'));
        }
      }
    });
  } else {
    next(new restify.MissingParameterError('missing param uid'));
  }
};

exports.follow = function(req, res, next) {
  var uid = req.params.uid,
    page = req.query.page || 1,
  len = req.query.count || 10;
  if (uid) {
        page = isNaN(page) ? 1 : (page < 1 ? 1 : page);
    tuerBase.findUser(uid, function(err, data) {
      if (err) next(err);
      else {
        if (data) {
          var proxy = new EventProxy(),
          finded = function(followers, followed) {
            util.setCharset(req, res, {
              'id': data.id,
              'followers': followers,
              'followed': followed
            });
          };
          proxy.assign('followers', 'followed', finded);
          tuerBase.findBySlice({
            _id: {
              '$in': data.firends
            }
          },
          'users', (len *( page - 1)),(len * page), function(err, users) {
            if (err) next(err);
            else {
              for (var i = 0; i < users.length; i++) {
                users[i] = util.filterJson(users[i], userout);
              }
              proxy.trigger('followers', {
                data: users,
                count: data.firends.length
              });
            }
          });
          tuerBase.findFollows(data._id, len, function(err, users, count) {
            if (err) next(err);
            else {
              for (var i = 0; i < users.length; i++) {
                users[i] = util.filterJson(users[i], userout);
              }
              proxy.trigger('followed', {
                data: users,
                count: count
              });
            }
          });
        } else {
          next(new restify.InvalidCredentialsError('user is not exist'));
        }
      }
    });
  } else {
    next(new restify.MissingParameterError('missing param uid'));
  }
};
exports.edit = function(req, res, next) {
    //校验是否为修改本人的信息

  if (req.body) {
    var uid = req.params.uid,
    nick = req.body.nick,
    profile = req.body.profile,
    about = req.body.about,
    update = {};
        
        if(req.authorization.user_id != uid){
            next(new restify.NotAuthorizedError('not authorized'));
            return;
        }
        
        //校验
    if (nick){
            nick = nick.trim();
            if(nick === ''){
                next(new restify.InvalidArgumentError('昵称不能为空'));
                return;
            }
            update['nick'] = req.body.nick;
        }
    if (profile){
            profile = profile.trim();
            if(profile === ''){
                next(new restify.InvalidArgumentError('签名不能为空'));
                return;
            }
            if(profile.length > 30){
                next(new restify.InvalidArgumentError('签名不能超过30字'));
                return;
            }
            update['profile'] = req.body.profile;
        }
    if (about){
            about = about.trim();
            if(about === ''){
                next(new restify.InvalidArgumentError('介绍不能为空'));
                return;
            }
            if(about.length > 600){
                next(new restify.InvalidArgumentError('签名不能超过600字'));
                return;
            }
            update['about'] = req.body.about;
        }
        
        tuerBase.updateById(uid,{$set:update},'users',function(err){
            if(err) next(err);
            else{
                util.setCharset(req,res,{code:'success',message:"修改成功"});
            }
        });

  } else {
    next(new restify.MissingParameterError('missing param'));
  }

};
exports.attention = function(req, res, next) {
  if (req.body) {
        var uid = req.params.uid,
            addid = req.body.addid,
            removeid = req.body.removeid;

        if(req.authorization.user_id != uid){
            next(new restify.NotAuthorizedError('not authorized'));
            return;
        }
        
        if(addid && removeid){
            next(new restify.InvalidArgumentError('addid和removeid只能有一个'));
            return;
        }

        if(addid){
            tuerBase.addFriends(addid,uid,function(err,msg){
                if(err) next(err);
                else{
                    util.setCharset(req,res,{code:"success",message:msg,'status':"followed"});
                }
            });
        }else if(removeid){
            tuerBase.removeFriend(uid,removeid,function(err,msg){
                if(err) next(err);
                else{
                    util.setCharset(req,res,{code:"success",message:msg,'status':"unfollowed"});
                }
            });
        }

    }else{
    next(new restify.MissingParameterError('missing param'));
    }
};
exports.hots = function(req, res, next) {
  tuerBase.getHotUser(15, function(err, users) {
    if (err) next(err);
    else {
      for (var i = 0; i < users.length; i++) users[i] = util.filterJson(users[i], userout);
      util.setCharset(req, res, {
        hots: users
      });
    }
  });
};
exports.news = function(req, res, next) {
  tuerBase.findBySort({},
  {
    created_at: - 1
  },
  'users', 15, function(err, users) {
    if (err) next(err);
    else {
      for (var i = 0; i < users.length; i++) users[i] = util.filterJson(users[i], userout);
      util.setCharset(req, res, {
        news: users
      });
    }

  });
};

