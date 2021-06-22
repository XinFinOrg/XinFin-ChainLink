# Xinfin Network + Chainlink: Authenticated API Data pull from Vinterapi.com

Demonstrating how to connect Xinfin Network and Chainlink together, and thus bringing the world of oracles to Xinfin Network. This is a simple demonstration of how to use an [external initiator](https://github.com/smartcontractkit/chainlink/wiki/External-Initiators) (EI) and [external adapter](https://github.com/smartcontractkit/chainlink/wiki/External-Adapters) (EA) that allows for an external Authenticated API to pull the data and write on-chain through smart contract.

There are two main implications:

1. The connection of Chainlink to Xinfin Network allows for the growth of all types of oracles on Xinfin Network to power exchanges, other oracle needs, and bridge Web2 technology with Web3.

2. Automating the process by including the CRON so that it updates the price value periodically

## Setup Steps

Generalized setup steps for the configuration of Chainlink components - more details are provided for connecting the various pieces together. 

Please see 
[Chainlink](https://docs.chain.link/docs)
[XinFin](https://howto.xinfin.org//) documentation if more details on configuration and setup are needed.

### Steps to be done If you want to try this locally
1) Setup & Run Chainlink Node in local system
2) Download and Setup Customized External Initiator in local system using this link(External Initiator)
3) Deploy Contracts in Apothem Network
3a) Deploy LinkToken.sol in "Apothem" network
3b) Deploy Oracle.sol in "Apothem" network by overriding the Link contract address
4) Run SetfulfillmentPermission of your chainlink node address in Oracle 
5) Deploy XinfinVinterClient.sol in "Apothem" network
6) Fund your "XinfinVinterClient" contract address with LINK token
7) Go to Chainlink GUI 
7a) Create a bridge to connect external adapter
7b) Create a job spec with Oracle address - It will result JOB ID
7c) Copy this JOB_ID and feed this in  .env file in API_AccessRequest folder 
8) Fund your chainlink node address(regular) with enough XDC & LINK token
9) Execute VinterAPI_Adapter and keep listening for events 
10) Trigger "Request.js" file to register the request

Before configuring the Chainlink components, there needs to be an oracle contract on the Xinfin Network that emits events. This is needed for the EI(External Initiator) to trigger job runs on the Chainlink node.

### 1) Setup & Run Chainlink Node in local system

