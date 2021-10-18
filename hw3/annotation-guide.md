# Annotation Guide

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