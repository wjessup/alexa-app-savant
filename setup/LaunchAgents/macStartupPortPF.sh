#!/bin/bash
echo "rdr pass inet proto tcp from any to any port 443 -> 127.0.0.1 port 1414" | pfctl -ef -
