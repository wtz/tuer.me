var restify = require('restify'),
tuerBase = require('./model/base'),
util = require('util'),
serializer = require('serializer');

serializer = serializer.createSecureSerializer('tuer encrytion secret', 'tuer signing secret');

var utf8Charset = {'content-type':'application/json; charset=utf-8'};

var server = restify.createServer({
	name: 'tuerApi',
	version: '0.0.1',
    formatters:{
        'application/json; charset=uft-8':function(req,res,body){
            return util.inspect(body);
        }
    }
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.use(restify.jsonp());

//全局校验
server.use(function(req, res, next) {
	var data, atok, user_id, client_id, grant_date, extra_data,TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; //7天有效期

	if (req.query['access_token']) {
		atok = req.query['access_token'];
	} else if ((req.headers['authorization'] || '').indexOf('Bearer ') === 0) {
		atok = req.headers['authorization'].replace('Bearer', '').trim();
	} else {
		//没有atok直接干掉，转到没权限的提示
		next(new restify.NotAuthorizedError('access_token must have'));
		return;
	}

	try {
		data = serializer.parse(atok);
		user_id = data[0];
		client_id = data[1];
		grant_date = new Date(data[2]);
		extra_data = data[3];
	} catch(e) {
		next(new restify.NotAuthorizedError(e.message));
		return;
	}
	tuerBase.findUser(user_id, function(err, data) {
		//对上面的user_id,client_id,grant_data,extra_data进行校验，ok则可获取api
		if (err) return next(new restify.NotAuthorizedError(err));
		if (data && data.tokens) {
			for (var i = 0; i < data.tokens.length; i++) {
				var grant = data.tokens[i];
				if (grant.appkey == client_id && grant.token == atok) {
                    if(grant_date.getTime() + TOKEN_TTL > Date.now()){
                        req.authorization = {
                            extra_data:extra_data,
                            userdata:data,
                            user_id:user_id,
                            client_id:client_id,
                            grant_date:grant_date
                        };
					    return next();
                    }else{
		                return next(new restify.NotAuthorizedError('the token has expired'));
                    }
				}
			}
		}
		return next(new restify.InvalidArgumentError('this token not exits'));
	});
});

server.pre(function(req,res,next){
    return next();
});

server.get('/echo/:name', function(req, res, next) {
	res.json(req.authorization,utf8Charset);
	return next();
});

server.listen(3333, function() {
	console.log('%s listening at %s', server.name, server.url);
});

