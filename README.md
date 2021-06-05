# Xinfin Network + Chainlink: Authenticated API Data pull

Demonstrating how to connect Xinfin Network and Chainlink together, and thus bringing the world of oracles to Xinfin Network. This is a simple demonstration of how to use an [external initiator](https://github.com/smartcontractkit/chainlink/wiki/External-Initiators) (EI) and [external adapter](https://github.com/smartcontractkit/chainlink/wiki/External-Adapters) (EA) that allows for an external Authenticated API to pull the data and write on-chain through smart contract.

There are two main implications:

1. The connection of Chainlink to Xinfin Network allows for the growth of all types of oracles on Xinfin Network to power exchanges, other oracle needs, and bridge Web2 technology with Web3.

## Setup Steps

Generalized setup steps for the configuration of Chainlink components - more details are provided for connecting the various pieces together. 

Please see 
[Chainlink](https://docs.chain.link/docs)
[XinFin](https://howto.xinfin.org//) documentation if more details on configuration and setup are needed.

Before configuring the Chainlink components, there needs to be an oracle contract on the Xinfin Network that emits events. This is needed for the EI(External Initiator) to trigger job runs on the Chainlink node. See the [API_AccessRequest](./API_AccessRequest) folder for code to interact with the Xinfin Network.

### Running a Chainlink Node

This step involves running a Chainlink node from a docker container as specified in the [developer documentation](https://docs.chain.link/docs/running-a-chainlink-node). Below is a sample `.env` file that should be included in the `\.chainlink*` folder.  
_Note: An ETH client URL is not required_

```
ROOT=/chainlink
LOG_LEVEL=debug
ETH_CHAIN_ID=3
MIN_OUTGOING_CONFIRMATIONS=2
LINK_CONTRACT_ADDRESS=0x20fe562d797a42dcb3399062ae9546cd06f63280
CHAINLINK_TLS_PORT=0
SECURE_COOKIES=false
ALLOW_ORIGINS=*
DATABASE_TIMEOUT=0
DATABASE_URL=postgresql://$USERNAME:$PASSWORD@$SERVER:$PORT/$DATABASE
ETH_DISABLED=true
FEATURE_EXTERNAL_INITIATORS=true
CHAINLINK_DEV=true
```

Then the following command is run (_note: may be different depending on folder configuration_)

```
cd ~/.chainlink-ropsten && docker run -p 6688:6688 -v ~/.chainlink-ropsten:/chainlink -it --env-file=.env smartcontract/chainlink local n
```

During setup, a node password and a username/password is required for setup. The node password is used each time the node is started. The username/password is used for accessing the node UI at `http://localhost:6688` and for other parts of setup.

### Setting Up an External Initiator

External initiators observe a blockchain node endpoint and will trigger runs on the Chainlink node.  
_Note: Prerequisite for Go to be installed. See [here](https://golang.org/doc/install) for instructions._

Clone and build the [external initiator repository](https://github.com/smartcontractkit/external-initiator) 
```
git clone https://github.com/smartcontractkit/external-initiator
cd external-initiator
go build
```

Create a `.env` file in the `external-initiator` folder with the following contents:

```
EI_DATABASEURL=postgresql://$USERNAME:$PASSWORD@$SERVER:$PORT/$DATABASE
EI_CHAINLINKURL=http://localhost:6688
EI_IC_ACCESSKEY=<INSERT KEY>
EI_IC_SECRET=<INSERT KEY>
EI_CI_ACCESSKEY=<INSERT KEY>
EI_CI_SECRET=<INSERT KEY>
```

_Note: the database URL should be separate from the Chainlink node database_

The 4 keys in the `external-initiator/.env` file are generated by the Chainlink node with the following process. [Link](https://docs.chain.link/docs/miscellaneous) to more Chainlink/Docker documentation.

1. Use `docker ps` and obtain the container ID for the Chainlink node. To access the command line within the container, use `docker exec -it <containerID> /bin/bash`.
1. Once inside the container, log in using `chainlink admin login` and the username/password from when the container is created.
1. To create the keys, `chainlink initiators create <NAME> <URL>`. Note that in this case the name is `xdc` and the url is `http://172.17.0.1:8080/jobs` to access the locally run external-initiator using the docker container gateway. (otherwise, they are on two different networks). The 4 keys are generated in the same order as listed above.

The external initiator can be started up using:

```
./external-initiator "{\"name\":\"xinfin-testnet\",\"type\":\"ethererum\",\"url\":\"https://rpc.apothem.network\"}" --chainlinkurl "http://localhost:6688/"
```

Where the url can be changed to the respective endpoint. In this case, it is pointed at the public Xinfin Network testnet endpoint. For reliability purposes, do not use this in production; it is much more reliable to connect to a non-public endpoint.

### Creating a Bridge for an External Adapter

Two simple external adapters are provided in the [Xinfin_externalAdapter](./Xinfin_externalAdapter) folder. They are simple servers built using Express that receives a post API call from the Chainlink node and sends the information to the smart contract on Xinfin Network.

It requires a `.env` file in the folder that contain:  
For `API_externalAdapter`:

```
PRIVATE_KEY=<ACCOUNT PRIVATE KEY>
```

The private key is the private key to an address that allows the external adapter to send transactions to Xinfin Network.

Don't forget to install packages with `yarn` and then start the servers with `yarn start`. The external servers will start on `http://localhost:5001` for the `API_externalAdapter`. Additionally, the bridges should be created using `http://172.17.0.1` to access the local network from the containerized Chainlink node or  `http://localhost` if it is baremetal execution.

In order to connect the two external adapters, three bridges were used.

| Bridge Name    | Endpoint                     | Functionality                          |
| -------------- | ---------------------------- | -------------------------------------- |
| `xdcSendTx`    | http://172.17.0.1:5001       | Sending transaction to Xinfin Network  |

### Connecting Everything Together

In order to create the necessary connections between the various components (Xinfin Network, Chainlink node, EI, EA, and Auth API), two job runs on the node need to be created. This can be done by accessing the node via the `localhost:6688` address and logging in.

The first job spec is for connecting the external initiator and can be found [here](./jobSpecs/externalInitiator.json).

```
{
  "initiators": [
    {
      "type": "external",
      "params": {
        "name": "xdc",
        "body": {
          "endpoint": "xinfin-testnet",
          "addresses": ["0x8ac6bf0700ed41d1323a1f9c16d85d76f1196cdb"]
        }
      }
    }
  ],
  "tasks": [
    {"type": "xdcSendTx"}
  ]
}

Gitbook Link - https://lokeshwaran-a82.gitbook.io/xinfin/step-by-step-guide-complete-flow-xinfin-network-+-chainlink-authenticated-api-data-execution