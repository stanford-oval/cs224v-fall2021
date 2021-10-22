#!/bin/bash

set -e
set -o pipefail
set -x

exec node node_modules/genie-toolkit/dist/tool/genie.js interactive-annotate \
  --thingpedia-dir . \
  --nlu-server "file://everything/models/baseline" \
  --execution-mode real \
  --output com.yelp/eval/train/annotated.txt \
  --append
