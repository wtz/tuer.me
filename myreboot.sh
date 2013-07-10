#!/bin/bash
date_now=`date +%Y%m%d%H%M`
nc -w 10 -z 127.0.0.1 27017 > /dev/null 2>&1
if [ $? -eq 0 ]
then
    echo $date_now : mongodb status is ok > /home/tuer2.0/Status
else
    killall mongod
    rm -rf /usr/local/mongodb/data/mongod.lock
    /usr/local/mongodb/bin/mongod --dbpath=/usr/local/mongodb/data --logpath=/usr/local/mongodb/logs --logappend --port=27017 --fork
fi
nc -w 10 -z 127.0.0.1 3000 > /dev/null 2>&1
if [ $? -eq 0 ]
then
    echo $date_now : tuer status is ok > /home/tuer2.0/Status
else
    killall node 
    sh /home/tuer2.0/help.sh
fi

