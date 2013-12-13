var tuerBase = require('../model/base'),
    Avatar = require('../lib/avatar'),
    util = require('../lib/util'),
    pag = require('../lib/pag').pag,
    escape = require('jade').runtime.escape,
    config = require('../lib/config'),
    EventProxy = require('eventproxy').EventProxy;

var index = function(req,res,next){
    var proxy = new EventProxy(),
        render = function(feeds,feedcount,usersCount,privacyCount,diariesCount,todoCount,hotusers,hotdiarys){

            req.session.title = "首页";
            req.session.template = "index";

            feeds.forEach(function(item){
               item.avatarUrl = Avatar.getUrl(item.pageurl || item.id);
            });

            hotusers.forEach(function(item){
                item.avatarUrl = Avatar.getUrl(item.id);
            });

            hotdiarys.forEach(function(item){
                item.content = item.content.length > 10 ? item.content.slice(0,10)+'...' : item.content;
            });

            res.render('index',{
                config:config,
                session:req.session,
                feeds:feeds,
                hotdiarys:hotdiarys,
                hotusers:hotusers,
                pag:new pag({
                    cur:1,
                    space:25,
                    total:feedcount,
                    url:'/feeds'
                }).init(),
                usersCount:usersCount,
                privacyCount:privacyCount,
                diariesCount:diariesCount,
                todoCount:todoCount
            });
        };

    proxy.assign('feeds','feedcount','usersCount','privacyCount','diariesCount','todoCount','hotusers','hotdiarys',render);

    tuerBase.findFeeds({},0,25,function(err,feeds){
        if(err){
            res.redirect('500');
        }else{
            proxy.trigger('feeds',feeds); 
        }
    });

    tuerBase.getCount({},'users',function(err,usersCount){
        if(err){
            res.redirect('500');
        }else {
            proxy.trigger('usersCount',usersCount); 
        }
    });

    tuerBase.getCount({},'feed',function(err,feedcount){
        if(err){
            res.redirect('500');
        }else {
            proxy.trigger('feedcount',feedcount); 
        }
    });

    tuerBase.getCount({privacy:'1'},'diary',function(err,privacyCount){
        if(err){
            res.redirect('500');
        }else {
            proxy.trigger('privacyCount',privacyCount);
        }
    });

    tuerBase.getCount({privacy:0},'diary',function(err,diariesCount){
        if(err){
            res.redirect('500');
        }else{
            proxy.trigger('diariesCount',diariesCount);
        }
    });

    tuerBase.getCount({},'todos',function(err,todoCount){
        if(err){
            res.redirect('500');
        }else{
            proxy.trigger('todoCount',todoCount);
        }
    });

    tuerBase.getHotUser(15,function(err,users){
        if(err){
            res.redirect('500');
        }else{
            proxy.trigger('hotusers',users);
        }
    });

    tuerBase.getHotDiary(10,function(err,diarys){
        if(err){
            res.redirect('500');
        }else{
            proxy.trigger('hotdiarys',diarys);
        }
    });
};

function oldpics(req,res){
    req.session.title = '恢复图片';
    req.session.template = 'oldpics';
    
    res.render('oldpics',{
        config:config,
        session:req.session
    });
}

exports.index= index;
exports.oldpics= oldpics;
