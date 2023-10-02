#!/bin/bash

css_file="/src/css_test.css"
word="vertical"

awk -v word=".$word" 'BEGIN {RS="}"; FS="\n"} $0 ~ word {print $0"}"}' $css_file