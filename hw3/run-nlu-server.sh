#!/bin/bash

set -e
set -o pipefail

. ./lib.sh
parse_args "$0" "nlu_model" "$@"

set -x

exec node --experimental_worker node_modules/genie-toolkit/dist/tool/genie.js server \
  --nlu-model "file://everything/models/${nlu_model}/" \
  --thingpedia "everything/schema.tt" 
