# Build a QA Skill for a Wikidata Domain with Genie

In this homework, you will learn to use Genie and build a question-answering skill for a Wikidata domain of your choice. 

We want all students to have hands-on experience in training a large neural network.  (No prior knowledge in machine learning is assumed.)  
Simply running every command once may take more than XX hours.
**Please start early and budget your time accordingly!**

## Setup 
Follow the [setup guide](setup.md) to install Genie toolkit and its dependencies on Google Cloud Platform. 

Since both the synthesis and training will takes a long time to finish, we recommend to run everything using a terminal multiplexer such as [screen](https://www.gnu.org/software/screen/) and [tmux](https://github.com/tmux/tmux/wiki). A cheatsheet for use them can be found [here](multiplexers.md). 

## Data Synthesis
Sign up for a domain at [here](https://docs.google.com/spreadsheets/d/1lZ_3EGYKPKvCtNV9kYschN7cnlKt03az9k3zSASa9tw/edit?usp=sharing), and edit the Makefile to set `experiment` to the domain you signed up for at line 8 as follows:
```make
experiment ?= ${domain} 
```

After setting up the domain, run the following command to synthesize data:
```bash
make datadir 
```

The synthesis will take about XX hours depending on the domain. 

It will generate (1) the manifest, `${domain}/manifest.tt`, containing the schema of the domain, including entities involved, all properties and their natural language annotations; (2) a parameter dataset for augmentation, under `${domain}/parameter-dataset`; and (3) a dataset in `datadir`, containing the training set generated based on the manifest and augmented by the parameter dataset, and a valid/eval set, converted from simple questions in CSQA. 

Check the manifest to learn about what are the properties available for the domain, and how are they annotated (using the syntax `canonical=#[]`). How is the quality of the automatically generated annotations? 
Also Check `datadir/train.tsv` to see how the synthesized training examples look. 

## Train a Semantic Parser 
To train a parser, simply run the following command 
```bash
make train
```

This will take about XX hours.  You can start a tensorboard with `tensorboard --logdir ${domain}/models --bind_all` (replace `${domain}` with your domain name) to monitor the training. 

## Evaluate the Semantic Parser
TODO: a command line tool that connect to wikidata query service and test the model by typing in questions.

Note, since CSQA containing no numeric fields, any question with numbers, dates, measurements won't work. 
```bash
make evaluate
```

## Submission
Each student should submit a text file on Canvas, and include the following: 
- The domain you chose
- The training accuracy 
- At least 10 commands you've tried with their thingtalk output and answer returned. 
- Check the synthetic training set produced by Genie and based on evaluation result, write a short paragraph describing the issues you have observed and potential ways to improve. 

