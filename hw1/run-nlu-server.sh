#!/bin/bash

set -e
set -o pipefail

. ./lib.sh
parse_args "$0" "domain nlu_model" "$@"

set -x

exec node --experimental_worker ./genie-toolkit/dist/tool/genie.js server \
  --no-contextual \
  --nlu-model "file://${domain}/models/${nlu_model}/" \
  --thingpedia "${domain}/manifest.tt" 
