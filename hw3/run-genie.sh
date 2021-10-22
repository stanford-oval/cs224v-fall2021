#!/bin/bash

set -e
set -o pipefail
set -x

if ! test -d ./.home ; then
	mkdir .home
	cat > .home/prefs.db <<EOF
{
  "developer-dir": "${PWD}/devices"
}
EOF
fi

export THINGENGINE_HOME=./.home
export THINGENGINE_NLP_URL=http://127.0.0.1:8400
exec node node_modules/almond-server/dist/main.js
