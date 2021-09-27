# Build a QA Skill for a Wikidata Domain with Genie

In this homework, you will learn to use Genie and build a question-answering skill for a Wikidata domain of your choice. 

We want all students to have hands-on experience in training a large neural network.  (No prior knowledge in machine learning is assumed.)  
Simply running every command once may take about 3 hours.
**Please start early and budget your time accordingly!**

## Setup 

### Google Cloud Platform
This homework requires access to significant compute resources. We recommend to run **all steps** in Google Cloud Platform. All students should have received a Google Cloud Platform coupon for this class via email. The email includes instructions to redeem your coupon and apply it to your personal GCP account.
**Follow this detailed [instructions](./instructions/google-cloud.md) to setup your VM.**

You will be responsible for creating and managing (starting, stopping) the VM instances used by this homework. You will be billed while the instances are running (and you will be responsible for charges beyond the coupon) so make sure you turn off any VM instance you are not using.

### Genie Environment 
To install the dependencies for the Genie toolkit, clone this repository and run the following command (takes about 3 minutes)
```bash
git clone https://github.com/stanford-oval/cs224v-fall2021.git
cd cs224v-fall2021/hw1
./install.sh
```

Since both the synthesis and training will takes a long time to finish, we recommend to run everything using a terminal multiplexer such as [screen](https://www.gnu.org/software/screen/) and [tmux](https://github.com/tmux/tmux/wiki). A cheatsheet for use them can be found [here](./instructions/multiplexers.md). 

## Data Synthesis
Sign up for a domain at [here](https://docs.google.com/spreadsheets/d/1lZ_3EGYKPKvCtNV9kYschN7cnlKt03az9k3zSASa9tw/edit?usp=sharing), and edit the Makefile to set `experiment` to the domain you signed up for at line 8 as follows:
```make
experiment ?= ${domain} 
```
Make sure the domain name is **lower cased**. 

After setting up the domain, run the following command to synthesize data:
```bash
make datadir 
```
The synthesis will take about 1 hours depending on the domain. 

It will generate (1) the manifest, `${domain}/manifest.tt`, containing the schema of the domain, including entities involved, all properties and their natural language annotations; (2) a parameter dataset for augmentation, under `${domain}/parameter-dataset`; and (3) a dataset in `datadir`, containing the training set generated based on the manifest and augmented by the parameter dataset, and a valid/eval set, converted from simple questions in CSQA. 

Check the manifest to learn about what are the properties available for the domain, and how are they annotated (using the syntax `canonical=#[]`). How is the quality of the automatically generated annotations? 
Also Check `datadir/train.tsv` to see how the synthesized training examples look. 

If you want to rerun this step, make sure to run `make clean` first. Otherwise, `make` will not regenerate files already exist. 

## Train a Semantic Parser 
To train a parser, simply run the following command
```bash
make train
```
This takes about 1 hour with V100/P100 GPU, and 4 hours with K80.
You can start a tensorboard with `tensorboard --logdir ${domain}/models` (replace `${domain}` with your domain name) to monitor the training. 
Once tensorboard is running in the VM. Run the following command on your PC to port forward tensorboard:
```bash
gcloud compute ssh --zone "<YOUR_ZONE>" "<YOUR_VM_NAME>" -- -NfL 6006:localhost:6006
```
Now you can open tensorboard in your browser: http://localhost:6006/.

## Evaluate the Semantic Parser
To check the accuracy of the trained model over the validation set of CSQA, run 
```bash
make evaluate
```
After evaluation is done, you will have two files:
- `./${domain}/eval/1.results: short file in CSV form containing accuracy
- `./${domain}/eval/1.debug: the error analysis file which compares the output of the model with the gold annotation, and reports all the errors

See [instructions/eval-metrics.md](instructions/eval-metrics.md) for details of these files.

Note: to reduce cost and time, we are generating a relatively small dataset (10K~20K examples) in this homework, and train for only 10K iterations. In theory, we can synthesize as much data as possible and train for more iterations, which will give us a few percent of improvement on accuracy. 

## Question Answering with Your Model
Now it's time to test your model for real. 
Run the following command to start a server that will continuously run the trained model in inference mode:
```bash
./run-nlu-server.sh --domain ${domain} --nlu-model 1
```

Then in a separate tab/session, run:
```bash
./run-almond.sh --domain ${domain}
```

This will start an Almond server at port 3000. Similar to tensorboard, you can port forward it
by running the following command in your local PC:
```bash
gcloud compute ssh --zone "<YOUR_ZONE>" "<YOUR_VM_NAME>" -- -NfL 3000:localhost:3000
```

You can now ask questions to your model at http://127.0.0.1:3000. Follow the configuration instructions, then click on Conversation to access the dialogue agent.

## Submission
Each student should submit a text file on Canvas, and include the following: 
- The domain you chose
- The accuracy of your model 
- At least 5 commands you've tried with their nlu server log. 

