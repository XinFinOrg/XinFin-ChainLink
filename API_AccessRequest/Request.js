/* eslint-disable */
//const PRIVATE_KEY = process.env.PRIVATE_KEY;
const Xdc3 = require("xdc3");
require("dotenv").config();

async function main() {
  const xdc3 = new Xdc3(
    new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
  );

  const deployed_private_key = process.env.PRIVATE_KEY;

  //Jobid to bridge - this can be fetched from GUI - http://localhost:6688
  const _oracle = "0x18facef585ce8e60c86b8c0f7e19c2cb3ea8e736";
  const jobId = xdc3.utils.toHex("3eea22a63cc142b5a6a1673fcfcb482e");
  const coin = "ETH"
  const market = "USD";

  //requestor ABI & Contract address to pass here
  const requestorABI = require("./ABI/RequestAbi.json");
  const requestorcontractAddr = "0xcd0e6a033218df7ec906cbf3d48cf99fd19f33f5";
    //xdccd0e6a033218df7ec906cbf3d48cf99fd19f33f5

  //Defining requestContract
  const requestContract = new xdc3.eth.Contract(requestorABI, requestorcontractAddr);
  
  const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
  const nonce = await xdc3.eth.getTransactionCount(account.address);
  const gasPrice = await xdc3.eth.getGasPrice();

  const tx = {
    nonce: nonce,
    data: requestContract.methods.createRequest(_oracle,jobId, coin, market).encodeABI(),
    gasPrice: gasPrice * 10,
    to: "0xcd0e6a033218df7ec906cbf3d48cf99fd19f33f5",   // Requestor contract address
    from: account.address,
  };

  const gasLimit = await xdc3.eth.estimateGas(tx);
  tx["gasLimit"] = gasLimit;

  const signed = await xdc3.eth.accounts.signTransaction(
    tx,
    deployed_private_key
  );
  xdc3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("receipt", console.log);
}

main().catch(e => console.error(e));
