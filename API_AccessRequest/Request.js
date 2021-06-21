/* eslint-disable */
//const PRIVATE_KEY = process.env.PRIVATE_KEY;
const Xdc3 = require("xdc3");
require("dotenv").config();
const h = require("chainlink-test-helpers");

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

async function main() {

  const xdc3 = new Xdc3(
    new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
  );

  const deployed_private_key = process.env.PRIVATE_KEY;

  //Jobid to bridge - this can be fetched from GUI - http://localhost:6688
  const jobId = xdc3.utils.toHex(process.env.JOB_ID);
  // const jobId = "57b9b3203a074e9098529314ed7100ee";
  console.log("jobId", jobId);
  const url = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY";
  const coin = "ETH"
  const market = "USD";

  //requestor ABI & Contract address to pass here
  const requestorABI = require("./ABI/RequestAbi.json");
  const requestorcontractAddr = process.env.REQUESTOR_CONTRACT;
  //xdccd0e6a033218df7ec906cbf3d48cf99fd19f33f5

  //Defining requestContract
  const requestContract = new xdc3.eth.Contract(requestorABI, requestorcontractAddr);

  const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
  const nonce = await xdc3.eth.getTransactionCount(account.address);
  const gasPrice = await xdc3.eth.getGasPrice();
  console.log("gasPrice", gasPrice)

  const tx = {
    nonce: nonce,
    data: requestContract.methods.requestEthereumPrice(process.env.ORACLE_CONTRACT,jobId, coin, market).encodeABI(),
    gasPrice: gasPrice,
    to: process.env.REQUESTOR_CONTRACT,   // Requestor contract address
    from: account.address,
  };

  // console.log("Transaction", tx);

  const gasLimit = await xdc3.eth.estimateGas(tx);
  console.log("gasLimit", gasLimit); 

  tx["gasLimit"] = gasLimit;

  const signed = await xdc3.eth.accounts.signTransaction(
    tx,
    deployed_private_key
  );

  const txt = await xdc3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("receipt", console.log);
  request = h.decodeRunRequest(txt.logs[3]);
  console.log("request has been sent. request id :=" + request.id, request.data.toString("utf-8"))
  console.log("web3.hexToString()",xdc3.eth.toString(request.data))
  const data = request.data.toString("utf-8");

  // let data = 0
  // let timer = 0
  // while (data == 0) {
  //   data = await requestContract.methods.getRequestResult(request.id)
  //   if (data != 0) {
  //     console.log("Request is fulfilled. data := " + data)
  //   }
  //   sleep(1000);
  //   timer = timer + 1;
  //   console.log("waiting for " + timer + " second")
  // }

}

main().catch(e => console.error(e));
