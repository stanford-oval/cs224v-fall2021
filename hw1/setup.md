# Setup Guide

## Google Cloud Platform 
This homework requires access to significant compute resources, including GPUs to train a neural network. To simplify that, all students will receive a Google Cloud Platform coupon. You should have received an email with instructions to redeem your coupon and apply it to your personal GCP account.

You will be responsible for creating and managing (starting, stopping) the VM instances used by this homework. You will be billed while the instances are running (and you will be responsible for charges beyond the coupon) so make sure you turn off any VM instance you are not using.

It is recommended to create a CPU+GPU instance, using an NVidia V100 GPU (~$2/hour).

We recommend using the Oregon (us-west-1) region, as it slightly cheaper and includes a larger set of available machine types, but any North American region should work. See detailed instructions and a tutorial for GCP [here](./google-cloud.md).

## Genie Environment 
To install the dependencies for the Genie toolkit, clone this repository and run the following command 
```bash
cd hw1
chmod +x install.sh
./install.sh
```
You might need to run You will need to logout and login again to load the corresponding commands.