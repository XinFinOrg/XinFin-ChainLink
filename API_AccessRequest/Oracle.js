/* eslint-disable */
const Xdc3 = require("xdc3");
require("dotenv").config();

console.log("testing",process.env.PRIVATE_KEY)
async function main() {
  const xdc3 = new Xdc3(
    new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
  );

  const deployed_private_key = process.env.PRIVATE_KEY;

  //Oracle ABI & Contract address to pass here
  const oracleABI = require("./ABI/OracleAbi.json");
  const oraclecontractAddr = process.env.ORACLE_CONTRACT;
  //xdc18facef585ce8e60c86b8c0f7e19c2cb3ea8e736


  //Chainlink Node Account Address can be fetched from GUI - http://localhost:6688
  const chinlinknode=process.env.ACCOUNT_ADDRESS;

  //Defining OracleContract
  const oraclecontract = new xdc3.eth.Contract(oracleABI, oraclecontractAddr);
  console.log("orclecontract",oraclecontract)
  const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
  const nonce = await xdc3.eth.getTransactionCount(account.address);
  const gasPrice = await xdc3.eth.getGasPrice();
  const tx = {
    nonce: nonce,
    data: oraclecontract.methods.setFulfillmentPermission(chinlinknode, true).encodeABI(),
    gasPrice: gasPrice,
    to: process.env.ORACLE_CONTRACT,   // Oracle contract address
    from: account.address,
  };

  const gasLimit = await xdc3.eth.estimateGas(tx);
  tx["gasLimit"] = gasLimit;

  console.log("gasLimit",gasLimit)

  const signed = await xdc3.eth.accounts.signTransaction(
    tx,
    deployed_private_key
  );
  xdc3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("receipt", console.log);

  let status = await oraclecontract.methods.getAuthorizationStatus(chinlinknode)
  console.log("Status",status);
}

main().catch(e => console.error(e));
