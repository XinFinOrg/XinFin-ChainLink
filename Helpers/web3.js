var Web3 = require('web3');
const getRevertReason = require('eth-revert-reason')


// Call from the context of a previous block with a custom provider
let txHash = '0x44abbba82a03302a204d861778103dc5f7013f576f072d1e02818dc9c0dbd705'
let network = 'apothem'
let blockNumber = 19585783
let provider = getAlchemyProvider(network) // NOTE: getAlchemyProvider is not exposed in this package

const test = async() => {
    console.log(await getRevertReason(txHash, network, blockNumber, provider));
}

test();

var web3 = new Web3(Web3.givenProvider || 'wss://ws.apothem.network');
console.log("Web3",web3)
const txt = web3.eth.abi.decodeParameter('uint256', '0x00000000000000000000000000000000000000000000000000000000000009a2');
console.log("txt",txt)

var receipt = web3.eth.getTransactionReceipt('0x8743adb11c688c7422a1a3741c675d81b163434df1151d65f4c96ab773fae1dc')
.then(console.log);