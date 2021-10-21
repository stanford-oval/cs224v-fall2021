# Homework 3: Build A Conversational Restaurant Agent

In this homework, you will learn how to train dialogue models and build an agent for searching restaurants. A baseline model is provided and we will improve it using few-shot data.

## Setup
In `hw3` directory, run 
```bash
npm install
```

Note: You will be doing this from your GCP instance, just like in HW1 and HW2. In order to get the latest update of the repo, you might have to `git add .`, `git stash`, and `git pull`)

## Part 1: Download the Baseline Model and Test How it Performs
Run the following command to download a baseline model trained with only synthetic data. 
```bash
make download-baseline
```

Then start your Genie assistant similar to homework 1:
```bash
# in gcloud
./run-nlu-server.sh --nlu_model baseline

# in a separate tab/session of gcloud
./run-genie.sh

# on your local machine 
gcloud compute ssh --zone "<YOUR_ZONE>" "<YOUR_VM_NAME>" -- -NfL 3000:localhost:3000
```

Now you can test the agent at http://127.0.0.1:3000. 
Try at least 5 contextual conversations with multiple turns. Save your server log. 

How does the baseline model perform? Where does it fail? 


## Part 2: Improving the Model With Few-Shot

In this part, you will collect your few-shot data to improve your model. We highly recommend you read through all the annotation instructions and guides before starting your annotations.

### Step 1: Data Collection and Annotation

Your first step is to collect the few-shot data and annotate it. Because you have a working agent as a starting
point, you will collect the data by interacting with the agent while correcting the parser when it makes mistakes.

To start, run the following commands:
```
./run-annotate.sh
```

The command first waits for you to enter a command, at the `U:` prompt. The script parses the command and shows you a list of candidate
parses in ThingTalk. Your job is to select the correct parse, or enter the correct parse if the model got it wrong.
Most of the time, the list will contain exactly one item, some times it will contain none. You can type a number to
select an item from a list.  You can type `e` followed by a number (e.g. `e 1`) to edit an item in the list.
Alternatively, you can type the ThingTalk code directly.

You must make sure you type complete dialogue states (including the `$dialogue` prefix and dialogue act) at every turn.
Check the [annotation guide](./annotation-guide.md) for more detailed instructions. 
Note that sometimes the tool might give you an option in the list that is not a valid dialogue state.
Disregard that, or edit it to make it a valid dialogue state.

After you enter the user state, the commands you entered are executed, and the dialogue context is shown, prefixed
by `C:`. Then the agent replies, prefixed by `A:`. You can then enter another command to continue the dialogue, or
type `d` to terminate the current dialogue and start the next one.
**Only terminated dialogue will be saved. Make sure you type `d` after your last turn of each dialogue!**

If a particular turn is not representable in ThingTalk, you can discard that turn by typing `d` followed by a short phrase indicating the reason.

At any point, you can interrupt the process by typing q or pressing Ctrl-C.

The command will save the data in `com.yelp/eval/train/annotated.txt`. The file contains multiple dialogues separated
by `====`. Each dialogue contains the user input `U:`, followed by the user state `UT:`, the dialogue context `C:`,
agent utterance `A:` and agent target `AT:`. The first line in each dialogue that starts with `#` contains the ID
of the dialogue; other lines starting with `#` are comments. You can edit the annotated.txt file to correct
any mistake during interactive annotation.

**In total, annotate at least 50 turns of conversation.** Otherwise it's not enough to fine tune the model and improve the accuracy.'

This step is not computational demanding. Depending on your Google Cloud credit left, you might want to run this step on your local machine. 
Clone this repo and follow the same setup steps given above. In addition, install genienlp with `pip3 install genienlp`. Then you can follow the same step to download the baseline model and run annotation. 

### Step 2: Training

The second step is to use the newly annotated data to improve the model.
Use
```bash
make datadir/fewshot
```
To generate the dataset.

This command will complain if there are syntax or type errors in the annotated data. If you see an error
of the form "cannot find entity", it means the user or agent is referring to an entity in the code that is
not visible, either in the sentence or in the portion of the context visible to the NLU/NLG. You might have
to edit the user/agent state for that particular dialogue, or discard the dialogue and annotate it again.

Now you can fine tune the baseline model with your fewshot data:
```bash
make finetune
```
By default the model is named `1`, you can change the model name with the option `model=<YOUR_MODEL_NAME>` appended.

## Part 3: Evaluation
Follow the same steps in Part 1 (replace `baseline` to the name of your new model) to run your agent again. 
Test it with the same dialogs in Part 1. Is it working now? How does your new model perform? 

Run the following command to evaluate both the baseline model and the fewshot model on a provided dev set (`com.yelp/eval/dev/annotated.txt`):
```bash
# evaluate the baseline model
make model=baseline evaluate

# evaluate the few shot model
make model=<YOUR_MODEL_NAME> evaluate
```
This will take a couple of minutes, wait patiently until the evaluation finishes.

You will get `.nlu.results` and `.dialogue.results` files for both models under `./everything/dev/`.
`.nlu.results` shows the turn-by-turn accuracy. It has a [similar format](../hw1/instructions/eval-metrics.md) as what we have for single-turn results in homework 1 and 2. 
`.dialogue.results` shows more dialogue metrics. Each column shows 
- the name of the evaluation set
- number of dialogues 
- number of turns
- complete dialogue accuracy (exact match, slot only)
- first turn accuracy (exact match, slot only)
- turn-by-turn accuracy (exact match, slot only)
- up-to-error accuracy (exact match, slot only)
- time to first error (exact match, slot only)

Please refer to [this page](https://wiki.almond.stanford.edu/genie/evaluation#dialogue-evaluation) for more details.

How do the two models compare when evaluating on the dev set? 

## Submission
Each student should submit your fewshot data (`com.yelp/eval/train/annotated.txt`) and evaluation result files for your fewshot model (`.nlu.results`, `.nlu.debug`, `.dialogue.debug`, `.dialogue.results`), 
as well as a pdf or text file with the following: 
- The conversations you tested on the baseline model and its server log.
- The server log of the same questions on the fewshot model.  
- An analysis of the performance comparison between the baseline model and fewshot model on (1) your own conversations (2) the provided dev set.
