var tuerBase = require('../model/base'),
OAuth2Provider = require('oauth2-provider').OAuth2Provider,
ObjectID = require('mongodb').ObjectID,
config = require('../lib/config');

var myGrants = {};

var myOAP = new OAuth2Provider({
	crypt_key: 'tuer encrytion secret',
	sign_key: 'tuer signing secret'
});
//跳转到授权之前的检查
myOAP.on('enforce_login', function(req, res, authorize_url, next) {
	if (req.session.is_login) {
		next(req.session.userdata.id);
	} else {
		res.redirect('/login?next=' + encodeURIComponent('http://www.tuer.me'+authorize_url));
	}
});

myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
	//检查是否授权过，授权过给出提示，不需要继续授权
	req.session.title = '兔耳用户授权';
	req.session.template = 'authorize';
	var redirect_url = req.query.redirect_uri;
	tuerBase.findOne({
		appkey: client_id
	},
	'apis', function(err, api) {
		var error = false;
		if (err) {
			error = err;
		}
        if(redirect_url != api.appcallback){
            error = 'redirect_uri 不是预留的url';
        }
		res.render('custom/authorize_form', {
			config: config,
			authorize_url: authorize_url,
			api: api,
			error: error,
			session: req.session
		});
	});
});
//保存授权code到临时存储中
myOAP.on('save_grant', function(req, client_id, code, next) {
	if (! (req.session.userdata.id in myGrants)) {
		myGrants[req.session.userdata.id] = {};
	}
	myGrants[req.session.userdata.id][client_id] = code;
	next();
});
//删除临时授权code
myOAP.on('remove_grant', function(user_id, client_id, code) {
	if (myGrants[user_id] && myGrants[user_id][client_id]) delete myGrants[user_id][client_id];
});

//通过临时code查找是否为授权应用
myOAP.on('lookup_grant', function(client_id, client_secret, code, next) {
	tuerBase.findOne({
		appkey: client_id,
		secret: client_secret
	},
	'apis', function(err, data) {
		if (data && ! err) {
			for (user in myGrants) {
				var clients = myGrants[user];
				if (clients[client_id] && clients[client_id] == code) {
					return next(null, user);
				}
			}
		}
		return next(new Error('no such grant found'));

	});
});
//创建授权token
myOAP.on('create_access_token', function(user_id, client_id, next) {
	var data = 'tuer api secret'; //extra_data;给自己用的
	next(data);
});
//保存授权token
myOAP.on('save_access_token', function(user_id, client_id, access_token) {
	//返回该授权tuer用户id
	var token = access_token['access_token'];
	user_id = parseInt(user_id, 10);
	access_token['tuer_uid'] = user_id;
	delete access_token['refresh_token'];
	tuerBase.findOne({
		id: user_id
	},
	'users', function(err, data) {
		var tokens = data.tokens,
		source = {
			id: user_id
		},
		update = {
			$push: {
				tokens: {
					appkey: client_id,
					token: token
				}
			}
		};
		if (data.tokens) {
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i].appkey == client_id) {
					source = {
						'tokens.appkey': client_id
					};
					update = {
						$set: {
							'tokens.$.token': token
						}
					};
					break;
				}
			}
		}
		tuerBase.update(source, update, 'users', function(err, data) {
			console.log('saving access token %s for userid=%s client_id=%s', access_token, user_id, client_id);
		});
	});
});
//授权信息放入放入自己的session中，让用户得以登陆
myOAP.on('access_token', function(req, token, next) {
	//检查数据库用户id和token是否匹配，匹配放行，不匹配403
	next();
});

module.exports = myOAP;

