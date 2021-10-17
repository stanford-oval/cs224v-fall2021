# Homework 3: Improving dialogues

In this homework, you will learn how to train dialogue models and build an agent for searching restaurants. A baseline model is provided and we will improve it using few-shot data.

## Setup
In `hw3` directory, run 
```bash
npm install
```

## Part 1: Download Baseline Model and Test How it Performs. 
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

Now you can test the agent at http://127.0.0.1:3000. Try some contextual conversations with multiple turns. Save your server log. 

How does the baseline model perform? Where does it fail? 


## Part 2: Improving the Model With Few-Shot

In this part, you will collect your few-shot data to improve your model. 

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

If a particular turn is not representable in ThingTalk, you can discard that turn by typing `d` followed by a short phrase indicating the reason.

At any point, you can interrupt the process by typing q or pressing Ctrl-C.

The command will save the data in `com.yelp/eval/train/annotated.txt`. The file contains multiple dialogues separated
by `====`. Each dialogue contains the user input `U:`, followed by the user state `UT:`, the dialogue context `C:`,
agent utterance `A:` and agent target `AT:`. The first line in each dialogue that starts with `#` contains the ID
of the dialogue; other lines starting with `#` are comments. You can edit the annotated.txt file to correct
any mistake during interactive annotation.

**In total, annotate at least 50 turns of conversation.** Otherwise it's not enough to fine tune the model and improve the accuracy.

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
Test it with the same dialogs failed in Part 1. Is it working now? Try some more dialogs. How does your new model perform? 

