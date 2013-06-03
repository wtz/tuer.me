#!/bin/bash
nc -w 10 -z 127.0.0.1 10001 > /dev/null 2>&1
if [ $? -eq 0 ]
then
    echo mongodb status is ok
else
    killall node
    rm -rf /data/db/mongod.lock
    reboot
fi
