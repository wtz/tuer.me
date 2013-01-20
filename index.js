var tuer = require('./app');

tuer.start({
    rootdir:'/home/fuqiang/dev/tuerSource/',
    port:3000,
    mport:3030,
    cookiepath:'127.0.0.1',
    host:'127.0.0.1:3000',
    jshost:'127.0.0.1:3000',
    csshost:'127.0.0.1:3000',
    imagehost:'127.0.0.1:3000',
    dbname:'node-mongo-tuer',
    dbhost:'127.0.0.1',
    dbport:10001,
    mhost:'127.0.0.1:3030'
});
