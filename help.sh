#!/bin/sh

cur_dir=$(pwd)
#重启服务
cd $cur_dir
forever stop index.js
forever start index.js
#备份数据库
date_now=`date +%Y%m%d%H%M`
backmongodbFile=tuer$date_now.tar.gz
cd $cur_dir/backup/
mongodump -h 127.0.0.1 --port 10001 -d node-mongo-tuer -o my_mongodb_dump/
rm *.tar.gz
tar czf $backmongodbFile my_mongodb_dump/
rm my_mongodb_dump -rf
