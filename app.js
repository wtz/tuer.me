/**
 * Module dependencies.
 */

var express = require('express'),
config = require('./lib/config'),
rootdir = config.rootdir,
RedisStore = require('connect-redis')(express);
var app = express.createServer();
var wap = express.createServer();

// Configuration
function Configuration(app, rootdir) {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', {
		layout: false
	});
	app.use(express.bodyParser({
		uploadDir: rootdir + '/public/images/'
	}));
	app.use(express.cookieParser());
	app.use(express.query());
	app.use(express.session({
		secret: 'keyboard cat',
		store: new RedisStore
	}));
	app.use(express.methodOverride());
	app.use(express['static'](__dirname + '/public'));
	app.use(express.favicon(__dirname + '/public/favicon.ico'), {
		maxAge: 2592000000
	});
	app.use(app.router);
}

function development(app) {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
}

function production(app) {
	app.use(express.errorHandler());
}

exports.start = function(conf) {

	if (conf) {
		for (var i in conf) {
			if (config.hasOwnProperty(i)) config[i] = conf[i];
		}
	}
	app.configure(function() {
		Configuration(app, config.rootdir);
	});

	app.configure('development', function() {
		development(app);
	});

	app.configure('production', function() {
		production(app);
	});

	wap.configure(function() {
		Configuration(wap, config.rootdir);
	});

	wap.configure('development', function() {
		development(wap);
	});

	wap.configure('production', function() {
		production(wap);
	});
	//controllers
	require('./routes')(app);
	require('./wapRoutes')(wap);

	app.listen(config.port);
	wap.listen(config.mport);
	//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	console.log('app server on ' + config.host);
	console.log('wap server on ' + config.mhost);
};

