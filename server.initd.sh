#!/bin/sh

#
# chkconfig: 35 99 99
# description: Node.js /home/nodejs/sample/app.js
#

. /etc/rc.d/init.d/functions

USER="pi"

DAEMON="/home/nodejs/.nvm/v0.4.10/bin/node"
ROOT_DIR="/home/pi/MyAquaAppNodeJSproject_relay/MyAquaApp/"

SERVER="$ROOT_DIR/server.js"
LOG_FILE="$ROOT_DIR/server.js.log"

LOCK_FILE="/var/lock/subsys/node-server"

do_start()
{
        if [ ! -f "$LOCK_FILE" ] ; then
                echo -n $"Starting $SERVER: "
                export HOST=192.168.1.13
                export PORT=3000
                runuser -l "$USER" -c "$DAEMON $SERVER >> $LOG_FILE &" && echo_success || echo_failure
                RETVAL=$?
                echo
                [ $RETVAL -eq 0 ] && touch $LOCK_FILE
        else
                echo "$SERVER is locked."
                RETVAL=1
        fi
}
do_stop()
{
        echo -n $"Stopping $SERVER: "
        pid=`ps -aefw | grep "$DAEMON $SERVER" | grep -v " grep " | awk '{print $2}'`
        kill -9 $pid > /dev/null 2>&1 && echo_success || echo_failure
        RETVAL=$?
        echo
        [ $RETVAL -eq 0 ] && rm -f $LOCK_FILE
}

case "$1" in
        start)
                do_start
                ;;
        stop)
                do_stop
                ;;
        restart)
                do_stop
                do_start
                ;;
        *)
                echo "Usage: $0 {start|stop|restart}"
                RETVAL=1
esac

exit $RETVAL