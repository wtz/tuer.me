var tuer = require('./app');

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
