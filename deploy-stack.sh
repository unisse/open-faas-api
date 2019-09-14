#!/bin/sh

for FILE in `find . -name 'stack*'`
do
    faas up -f $FILE
done