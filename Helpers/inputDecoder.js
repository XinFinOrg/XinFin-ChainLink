const Xdc3 = require("xdc3");
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(`../API_AccessRequest/ABI/RequestAbi.json`);

const xdc3 = new Xdc3(
  new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
);
async function inputDecoder(txHash) {
  const tx = await xdc3.eth.getTransaction(txHash, (error, txResult) => {
    const result = decoder.decodeData(txResult.input);
    console.log(result);
  });
  // const input = xdc3.utils.toAscii(tx.input)
  // console.log(input)
}

inputDecoder("0x9d0e06e9adbbe07bf55b9c58fb126578b78db293dc7933da87fc75c3faa9c1b8")
