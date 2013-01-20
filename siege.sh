#!/bin/bash
user_agent="Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:15.0) Gecko/20100101 Firefox/15.0.1"
concurrent=300
siege_single_url="http://127.0.0.1:3000/"

siege -A $user_agent -c $concurrent -t10S $siege_single_url
