#!/bin/bash

set -e
set -o pipefail

. ./lib.sh
parse_args "$0" "domain" "$@"

set -x

if ! test -h ./devices/org.wikidata/manifest.tt ; then
	ln -s "${PWD}/${domain}/manifest.tt" ./devices/org.wikidata/manifest.tt
fi 

if ! test -h ./devices/org.wikidata/entities.json ; then
	ln -s "${PWD}/${domain}/entities.json" ./devices/org.wikidata/entities.json
fi 

if ! test -h ./devices/org.wikidata/dataset.tt ; then
	ln -s "${PWD}/emptydataset.tt" ./devices/org.wikidata/dataset.tt
fi 

if ! test -d ./.home ; then
	mkdir .home
	cat > .home/prefs.db <<EOF
{
  "developer-dir": "${PWD}/devices",
  "thingpedia": "${PWD}/devices/org.wikidata/manifest.tt",
  "entities": "${PWD}/devices/org.wikidata/entities.json",
  "dataset": "${PWD}/devices/org.wikidata/dataset.tt",
  "parameter-datasets": "${PWD}/${domain}/parameter-datasets.tsv"
}
EOF
fi

export THINGENGINE_HOME=./.home
export THINGENGINE_NLP_URL=http://127.0.0.1:8400
exec node ./almond-server/dist/main.js
