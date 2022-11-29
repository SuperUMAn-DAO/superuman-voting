const { getRandomSignedInt, computeVoteHashAncillary } = require("@uma/common");
const fs = require("fs");

// networks file (https://github.com/UMAprotocol/protocol/blob/master/packages/core/networks/1.json)
let votingContract = "0x8B1631ab830d11531aE83725fDa4D86012eCCd77";
// voter dapp or voting contract
let roundId = "9657";
// safe address (should not need to be changed)
let safe = "0xC75aDbf2a5a6A51302c1c7cC789366ed16e1E0F3";

// identifier: use voter dapp or logs
// ancillaryData: use voter dapp or logs
// price you are voting for. Should be 0, 1000000000000000000, or magic number (-57896044618658097711785492504343953926634992332820282019728792003956564819968)
// time: use voter dapp or logs

let votes = [
  {
    identifier:
      "0x4143524F53532D56320000000000000000000000000000000000000000000000",
    ancillaryData:
      "0x6F6F5265717565737465723A63313836666139313433353363343462326533336562653035663231383436663130343862656461",
    price: "0",
    time: 1669328675,
  },
  // Template for when there are multiple votes in a round.
  // {
  //   identifier:
  //     "",
  //   ancillaryData:
  //     "",
  //   price: "",
  //   time: ,
  // },
];

// helpers (no need to edit)
let magicNumber =
  "-57896044618658097711785492504343953926634992332820282019728792003956564819968";
let salt = 0;

while (true) {
  let generatedNumber = getRandomSignedInt();
  if (
    generatedNumber < Math.abs(magicNumber) &&
    generatedNumber > magicNumber
  ) {
    salt = generatedNumber;
    break;
  }
}

let commits = [];
let reveals = [];
function voteParams() {
  if (salt > Math.abs(magicNumber) || salt < magicNumber) {
    console.log("Salt is above or below magic number");
    return;
  }
  votes.map((price) => {
    const hash = computeVoteHashAncillary({
      price: price.price,
      salt: salt,
      account: safe,
      time: price.time,
      ancillaryData: price.ancillaryData,
      roundId: roundId,
      identifier: price.identifier,
    });

    commits.push(`
        {
          "to": "${votingContract}",
          "value": "0",
          "data": null,
          "contractMethod": {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "identifier",
                "type": "bytes32"
              },
              {
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "ancillaryData",
                "type": "bytes"
              },
              {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
              }
            ],
            "name": "commitVote",
            "payable": false
          },
          "contractInputsValues": {
            "identifier": "${price.identifier}",
            "time": "${price.time}",
            "ancillaryData": "${price.ancillaryData}",
            "hash": "${hash}"
          }
        }`);

    reveals.push(`
        {
          "to": "${votingContract}",
          "value": "0",
          "data": null,
          "contractMethod": {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "identifier",
                "type": "bytes32"
              },
              {
                "internalType": "uint256",
                "name": "time",
                "type": "uint256"
              },
              {
                "internalType": "int256",
                "name": "price",
                "type": "int256"
              },
              {
                "internalType": "int256",
                "name": "salt",
                "type": "int256"
              }
            ],
            "name": "revealVote",
            "payable": false
          },
          "contractInputsValues": {
            "identifier": "${price.identifier}",
            "time": "${price.time}",
            "price": "${price.price}",
            "salt": "${salt}"
          }
        }`);
  });

  let voteJSON = (x) => `{
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
    "transactions":[${x}]
  }`;

  const commitConsole = new console.Console(
    fs.createWriteStream(`./output_files/commits_${roundId}.json`)
  );
  commitConsole.log(voteJSON(commits));

  const revealConsole = new console.Console(
    fs.createWriteStream(`./output_files/reveals_${roundId}.json`)
  );
  revealConsole.log(voteJSON(reveals));
}

voteParams();
