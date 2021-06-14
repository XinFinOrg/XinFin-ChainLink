const Xdc3 = require("xdc3");

const xdc3 = new Xdc3(
  new Xdc3.providers.HttpProvider("https://rpc.apothem.network")
);

async function getRevertReason(txHash) {
  const tx = await xdc3.eth.getTransaction(txHash);
  xdc3.eth
    .call(tx)
    .then((x) => {
      const other = x.replace("0x", "").slice(8);
      const buf = Buffer.from(other, "hex");
      console.log("Error is ", buf.toString());
    })
    .catch(console.log);
}

getRevertReason("0x690598b7aedadb4a9dea3da808e870050af4050b3fbdfb708db851030309a692")
