# Running Superuman Voting Script

### Installation

```bash
yarn
```

### Usage

Once installed, you can edit the params and deploy the script using:

```bash
node index.js
```

To run the script to retrieve rewards, run the below command with the latestRoundId in the retrieve_script.js file set to the round you would like the script to run from:

```bash
node retrieve_script.js
```

In the current state, the commitVote and revealVote contract calls can easily be copied and pasted into the gnosis Transaction JSON input.