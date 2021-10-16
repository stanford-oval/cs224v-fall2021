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

In this part, you will collect your few-shot data to improve your model. There are two main approaches:
WOZ, or interactive annotation. You will use WOZ in this homework.
In WOZ annotation, two people interact with each other, while one of them pretends to be an automated agent.

### Step 1: Data Collection and Annotation

Your first step is to collect the few-shot data and annotate it. Because you have a working agent as a starting
point, you will collect the data by interacting with the agent while correcting the parser when it makes mistakes.

To annotate, run the following commands:
```
./run-annotate.sh
```

The command first waits for you to enter a command, at the `U:` prompt. The script parses the command and shows you a list of candidate
parses in ThingTalk. Your job is to select the correct parse, or enter the correct parse if the model got it wrong.
Most of the time, the list will contain exactly one item, some times it will contain none. You can type a number to
select an item from a list.  You can type `e` followed by a number (e.g. `e 1`) to edit an item in the list.
Alternatively, you can type the ThingTalk code directly.

You must make sure you type complete dialogue states (including the $dialogue prefix and dialogue act) at every turn.
See the notes below. Note that sometimes the tool might give you an option in the list that is not a valid dialogue state.
Disregard that, or edit it to make it a valid dialogue state.

After you enter the user state, the commands you entered are executed, and the dialogue context is shown, prefixed
by `C:`. Then the agent replies, prefixed by `A:`. You can then enter another command to continue the dialogue, or
type `d` to terminate the current dialogue and start the next one.

If a particular turn is not representable in ThingTalk, you can discard that turn by typing `d` followed by a short phrase indicating the reason.

At any point, you can interrupt the process by typing q or pressing Ctrl-C. Make sure you pass `--append` to
the command if restart it, to avoid overwriting the data.

The command will save the data in `com.yelp/eval/train/annotated.txt`. The file contains multiple dialogues separated
by `====`. Each dialogue contains the user input `U:`, followed by the user state `UT:`, the dialogue context `C:`,
agent utterance `A:` and agent target `AT:`. The first line in each dialogue that starts with `#` contains the ID
of the dialogue; other lines starting with `#` are comments. You can edit the annotated.txt file to correct
any mistake during interactive annotation.

### Step 2: Training

The second step is to use the newly annotated data to improve the model.
Use
```
make datadir/fewshot
```
To generate the dataset.

This command will complain if there are syntax or type errors in the annotated data. If you see an error
of the form "cannot find entity", it means the user or agent is referring to an entity in the code that is
not visible, either in the sentence or in the portion of the context visible to the NLU/NLG. You might have
to edit the user/agent state for that particular dialogue, or discard the dialogue and annotate it again.

Then you can train...


## Part 3: Evaluation
Follow the same steps in Part 1 (replace `baseline` to the model name of your new model, `1` by default) to run your agent with the new model. 

Test it with the same dialogs failed in Part 1. Is it working now? Try some more dialogs. How does your new model perform? 

## Notes on Annotations

The syntax of a ThingTalk user state is:
```
$dialogue @org.thingpedia.dialogue.transaction.<user dialogue act>;
<program>;
```
Refer to Lecture 8 for the full list of dialogue act. Most often, you will use one of these three dialogue acts:
- `greet`: the user says "hello" (without anything else)
- `cancel`: the user says "cancel", "thanks", "goodbye", or similar
- `execute`: any other command

Refer to the [ThingTalk guide](https://wiki.almond.stanford.edu/thingtalk/guide) to learn how to write
the ThingTalk statement associated with the `execute` act.

For maximum accuracy, you should also follow these conventions. The conventions should become apparent
given the output of the initial parser.

- The name of the restaurant is denoted by the `id` parameter.

  - The first command in a dialogue that refers to a name uses `id =~`. Example:
    ```
    U: I'm looking for Starbucks.
    UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
    UT: @com.yelp.restaurant(), id=~"starbucks";
    ```
  - Subsequent commands, after a restaurant has been mentioned in the context, use `id ==`. Example:
    ```
    A: I found Starbucks.
    AT: $dialogue @org.thingpedia.dialogue.transaction.sys_recommend_one;
    U: What's the address?
    UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
    UT: [geo] of @com.yelp.restaurant(), id==null^^com.yelp:restaurant("starbucks");
    ```
    
    The syntax has the ID of the restaurant, the notation `^^com.yelp:restaurant`, and the name of the
    restaurant in parenthesis. Leave `null` to have the system choose the right ID automatically.

- Questions about a specific item that the agent just mentioned use `id ==`, even if the user is not
  mentioning the name explicitly. In this case, you must copy right ID from the context.
  
  ```
  A: I have Panda Express.
  AT: $dialogue @org.thingpedia.dialogue.transaction.sys_recommend_one;
  U: What's the address?
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: [geo] of @com.yelp.restaurant(), id == "panda-express-stanford-2"^^com.yelp:restaurant("panda express");
  ```

- You should carry over all the filter clauses that the user has mentioned, even when the user chooses
  a specific restaurant. Example:
  
  ```
  U: I'm looking for Chinese food.
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: @com.yelp.restaurant(), contains(cuisines, null^^com.yelp:restaurant_cuisine("chinese"));
  ...
  A: I have Panda Express.
  AT: $dialogue @org.thingpedia.dialogue.transaction.sys_recommend_one;
  U: What's the address?
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: [geo] of @com.yelp.restaurant(), contains(cuisines, null^^com.yelp:restaurant_cuisine("chinese")) && id == "panda-express-stanford-2"^^com.yelp:restaurant("panda express");
  ```

- Use `sort` and `[1]` for argmin/argmax. Example:

  ```
  U: Find the closest Chinese.
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: sort(distance(geo, $location.here) asc of @com.yelp.restaurant(), contains(cuisines, null^^com.yelp:restaurant_cuisine("chinese")))[1];
  ```

- The normalized ThingTalk has filters in the innermost clause, and projection in the outermost clause.

  Correct example:
  ```
  U: Find the address of the closest Chinese.
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: [geo] of (sort(distance(geo, $location.here) asc of @com.yelp.restaurant(), contains(cuisines, null^^com.yelp:restaurant_cuisine("chinese")))[1]);
  ```

  Incorrect example:
  ```
  U: Find the address of the closest Chinese.
  UT: $dialogue @org.thingpedia.dialogue.transaction.execute;
  UT: (sort(distance(geo, $location.here) asc of [geo] of @com.yelp.restaurant()), contains(cuisines, null^^com.yelp:restaurant_cuisine("chinese")))[1];
  ```
  
  Normalization will catch some of these errors and convert to the normalized form, but there might
  be slight semantic differences (eg. argmin before filter is different than filter before argmin) so don't rely on it.
