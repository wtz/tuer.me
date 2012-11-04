var exec = require('child_process').exec,
    events = require('events'),
    util = require('util'),
    mongo,
    redisServer,
    cairo,
    ImageMagick;

var checkInfo = function(){};

util.inherits(checkInfo,events.EventEmitter);
//检查本地是否有mongo，redis-server，convert，以及版本.
//检查本地cairo状态,并给出安装文档地址
checkInfo.prototype.check = function(){
    var self = this;
    exec('mongo -version',function(err,stdout,stderr){
        self.emit('mongo',err,stdout,stderr);
    });

    exec('redis-server --version',function(err,stdout,stderr){
        self.emit('redis',err,stdout,stderr);
    });

    exec('convert -version',function(err,stdout,stderr){
        self.emit('imageMagick',err,stdout,stderr);
    });
    
    self.Help();
};

checkInfo.prototype.Help = function(){
    console.log('安装tuer需要依赖几个本地服务，其中有cairo,ImageMagick,Redis,Mongodb,SendMail,其中Redis和Mongodb为必须安装的程序');
    console.log('cairo安装wiki地址为:https://github.com/LearnBoost/node-canvas/wiki');
    console.log('ImageMagick,安装wiki地址为:http://www.imagemagick.org/script/install-source.php');
    console.log('Mongodb,安装wiki地址为:http://www.mongodb.org/downloads');
    console.log('Redis,安装wiki地址为:http://redis.io/download');
    console.log('SendMail,安装wiki地址为:http://www.sendmail.com/sm/open_source/download');
};

var helpInfo = new checkInfo(); 

helpInfo.on('mongo',function(err,out){
    if(err){
        console.log('Mongodb 没有在本地检查到,请确认安装');
    }else{
        console.log('Mongodb 已安装');
    }
});

helpInfo.on('redis',function(err,out){
    if(err){
        console.log('Redis 没有在本地检查到,请确认安装');
    }else{
        console.log('Redis 已安装');
    }
});

helpInfo.on('imageMagick',function(err,out){
    if(err){
        console.log('ImageMagick 没有在本地检查到,请确认安装');
    }else{
        console.log('ImageMagick 已安装');
    }
});

helpInfo.check();