This step involves running a Chainlink node baremetal as specified in the [developer documentation](https://docs.chain.link/docs/running-a-chainlink-node). Below is a sample `.env` file that should be included in the `\.chainlink*` folder.  

```
export ETH_CHAIN_ID=51
export ETH_URL=wss://ws.apothem.network
export MIN_OUTGOING_CONFIRMATIONS=2
export LINK_CONTRACT_ADDRESS=0x0b3a3769109f17af9d3b2fa52832b50d600a9b1a
export CHAINLINK_TLS_PORT=0
export SECURE_COOKIES=false
export ALLOW_ORIGINS=*
export DATABASE_TIMEOUT=0
export FEATURE_EXTERNAL_INITIATORS=true
export CHAINLINK_DEV=true
export DATABASE_URL=postgresql://127.0.0.1:5432/chainlink_db_5?sslmode=disable
```

Then the following command is run (_note: may be different depending on folder configuration_)


```
cd ~/.chainlink
make install ( first time or whenever you make some changes) ==> this step will take some time so pls be patient
chainlink node start
```
Note: Before you run "chainlink node start" - apply this line of changes in following file

core -> services -> bulletprooftxmanager -> types.go after line number 200 

Override this If block 
```
	  if err := json.Unmarshal(msg.Result[:], &rawEvents); err != nil {
			logger.Error("unmarshal:", err)
			return nil, false
		}
```
with

```
	actualValue := string(input[:])
	modifiedValue := strings.ReplaceAll(actualValue,"xdc","0x")
	toSendData := []byte(modifiedValue)

	if err := json.Unmarshal(toSendData, &dec); err != nil {
		return errors.Wrap(err, "could not unmarshal receipt")
	}
```

Basically, we have to replace xdc prefix value to acceptable 0x value in address field.


During setup, a node password and a username/password is required for setup. The node password is used each time the node is started. The username/password is used for accessing the node UI at `http://localhost:6688` and for other parts of setup. So do not forget this password, if you forgot, then you hve to redo the chainlink node setup from beginning.

### 2) Download and Setup Customized External Initiator in local system using this link(External Initiator)

External initiators observe a blockchain node endpoint and will trigger runs on the Chainlink node.  
_Note: Prerequisite for Go to be installed. See [here](https://golang.org/doc/install) for instructions._

Clone and build the [external initiator repository](https://github.com/XinFinOrg/Xinfin-External-Initiator/tree/master) 

```
git clone https://github.com/XinFinOrg/Xinfin-External-Initiator
git checkout master
cd external-initiator
go install
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

1. Once you run "Chainlink node start" and your chainlink is in running mode, then open a new terminal and type `chainlink admin login` and the username/password from when the container is created.
1. To create the keys, `chainlink initiators create <NAME> <URL>`. Note that in this case the name is `xdc` and the url is `http://localhost:8080/jobs` to access the locally run external-initiator (otherwise, they are on two different networks). The 4 keys are generated in the same order as listed above.

The external initiator can be started up using:

```
./external-initiator "{\"name\":\"xinfin-testnet\",\"type\":\"xinfin\",\"url\":\"https://rpc.apothem.network\"}" --chainlinkurl "http://localhost:6688/"
```

### 3) Deploy Contracts in Apothem Network

#### 3a) Deploy LinkToken.sol in "Apothem" network

do download this repo and do the following

```
git clone https://github.com/XinFinOrg/XinFin-ChainLink.git
cd Xinfin-Chainlink
```

copy LinkToken.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and xinpay wallet is connected. Once deployed, copy the contract address - > this is going to be the key address for all the steps. This address has to be overriden in .env before you run chainlink node using -> LINK_CONTRACT_ADDRESS paramater

#### 3b) Deploy Oracle.sol in "Apothem" network by overriding the Link contract address

copy Oracle.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and xinpay wallet is connected. Deploy Oracle by overriding LINK Token address which you got from step 3a) -- Once deployed, copy the contract address - > this is going to be the oracle address which will be overriden while you deploy Vinter contract - so keep it safe

Note: Create one .env file under "API_AccessRequest folder" and keep tracking these 

```
PRIVATE_KEY=
ACCOUNT_ADDRESS=
LINK_TOKEN=
ORACLE_CONTRACT=
REQUESTOR_CONTRACT=
JOB_ID=

```

| Key                        | Description                                                                                | Example                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `PRIVATE_KEY`              | Private key of your xinpay wallet                                                      | `asdfasdfasd23sdfdsfasdfsadfasdfasdfasdfasdfasdfasdfds`                                                             |
| `ACCOUNT_ADDRESS`           | you can get this from your Chainlin GUI - Go to Keys section and find regular address  | `0x7890A8F19D5ec056729e1447fd334990d5fA9ceb`                         |
| `LINK_TOKEN`          | Link token contract address that you received from step #3a                                   | `0x0b3a3769109f17af9d3b2fa52832b50d600a9b1a`                                            |
| `ORACLE_CONTRACT`          | Oracle Contract addrss that you received from step #3b         | `0xac01be7848651fbc7a9f3e8b72f9d47a0f4ceb47`                                 |
| `REQUESTOR_CONTRACT`             | Vinter API contract address that you received from step #5a        | `0x045687b5eda47d9c38d2ce79d35f3179b43f2f37` |
| `JOB_ID`          | Job ID that you received from step #8a | `0b7d4a293bff4baf8de852bfa1f1f78a`                                 |


### 4) Run SetfulfillmentPermission of your chainlink node address in Oracle 

Copy the "Account_address" from chainlink GUi under Key sections, you will find "regular" account. This address basically talks to Oracle contract. To enable this, we need to run "Oracle.js" from API_AccessRequest folder

- Make sure that you have overriden Oracle contract address & Account Address in .env file

```
cd API_AccessRequest
node Oracle.js
```

This step, will perform "setfulfilmentpermission" method and set the flag to "True", after this step your chainlink node can connect with Oracle and do proper handshaking.

### 5) Deploy XinfinVinterClient.sol in "Apothem" network

copy XinfinVinterClient.sol from contracts folder and do the deployment using remix IDE - https://remix.xinfin.network/

Make sure, you have "Injected web3" and xinpay wallet is connected. Deploy Contract by overriding LINK Token address which you got from step 3a) -- Once deployed, copy the contract address - > this is going to be the requester address which will be overriden in .env file under -> REQUESTOR_CONTRACT paramaeter

### 6) Fund your "XinfinVinterClient" contract address with LINK token

Make sure you fund your contract address with enough LINK token - This is key step, without which you will not be able to trigger requestPrice function - it will throw Json-RPC error. So keep this in mind and dont skip it.

### 7) Create Bridge & Job Spec in Chainlink GUI

#### 7a) Create a bridge to register the "External adapter"

- Login chainlink UI using the email ID & Password which you have setup during chainlink node setup
- Go to Bridge section
  - Give a name(user defined) for ex - cyrptoprice
  - Give a URL and it should be http://localhost:5000

once done, save this and you should be good.

#### 7b) Create a Job ID using following job spec

- Login chainlink UI using the email ID & Password which you have setup during chainlink node setup
- Go to Job section
  - Click "New Job" and copy paste the following job spec

```
{
  "initiators": [
    {
      "type": "external",
      "params": {
        "name": "xdcnew",
        "body": {
          "endpoint": "xinfin-testnet",
          "addresses": ["0xac01be7848651fbc7a9f3e8b72f9d47a0f4ceb47"]
        }
      }
    }
  ],
  "tasks": [
    {
      "type": "cryptoprice"
    },
    {
      "type": "copy",
        "params": {
        "copyPath": [
          "result"
        ]
      }
    },
    {
      "type": "multiply"
    },
    {
      "type": "ethuint256"
    },
    {
       "type": "EthTx"
    }
  ]
}

```

The initiators set the contract address that triggers the Chainlink node to initiate a specific job, while tasks defines the work pipeline for this job. Note that the parameter “address: 0xac01be7848651fbc7a9f3e8b72f9d47a0f4ceb47" indicates that the node will only listen to that address for the job ID, which should be updated with the deployed Oracle contract address properly.

For example, the “tasks” define that the Chainlink node will first retrieve data from the external adapter "cryptoprice" (i.e., the Bridge will interact with the URL endpoint of external adapter to access the data in JSON format), copy the data field, multiply it by 100, and convert it into uint256 type.
The new Job can be found in the Tab of “Jobs” as below. 

once done, save this and you should be get a job ID in this format  --> 8cbc3e6ceed04d5b9a7591374325b640

#### 7c) Copy this JOB_ID and feed this in  .env file in API_AccessRequest folder 

This job id should be overriden in .env file. Everytime, you creates a new job, that has to be overriden in .env file. Since this job Id & Oracle is tightly coupled which bridge the pipeline.

### 8) Fund your chainlink node address(regular) with enough XDC & LINK token

Fund your chainlink node address (Regular) with enough XDC & LINK token. Once you transfer enough token and XDC, you will be able to see the balances in Chainlink GUI under Key Sections.

### 9) Execute VinterAPI_Adapter and keep listening for events 

External adapters are provided in the [VinterAPI_Adapter](./VinterAPI_Adapter) folder. They are simple servers built using Express that receives a post API call from the Chainlink node and sends the information to the smart contract on Xinfin Network.

It requires a `.env` file in the folder that contain:  

```
API_KEY=APIkey of vinterapi.com
```

```
cd VinterAPI_Adapter
yarn
yarn start
```

Don't forget to install packages with `yarn` and then start the servers with `yarn start`. The external servers will start on `http://localhost:5000`

| Bridge Name    | Endpoint                     | Functionality                          |
| -------------- | ---------------------------- | -------------------------------------- |
| `cryptoprice`    | http://localhost:5000       | Sending transaction to Xinfin Network  |

### 10) Trigger "Request.js" file to register the request

Now it is time to trigger the request and register our requestPrice. Before you do so, please

```
cd API_AccessRequest
yarn add "xdc3"
yarn add "chainlink-test-helpers"
yarn start
node Request.js
```

Note: 
- Make sure, you have proper values set in .env file in this folder. 

Once the above step is successful, you will be able to see the job is triggered in Chianlink UI and task will be succesfully writing price on blockchain.
