#!/bin/sh

#
# chkconfig: 35 99 99
# description: Node.js /home/nodejs/sample/app.js
#

#. /etc/rc.d/init.d/functions

USER="pi"

DAEMON="/home/nodejs/.nvm/v0.4.10/bin/node"
ROOT_DIR="/home/pi/NodeJSproject_relay/MyAquaApp/"

SERVER="$ROOT_DIR/server.js"
LOG_FILE="$ROOT_DIR/server.js.log"



### BEGIN INIT INFO
# Provides:             telasocial
# Required-Start:
# Required-Stop:
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    TelaSocial Node App
### END INIT INFO

export PATH=$PATH:/usr/local/bin/
#export NODE_PATH=$NODE_PATH:/opt/node/lib/node_modules
#export HOME=/root 
export PORT=3000
export IP=192.168.1.13

case "$1" in
  start)
    sudo modprobe w1-gpio && sudo modprobe w1-therm && forever  --sourceDir=$ROOT_DIR server.js -l $LOG_FILE 
    ;;
  stop)
    exec forever stopall
    ;;
  *)

  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac
exit 0