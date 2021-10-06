# Improve Your Agent With Manual Annotation

In this homework, you will learn how to annotate properties for a Genie skill and improve your questions-answering skill built in the first homework. 

## Setup

We will continue running all the experiment under directory `hw1`. Run the following on your GCP instance fo get the latest update of this repo:
```bash
cd cs224v-fall2021
git stash # following the prompt to configure git if needed
git pull
git stash pop
```

## Edit the Annotations in the Manifest

The skill manifest is located at `<DOMAIN>/manifest.tt`. It contains the schema of the domain, including entities involved, the properties available, and automatically generated natural language annotations from homework 1. 

The automatically generated annotations are apparently not perfect, especially because the name of each property in Wikidata is often clunky and unnatural. Now we are going to manually update them. 

A reference guide for the syntax can be found [here](https://wiki.almond.stanford.edu/genie/annotations#canonical-forms). Only "Function Canonical Form" and "Parameter Canonical Form" sections are needed for the homework. 

We recommend download the manifest locally via `scp` and upload it when it's ready. You can use your favorite editor locally and in the meanwhile, you can stop the VM instance to save cost. 
```bash
# download 
gcloud compute scp "<YOUR_VM_NAME>">:~/cs224v-fall2021/hw1/<"YOUR_DOMAIN">/manifest.tt ./
# upload
gcloud compute scp ./manifest.tt "<YOUR_VM_NAME>">:~/cs224v-fall2021/hw1/<"YOUR_DOMAIN">/
```


## Rerun Synthesis and Training 
Once the manifest is uploaded, we can rerun the synthesis and training:
```bash
# clean existing data 
make clean-synthesis

# rerun synthesis and training
make train model=2
```

Note that `make train` will automatically rerun `make synthesis`. 
By default the model name is set to `1`. **Do not** run `make train` without overriding the model name, otherwise it will over write the model trained in homework 1. 

## Evaluate 
Similar to homework 1. Run the following command with model `2` to evaluate the new model.
```bash
make evaluate
```

After the evaluation finishes, you will now have `./<DOMAIN>/eval/2.results` and `./<DOMAIN>/eval/2.debug`.
How is your accuracy? Is it better than model 1? 

## Compare Model 1 and 2 
Follow the same instruction in homework 1 to start the almond server (set `--nlu_model 2` when starting the nlu server). Try the same commands you tested in homework 1. Is the model perform better now? 

Pick 5 examples from eval set that are parsed correct in both homework 1 and 2, i.e., the ones in `eval/annotated.tsv` but not in `eval/1.debug` and `eval/2.debug`.
Try to paraphrase them, and test them on both model 1 and model 2. How are they performing? Which one is more robust?  

## Submission
Each student should submit a pdf or text file with answers for the following questions, plus the `manifest.tt` file with your manual annotations.
- The domain you chose
- The accuracy of your new model, and how it compares with the the model in homework 1. 
- The accuracy of the 5 commands you tested in homework 1. Is the new model better? 
- The five commands you picked from eval set and your paraphrases for them. 
- The accuracy of the 5 paraphrases for both model 1 and model 2 and how they compare.
- What conclusion you can draw from the comparison?