const fs = require("fs");

const latestRoundId = 0;
const safe = "0xC75aDbf2a5a6A51302c1c7cC789366ed16e1E0F3";

let voteJSON = (transactions) => `{
  "version": "1.0",
  "chainId": "1",
  "createdAt": 1669736547670,
  "meta": {
    "name": "Transactions Batch",
    "description": "",
    "txBuilderVersion": "1.11.1",
    "createdFromSafeAddress": "${safe}",
    "createdFromOwnerAddress": "",
    "checksum": ""
  },
  "transactions":${transactions}
}`;

async function retrieveParams() {
  let transactions = [];
  let includedFiles = [];
  fs.readdir("./output_files", (err, files) => {
    files.forEach((file) => {
      const roundId = file.substring(0, file.indexOf("_retrieve"));
      if (Number(roundId) > latestRoundId) {
        includedFiles.push(file);
      }
    });
    includedFiles.forEach((file) => {
      const data = fs.readFileSync("output_files/" + file, "utf8");
      const parsedData = JSON.parse(data);
      transactions.push(parsedData.transactions);
    });
    const flatTxs = transactions.flat();
    const votingJSON = voteJSON(JSON.stringify(flatTxs));
    const revealConsole = new console.Console(
      fs.createWriteStream(`./retrieve_files/${latestRoundId}_retrieve.json`)
    );
    revealConsole.log(votingJSON);
  });
}

retrieveParams();
