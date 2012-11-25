#!/bin/sh

cd "/home/tuer2.0/"
forever stop index.js
forever start index.js
