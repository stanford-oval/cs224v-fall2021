# Build a QA Skill for a Wikidata Domain with Genie

In this homework, you will learn to use Genie and build a question-answering skill for a [Wikidata](https://www.wikidata.org) domain of your choice. 

We want all students to have hands-on experience in training a large neural network.  (No prior knowledge in machine learning is assumed.)  

Since both data synthesis and training are computation-intensive, running each command once may take about 1-2 hours.
**Please start early and budget your time accordingly!**

## Setup 

### Google Cloud Platform
This homework requires access to significant computing resources. We recommend running **all steps** in Google Cloud Platform. All students should have received a Google Cloud Platform coupon for this class via email. The email includes instructions to redeem your coupon and apply it to your personal GCP account.

Once you have redeemed your coupon, **follow this detailed [instruction](./instructions/google-cloud.md) to setup your VM.**

You will be responsible for creating and managing (starting, stopping) the VM instances used by this homework. You will be billed while the instances are running (and you will be responsible for charges beyond the coupon), so make sure you **turn off any VM instance you are not using**.

### Install Libraries and Dependencies
To install the libraries and dependencies needed, clone this repository and run the following command (takes about 3 minutes)

**Again, we strongly recommend doing this on your VM via the gcloud command!**

```bash
git clone https://github.com/stanford-oval/cs224v-fall2021.git
cd cs224v-fall2021/hw1
./install.sh
```

Since both the synthesis and training take a long time to finish, we **highly recommend** running everything using a terminal multiplexer such as [screen](https://www.gnu.org/software/screen/) and [tmux](https://github.com/tmux/tmux/wiki) to avoid potential lost of progress due to disconnction. A cheatsheet for use them can be found [here](./instructions/multiplexers.md). 

## Data Synthesis
Our first step is to pick a domain and use Genie to synthesize training data for it.
We will also convert [CSQA dataset](https://amritasaha1812.github.io/CSQA/) partially for few-shot training and validation.

Sign up for a domain [here](https://docs.google.com/spreadsheets/d/1lZ_3EGYKPKvCtNV9kYschN7cnlKt03az9k3zSASa9tw/edit?usp=sharing) (using your Stanford email account). Each domain only has 5 slots maximum, so act quickly to secure the one you want to try. Edit the Makefile to set `experiment` to the domain you signed up at line 8 as follows:
```make
experiment ?= <YOUR_DOMAIN>
```
Make sure the domain name is **lower cased**. 

After setting up the domain, run the following command to synthesize data:
```bash
make datadir 
```
The synthesis will take about 1 hour, depending on the domain. 

It will generate 
- the manifest, `<DOMAIN>/manifest.tt`, containing the schema of the domain, including entities involved, all properties, and their natural language annotations; 
- a parameter dataset for augmentation, under `<DOMAIN>/parameter-dataset`; 
- a dataset in `datadir`, containing the training set composed of (1) synthetic data generated based on the manifest (2) 100 examples converted from CSQA training set, both augmented with the parameter datasets; and a valid/eval set, converted from CSQA dev set.

Each column in the data files lists the ID of the example, the lowercased natural language utterance, and the gold ThingTalk program, respectively.
Check the training set (`datadir/train.tsv`) and dev set (`datadir/valid.tsv`) to see how the synthesized training queries and evaluation queries look like.

For the exact set of properties available for your domain, check the `manifest.tt` file. Search for `list query` to locate the domain signature, and all properties are listed inside the parentheses in the format `out <NAME> : <TYPE>`. Each of them is also annotated with `#_[canonical={}]` which includes how the property can be described in natural language in difference part of speech. For more details about the annotation syntax, check [Genie Annotation Reference](https://wiki.almond.stanford.edu/genie/annotations).

**If you want to rerun this step, make sure to run `make clean` first. Otherwise, `make` will not regenerate files that already exist.**

## Train a Semantic Parser 
With the data prepared, we can now start training using the following command
```bash
make train
```
This takes about 1 hour with V100/P100 GPU or 4 hours with K80.
You can start a tensorboard with `tensorboard --logdir <DOMAIN>/models` (replace `<DOMAIN>` with your domain name) to monitor the training. 
Once tensorboard is running in the VM. Run the following command on your PC to port forward tensorboard:
```bash
gcloud compute ssh --zone "<YOUR_ZONE>" "<YOUR_VM_NAME>" -- -NfL 6006:localhost:6006
```
Now you can open tensorboard in your browser: http://localhost:6006/.

## Evaluate the Semantic Parser
To check the accuracy of the trained model over the evaluation set of CSQA, run 
```bash
make evaluate
```
After the evaluation finishes, you will have two files:
- `./<DOMAIN>/eval/1.results`: short file in CSV form containing accuracy
- `./<DOMAIN>/eval/1.debug`: the error analysis file which compares the output of the model with the gold annotation, and reports all the errors

See [instructions/eval-metrics.md](instructions/eval-metrics.md) for details of these files.

Note: to reduce cost and time, we generate a relatively small dataset (10K~20K examples) in this homework and train for only 10K iterations. In practice, we can synthesize a much larger dataset and train for more iterations, which will give us a few percent of improvement on accuracy. 

## Talk to Your Model
Now it's time to test your model for real. You will start a web interface to talk to your model directly. 

Run the following command to start a server that will continuously run the trained model in inference mode:
```bash
./run-nlu-server.sh --domain <DOMAIN> --nlu_model 1
```

Then in a separate tab/session, run:
```bash
./run-genie.sh --domain <DOMAIN>
```

This will start a web Genie assistant at port 3000. Similar to tensorboard, you can port forward it
by running the following command on your local PC:
```bash
gcloud compute ssh --zone "<YOUR_ZONE>" "<YOUR_VM_NAME>" -- -NfL 3000:localhost:3000
```

You can now ask questions to your model at http://127.0.0.1:3000. Follow the configuration instructions, then click on Conversation to access the dialogue agent.
Note that the model can only answer questions with properties in scope. Refer to the evaluation dataset or the manifest for what are the available properties.

Hint: despite decent accuracy reported on artificial evaluation set, the agent is very likely to perform poorly. 

## Submission
Each student should submit a pdf file and include the following: 
- The domain you chose
- The accuracy of your model (from `./<DOMAIN>/eval/1.results`) and a screenshot of the tenserboard `almond/em/val` plot
- At least five commands you've tried with their genie server log (copy from the tab running `run-genie.sh`). 

