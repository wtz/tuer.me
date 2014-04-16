var tuerBase = require('../../model/base'),
restify = require('restify'),
EventProxy = require('eventproxy').EventProxy,
util = require('../../lib/util'),
querystring = require('querystring');

exports.news = function(req, res, next) {

	var len = req.query.count || 10,
	page = req.query.page || 1,
	proxy = new EventProxy(),
	finded = function(feeds, feedcount) {
		util.setCharset(req, res, {
			count: feedcount,
			data: feeds
		});
	};

	page = isNaN(page) ? 1: (page < 1 ? 1: page);

	proxy.assign('feeds', 'feedcount', finded);

	tuerBase.findFeeds({},
	(len * (page - 1)), len * page, function(err, feeds) {
		if (err) {
			next(err);
		} else {
            for(var i=0;i<feeds.length;i++){
                var feed = feeds[i],filter = [];
                if(feed.feed_type == 'diary'){
                    filter = ['id','content','bookname','bookid','created_user','pageurl','privacy','location','mood','weather','img','created_at','commentcount'];
                }
                if(feed.feed_type == 'todo'){
                    filter = ['content','created_user','pageurl','created_at'];
                }
                if(feed.feed_type == 'register'){
                    filter = ['id','nick','created_at'];
                }
                if(feed.feed_type == 'notebook'){
                    filter = ['id','name','created_user','bgcolor','pageurl','created_at'];
                }
                feeds[i] = util.filterJson(feed,filter);
                if(feed.feed_type == 'diary'){
                    if(feed.mood === null) feeds[i].mood = '';
                    if(feed.weather === null) feeds[i].weather = '';
                    if(feed['location'] === null) feeds[i]['location'] = '';
                    if(feed.img === false) feeds[i].img = '';
                    if(feed.privacy == 1){
                        delete feeds[i]['content'];
                        feeds[i].privacy = 1;
                    }
                }
            }
			proxy.trigger('feeds', feeds);
		}
	});
	tuerBase.getCount({},
	'feed', function(err, feedcount) {
		if (err) {
			next(err);
		} else {
			proxy.trigger('feedcount', feedcount);
		}
	});
};

