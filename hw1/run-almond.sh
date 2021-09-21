#!/bin/bash

set -e
set -o pipefail

. ./lib.sh
parse_args "$0" "domain" "$@"

set -x

if ! test -f ./devices/org.wikidata/manifest.tt ; then
	ln -s "./${domain}/manifest.tt" ./devices/org.wikidata/manifest.tt
fi 

if ! test -f ./devices/org.wikidata/entities.json ; then
	ln -s "./${domain}/entities.json" ./devices/org.wikidata/entities.json
fi 

if ! test -f ./devices/org.wikidata/dataset.tt ; then
	ln -s emptydataset.tt ./devices/org.wikidata/dataset.tt
fi 

export THINGENGINE_HOME=./.home
export THINGENGINE_NLP_URL=http://127.0.0.1:8400
exec node ./almond-server/dist/main.js
