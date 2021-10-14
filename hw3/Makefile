geniedir ?= ./genie-toolkit

memsize := 12000
genie = node --experimental_worker --max_old_space_size=$(memsize) $(geniedir)/dist/tool/genie.js

experiment ?= 

eval_set ?= eval
dataset_file ?= emptydataset.tt
synthetic_flags ?= \
	projection_with_filter \
	projection \
	aggregation \
	schema_org \
	filter_join \
	no_stream
generate_flags = $(foreach v,$(synthetic_flags),--set-flag $(v)) 
custom_generate_flags ?=
pruning_size ?= 25
mindepth ?= 6
maxdepth ?= 8

parameter-datasets.tsv: 
	wget --no-verbose https://almond-static.stanford.edu/research/XXX
	
constants.tsv: parameter-datasets.tsv devices/com.tvmaze/manifest.tt
	$(genie) sample-constants -o $@.tmp --parameter-datasets $(experiment)/parameter-datasets.tsv --thingpedia $(experiment)/wikidata.tt --devices org.wikidata
	cat $(geniedir)/data/en-US/constants.tsv >> $@.tmp
	mv $@.tmp $@