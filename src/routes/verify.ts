import {
  Router,
  json
} from 'express';
import { Web3 } from 'web3';
import {
  getBench32AddressFromPoint,
  BitcoinNetwork,
  getXRPLAddressfromPoint,
  ethAddressFromPoint
} from '../utils';
import {
  abi
} from './ABI';
const axios = require('axios');

const fetch = require('node-fetch');


const router = Router();
router.use(json());

type Network = 'eth-sepolia' | 'polygon-mumbai' | 'avalanche-fuji';
interface VerifyPayload {
  network: Network;
  proofid: string;
}

async function getNFTData(network: Network, proofid: string) {
  console.log(proofid);
  const rpcUrls = {
    'eth-sepolia': 'https://eth-sepolia.g.alchemy.com/v2/BS5hSVL2MXlbIl0VTnK4MCRqFSZLcMg-',
    'polygon-mumbai': 'https://endpoints.omniatech.io/v1/matic/mumbai/public',
    'avalanche-fuji': 'https://proportionate-nameless-bird.avalanche-testnet.quiknode.pro/6a2058121ba0542b0acaba2e839dd42254502214/ext/bc/C/rpc/'
  };

  const contractsAddresses = {
    'eth-sepolia': '0x5Bb6081495D55a29c362A9118Be4169af80cbC0D',
    'polygon-mumbai': '0x3130b9eD06aafB77aB90bAFb0986E22a764dE361',
    'avalanche-fuji': '0x4Bb15eE8545113af112Db1b02b85ACEc918E0aF7'
  };

  // Check for required fields in payload
  if (!proofid || !network) {
    throw new Error('Missing required fields');
  }

  // Select the correct RPC URL based on the network
  const rpcUrl = rpcUrls[network];
  if (!rpcUrl) {
    throw new Error('Unsupported network');
  }

  // Initialize Web3js with the selected network
  const web3 = new Web3(rpcUrl);
  const tokenURIAbi = [{
    inputs: [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    name: "tokenURI",
    outputs: [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  }] as const;
  const contract = new web3.eth.Contract(tokenURIAbi, contractsAddresses[network]);

  // Query NFT URI
  try {
    const uri = await contract.methods.tokenURI(proofid).call();
    console.log("uri", uri.toString());
    const ipfsGatewayUrl = `https://ipfs.io/ipfs/${uri}`;
    const response = await fetch(ipfsGatewayUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json(); // or .text() if it's not JSON
    return data;
  } catch (err) {
    console.log(err);
    throw new Error('Invalid token ID');
  }
}

function getRingFromNetwork(networkCoin: string, ring: bigint[]) {
  let ringAddresses: string[] = [];
  if (networkCoin === 'XRP') {
    for (let i = 0; i < ring.length; i = i + 2) {
      const address = getXRPLAddressfromPoint([ring[i], ring[i + 1]]);
      ringAddresses.push(address);

    }
  }
  if (networkCoin === 'ETH' || networkCoin === 'MATIC' || networkCoin === 'AVAX' || networkCoin === 'ZkEVM') {
    for (let i = 0; i < ring.length; i = i + 2) {
      const address = ethAddressFromPoint([ring[i], ring[i + 1]]);
      ringAddresses.push(address);

    }
  }
  if (networkCoin === 'BTC') {
    for (let i = 0; i < ring.length; i = i + 2) {
      const address = getBench32AddressFromPoint([ring[i], ring[i + 1]], BitcoinNetwork.TESTNET);
      ringAddresses.push(address);

    }
  }
  return ringAddresses;
}

async function checkRingBalance(ring: string[], networkCoin: string, treshold: number) {

  if (networkCoin === 'XRP') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.post('https://capable-wider-energy.xrp-testnet.quiknode.pro/ba995f441637d03f2980192dbb7f7e422167bc61/', {
        method: 'account_info',
        params: [{
          account: ring[i],
          ledger_index: 'current',
          queue: true
        }]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      if (parseInt(data.result.account_data.Balance) < treshold) {
        return false;
      }
    }
  }

  if (networkCoin === 'ETH') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.get(`https://api.covalenthq.com/v1/eth-sepolia/address/${ring[i]}/balances_native/?key=cqt_rQx3B8YqQ4DmMRMJyw9rHQWRTqrx`);
      if (parseInt(response.data.data.items[0].balance) < treshold) {
        return false;
      }
    }
  }

  if (networkCoin === 'AVAX') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.get(`https://api.covalenthq.com/v1/avalanche-testnet/address/${ring[i]}/balances_native/?key=cqt_rQx3B8YqQ4DmMRMJyw9rHQWRTqrx`);
      console.log(response.data.data.items[0].balance);
      if (parseInt(response.data.data.items[0].balance) < treshold) {
        return false;
      }
    }
  }

  if (networkCoin === 'MATIC') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.get(`https://api.covalenthq.com/v1/matic-mumbai/address/${ring[i]}/balances_native/?key=cqt_rQx3B8YqQ4DmMRMJyw9rHQWRTqrx`);
      if (parseInt(response.data.data.items[0].balance) < treshold) {
        return false;
      }
    }
  }

  if (networkCoin === 'ZkEVM') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.get(`https://api.covalenthq.com/v1/polygon-zkevm-testnet/address/${ring[i]}/balances_native/?key=cqt_rQx3B8YqQ4DmMRMJyw9rHQWRTqrx`);
      if (parseInt(response.data.data.items[0].balance) < treshold) {
        return false;
      }
    }
  }


  if (networkCoin === 'BTC') {
    for (let i = 0; i < ring.length; i++) {
      const response = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${ring[i]}/balance`);
      if (parseInt(response.data.balance) < treshold) {
        return false;
      }
    }
  }
  return true;
}

router.post('/', async (req, res) => {

  try {
    const payload: VerifyPayload = req.body;
    console.log(payload);
    // Check for required fields in payload
    if (!payload.proofid || !payload.network) {
      res.status(400);
    }
    const data = await getNFTData(payload.network, payload.proofid);
    console.log(data);
    const proofObject = JSON.parse(data.proof);
    const networkValue = proofObject.network;
    const amount = parseFloat(proofObject.amount);
    const address = data.ringAddress;
    console.log(data);
    const ringBalance = await checkRingBalance(address, networkValue, amount);
    res.status(200).json({
      'validity': ringBalance,
      'threshold': amount,
      'currency': networkValue
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      'validity': false,
      'threshold': 0,
      'currency': ''
    });
  }
});

export default router;

