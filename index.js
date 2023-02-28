const { getRandomSignedInt, computeVoteHashAncillary } = require("@uma/common");
const fs = require("fs");

// networks file (https://github.com/UMAprotocol/protocol/blob/master/packages/core/networks/1.json)
let votingContract = "0x8B1631ab830d11531aE83725fDa4D86012eCCd77"; 
// https://etherscan.io/address/0x8B1631ab830d11531aE83725fDa4D86012eCCd77#readContract
// https://web3-type-converter.onbrn.com/

// safe address (should not need to be changed)
let safe = "0xC75aDbf2a5a6A51302c1c7cC789366ed16e1E0F3";

// identifier: use voter dapp or logs
// ancillaryData: use voter dapp or logs
// price you are voting for. Should be 0, 1000000000000000000, or magic number (-57896044618658097711785492504343953926634992332820282019728792003956564819968)
// time: use voter dapp or logs

let roundId = "9707"; // voter dapp or voting contract
let votes = [
  {
    identifier:
      "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x713a207469746c653a204e42413a20476f6c64656e2053746174652057617272696f72732076732e204d696e6e65736f74612054696d626572776f6c76657320323032332d30322d32362c206465736372697074696f6e3a20496e20746865207570636f6d696e67204e42412067616d652c207363686564756c656420666f7220466562727561727920323620617420373a3330e280af504d3a0a0a49662074686520476f6c64656e2053746174652057617272696f72732077696e2c20746865206d61726b65742077696c6c207265736f6c766520746f20e2809c57617272696f7273e2809d2e0a0a496620746865204d696e6e65736f74612054696d626572776f6c7665732077696e2c20746865206d61726b65742077696c6c207265736f6c766520746f20e2809c54696d626572776f6c766573e2809d2e0a0a204966207468652067616d65206973206e6f7420636f6d706c6574656420627920417072696c2031362c2032303233202831313a35393a353920504d20455354292c20746865206d61726b65742077696c6c207265736f6c76652035302d35302e207265735f646174613a2070313a20302c2070323a20312c2070333a20302e352e20576865726520703120636f72726573706f6e647320746f2054696d626572776f6c7665732c20703220746f2057617272696f72732c20703320746f20756e6b6e6f776e2f35302d35302c696e697469616c697a65723a623239393661613132396336353834396364316661303463626431356131366136323637356230312c6f6f5265717565737465723a366139643232323631366339306663613537353463643133333363666439623766623661346637342c6368696c645265717565737465723a656533616665333437643563373433313730343165323631386334393533346461663838376332342c6368696c64436861696e49643a313337",
    price: "-57896044618658097711785492504343953926634992332820282019728792003956564819968",
    time: 1677302710,
  },
  {
    identifier:
      "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
    ancillaryData:
      "0x713a207469746c653a204e42413a204c4120436c6970706572732076732e2053616372616d656e746f204b696e677320323032332d30322d32342c206465736372697074696f6e3a20496e20746865207570636f6d696e67204e42412067616d652c207363686564756c656420666f722046656272756172792032342061742031303a3330e280af504d2045543a0a0a496620746865204c4120436c6970706572732077696e2c20746865206d61726b65742077696c6c207265736f6c766520746f20e2809c436c697070657273e2809d2e0a0a4966207468652053616372616d656e746f204b696e67732077696e2c20746865206d61726b65742077696c6c207265736f6c766520746f20e2809c4b696e6773e2809d2e0a0a4966207468652067616d65206973206e6f7420636f6d706c6574656420627920417072696c2031362c2032303233202831313a35393a353920504d204554292c20746865206d61726b65742077696c6c207265736f6c76652035302d3530207265735f646174613a2070313a20302c2070323a20312c2070333a20302e352e20576865726520703120636f72726573706f6e647320746f204b696e67732c20703220746f20436c6970706572732c20703320746f20756e6b6e6f776e2f35302d35302c696e697469616c697a65723a623239393661613132396336353834396364316661303463626431356131366136323637356230312c6f6f5265717565737465723a366139643232323631366339306663613537353463643133333363666439623766623661346637342c6368696c645265717565737465723a656533616665333437643563373433313730343165323631386334393533346461663838376332342c6368696c64436861696e49643a313337",
    price: "-57896044618658097711785492504343953926634992332820282019728792003956564819968",
    time: 1677305519,
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
let rewards = [];

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
                "internalType": "bytes",
                "name": "ancillaryData",
                "type": "bytes"
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
            "ancillaryData": "${price.ancillaryData}",
            "salt": "${salt}"
          }
        }`);

    rewards.push(`
        {
          "to": "${votingContract}",
          "value": "0",
          "data": null,
          "contractMethod": {
            "inputs": [
              {
                "internalType": "address",
                "name": "voterAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
              },
              {
                "components": [
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
                  }
                ],
                "internalType": "struct VotingAncillaryInterface.PendingRequestAncillary[]",
                "name": "toRetrieve",
                "type": "tuple[]"
              }
            ],
            "name": "retrieveRewards",
            "payable": false
          },
          "contractInputsValues": {
            "voterAddress": "${safe}",
            "roundId": "${roundId}",
            "toRetrieve": "[[\\"${price.identifier}\\",\\"${price.time}\\",\\"${price.ancillaryData}\\"]]"
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
    fs.createWriteStream(`./output_files/${roundId}_commits.json`)
  );

  const revealConsole = new console.Console(
    fs.createWriteStream(`./output_files/${roundId}_reveals.json`)
  );

  const retrieveConsole = new console.Console(
    fs.createWriteStream(`./output_files/${roundId}_retrieve.json`)
  );

  commitConsole.log(voteJSON(commits));
  revealConsole.log(voteJSON(reveals));
  retrieveConsole.log(voteJSON(rewards));
}

voteParams();
