#!/bin/bash
ipfw add 1 forward 127.0.0.1,1414 ip from any to any 443 in
exit 0
