#!/bin/bash
forever start -c 'nodemon -e js,ejs' -a -l forever.log -o tb.out.log -e tb.err.log bin/www
