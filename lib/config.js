var rootdir = '/home/tuer2.0',
    cookiepath = '127.0.0.1',
    host = '127.0.0.1:3000',
    jshost = '127.0.0.1:3000',
    csshost = '127.0.0.1:3000',
    imagehost = '127.0.0.1:3000',
    mhost = '127.0.0.1:3030';

var config = {
    error:undefined,
    userdata:undefined,
    template:undefined,
    mood:[{value:'喜',_id:0},{value:'怒',_id:1},{value:'哀',_id:2},{value:'乐',_id:3}],
    weather:[{value:'晴',_id:0},{value:'阴',_id:1},{value:'雨',_id:2},{value:'雪',_id:3},{value:'大风',_id:4}],
    rootdir:rootdir,
    host:host,
    imagehost:imagehost,
    jshost:jshost,
    csshost:csshost,
    mhost:mhost,
    cookiepath:cookiepath,
    timeout:1000 * 60 * 60 * 2,
	muens: [{
		text: '首页',
		href: '/',
		template: 'index'
	},
	{
		text: '全部日记',
		href: '/diaries/',
		template: 'diaries'
	},
    {
        text:'手机简版',
        href:'http://'+mhost
    }],
	nav: [{
		text: '登录',
		href: '/login'
	},
	{
		text: '注册',
		href: '/register'
	}],
    loginnav:[{
        text:'设置',
        href:'/set'
    },{
        text:'登出',
        href:'/logout'
    }],
    is_login:false,
    countDownTime:function(){
        var D = new Date(),
		    lefttime = (24 * 60) - ((D.getHours() * 60) + D.getMinutes());
	    return '距离明天还有：' + Math.floor(lefttime / 60) + '小时' + lefttime % 60 + '分钟';
    },
	scripts: ['seajs/sea.js', 'jquery/jquery-1.7.2.min.js',
	//'JSON-js/json2.js',
	//'underscore/underscore-min.js',
	//'backbone/backbone-min.js',
    //'libs/imgforbase64/swfobject.js',
	'bootstrap/js/bootstrap.min.js'
    ],
    footer:[{
        text:'关于兔耳',
        href:'/about/'
    },{
        text:'使用帮助',
        href:'/help/'
    },{
        text:'兔耳API',
        href:'/api/'
    },
    {
        text:'源码',
        href:'https://github.com/xiaojue/tuer.me'
    }]
};

module.exports = config;
