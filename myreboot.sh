#!/bin/bash
date_now=`date +%Y%m%d%H%M`
nc -w 10 -z 127.0.0.1 10001 > /dev/null 2>&1
if [ $? -eq 0 ]
then
    echo $date_now : mongodb status is ok >> /home/tuer2.0/mongoStatus
else
    killall mongod
    rm -rf /data/db/mongod.lock
    /usr/bin/mongod -dbpath=/data/db --fork --port 10001 --logpath=/data/log/mongodwork.log --logappend
fi
