var tuer = require('./app'),
Log = require('log'),
fs = require('fs'),
logpath = '/home/tuer2.0/error.log',
old = fs.readFileSync(logpath,'utf-8'),
stream = fs.createWriteStream(logpath),
log = new Log('error',stream);

process.on('uncaughtException',function(err){
    stream.write(old,'utf-8',function(){
        log.error(err); 
    });    
});

tuer.start({
    rootdir:'/home/tuer2.0/',
    port:3000,
    mport:3030,
    cookiepath:'tuer.me',
    host:'www.tuer.me',
    jshost:'js.tuer.me',
    csshost:'css.tuer.me',
    imagehost:'img.tuer.me',
    dbname:'node-mongo-tuer',
    dbhost:'127.0.0.1',
    dbport:10001,
    mhost:'m.tuer.me'
});

