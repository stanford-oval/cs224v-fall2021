# Homework 3: Improving dialogues

In this homework, you will learn how to train dialogue models, and how to improve them using few-shot data.

## Setup

TODO

By the end of this part, you will have a working dialogue agent, using the models pretrained by the TAs.

## Part 1: Collecting Few-shot data

In this part, you will collect your few-shot data to improve your model. There are two main approaches:
WOZ, or interactive annotation. You will use WOZ in this homework.
In WOZ annotation, two people interact with each other, while one of them pretends to be an automated agent.

### Step 1: Data Collection
Yur first step is to collect the conversation data. You can take turns with your partner: one of them pretends
to be a user, and the other uses Yelp to find relevant restaurants.

The output should be a file called `input.txt` in the directory `com.yelp/eval/train/annotated.txt` with
dialogues separated by a line containing `====` (a line with exactly 4 equal signs). The first line in a
dialogue starting with `#` is the ID of the dialogue (you can choose what ID to use); other lines starting
with `#` are comments. Each dialogue alternates lines starting with `U:` (user turns) and lines starting
with `A:` (agent turns). **The user speaks first and last**, you will receive errors if you omit a turn.

Example:
```
# woz/1
# this is a comment
U: Find me a Chinese restaurant.
A: Where?
U: Near Stanford.
A: Do you like Panda Express?
U: Nah I hate it.
====
# woz/2
U: What's the best food at Stanford.
A: I really love Tree Hourse. They have pizza, Mexican, Indian.
U: What's their rating?
A: 4.5, says Yelp.
U: Very nice, thank you.
```

### Step 2: Annotation

To annotate, run the following commands:
```
make eval/everything/schema.tt eval/everything/database-map.tsv
genie manual-annotate-dialog --thingpedia eval/everything/schema.tt --database-file eval/everything/database-map.tsv \
   --user-nlu-server $usermodel --agent-nlu-server $agentmodel \
   --annotated com.yelp/eval/train/annotated.txt --dropped com.yelp/eval/train/dropped.txt com.yelp/eval/train/input.txt
```

The command loads each dialogue from input.txt, and parses all commands in turn. Both the user and the agent commands
will be parsed (using the two models you downloaded in the setup), to compute the user state and the agent state respectively.

After each turn is parsed, the annotation script shows you a list of candidate parses in ThingTalk. Your job is to select the
correct parse, or enter the correct parse if the model got it wrong. Most of the time, the
list will contain exactly one item, some times it will contain none. You can type a number to select an item from a list. 
You can type `e` followed by a number (e.g. `e 1`) to edit an item in the list. Alternatively, you can type the ThingTalk
code directly.

You must make sure you type complete dialogue states (including the $dialogue prefix and dialogue act) at every turn.
Look at Lecture 8 and the [ThingTalk guide](https://wiki.almond.stanford.edu/thingtalk/guide) to learn how to write ThingTalk.

After you enter the user state, the commands that the user asked for are executed, and the result is shown to you
as a ThingTalk dialogue context, prefixed with `C:` in each line. By convention, the agent talks about the results
in the order they appear in the context, starting from the first one. If the human agent didn't follow that convention,
you must edit the context. Copy-paste the whole context (all lines starting with C:) in a text editor, rearrange or edit the results, then copy-paste
it back into the terminal. Lines you type that start with `C: ` are interpreted as editing the context, so make sure
you include the `C: ` prefix.

After fixing the context if necessary, you can then annotate the agent state based on what the human agent wrote
in the utterance.

If a particular turn is not representable in ThingTalk, you can discard that turn by typing d followed by a short phrase indicating the reason.
When a turn is discarded, the dialogue is truncated. The part that was annotated until then is added to the output,
and the whole dialogue is added to dropped.txt along with the reason and turn number.

At any point, you can interrupt the process by typing q or pressing Ctrl-C. To resume at a later point
without restarting from scratch, append `--offset` to the command line, followed by the index of a dialogue
to resume from (in the order of `input.txt`). **If you run the annotation without --offset all existing data will be
discarded.**

Use h to see additional commands available while annotating.

The command will save the data in `com.yelp/eval/train/annotated.txt`. The format is similar to `input.txt`,
but additionally the user state will be saved as `UT:`, the agent state as `AT:`, and the context as `C:`.
Look at the existing annotated dev data for examples.

### Step 3: Training

The final step is to use the newly annotated data to improve the model.
Use
```
make datadir/fewshot
```
To generate the dataset.

This command will complain if there are syntax or type errors in the annotated data. If you see an error
of the form "cannot find entity", it means the user or agent is referring to an entity in the code that is
not visible, either in the sentence or in the portion of the context visible to the NLU/NLG.

Then you can train...
