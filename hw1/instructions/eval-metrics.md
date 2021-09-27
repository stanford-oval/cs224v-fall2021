# Evaluation Metrics

After you train a model, you can add it to the Makefile and run `make evaluate` to produce
the evaluation metrics. These metrics are stored in files ending in `.results` and `.debug`
in the directory containing the evaluation set.

The `.results` file is a comma-separated file that looks like this:
```
eval,all,202,0.6584158415841584,0.6831683168316832,0.8613861386138614,0.8712871287128713,0.8712871287128713,0.9306930693069307
eval,0,46,0.7608695652173914,0.7608695652173914,0.7608695652173914,0.8043478260869565,0.8043478260869565,0.9347826086956522
eval,1,24,0.5416666666666666,0.6666666666666666,0.875,0.875,0.875,0.875
eval,2,54,0.8703703703703703,0.9074074074074074,0.9814814814814815,0.9814814814814815,0.9814814814814815,0.9814814814814815
eval,3,20,0.55,0.55,0.95,0.95,0.95,0.95
eval,4,38,0.5,0.5,0.8421052631578947,0.8421052631578947,0.8421052631578947,0.8947368421052632
eval,5,10,0.7,0.7,0.9,0.9,0.9,1
eval,6,8,0.125,0.125,0.625,0.625,0.625,0.875
eval,7,1,0,0,0,0,0,0
eval,8,1,0,0,0,0,0,1
```

**TLDR**: the accuracy is the second number in the first row. 

Long version:   
We report the accuracy on all questions in the first row, and then we break it down by the complexity of the questions. 
Each column of a row:
- name of the set being evaluated
- complexity of the question (number of parameters in the prediction)
- dataset size (number of examples)
- exact match accuracy
- accuracy w/o parameters (that is, ignoring any part of the code between quote marks)
- function accuracy (find the correct function, not relevant to this homework because there is only one function)
- device accuracy (finding the correct device, not relevant to this homework because there is only one device)
- number of function accuracy (used to identify joins and when-do commands, not relevant to this homework)
- syntax accuracy


