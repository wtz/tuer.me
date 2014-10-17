var tuerBase = require('../model/base'),
Avatar = require('../lib/avatar'),
pag = require('../lib/pag').pag,
config = require('../lib/config'),
EventProxy = require('eventproxy').EventProxy,
util = require('../lib/util');

var list = function(req, res) {
  var page = req.params.page,
  space = 15,
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
  render = function(feeds, feedcount) {

    req.session.template = 'feeds';
    req.session.title = '全部动态';

    feeds.forEach(function(item) {
      item.avatarUrl = Avatar.getUrl(item.avatar);
    });

    res.render('feed/list', {
      config: config,
      session: req.session,
      feeds: feeds,
      pag: new pag({
        cur: page + 1,
        space: space,
        total: feedcount,
        url: '/feeds'
      }).init()
    });

  };

  proxy.assign('feeds', 'feedcount', render);

  tuerBase.findFeeds({},
  split, split + space, function(err, lists) {
    if (err) {
      res.redirect('500');
    } else {
      proxy.trigger('feeds', lists);
    }
  });

  tuerBase.getCount({},
  'feed', function(err, count) {
    if (err) {
      res.redirect('500');
    } else {
      proxy.trigger('feedcount', count);
    }
  });

};

exports.list = list;

