# Evaluation Metrics

After you train a model, you can add it to the Makefile and run `make evaluate` to produce
the evaluation metrics. These metrics are stored in files ending in `.results` and `.debug`
in the directory containing the evaluation set.

The `.results` file is a comma-separated file that looks like this:
```
eval,all,1242,0.7584541062801933,0.7616747181964574,0.9500805152979066,0.9500805152979066,0.9500805152979066,0.9500805152979066
eval,<=1,1242,0.7584541062801933,0.7616747181964574,0.9500805152979066,0.9500805152979066,0.9500805152979066,0.9500805152979066

```

**TLDR**: the accuracy is the second number in the first row. 

Long version:   
We report the accuracy on all questions in the first row, and then we break it down by the complexity of the questions. But since the evaluation set we converted from CSQA only contains simple questions, you should only see one or two extra rows in the file.

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


