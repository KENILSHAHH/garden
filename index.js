/** @format */

import {
  BitcoinNetwork,
  BitcoinWallet,
  BitcoinProvider,
  EVMWallet,
} from '@catalogfi/wallets';
import {
  Orderbook,
  Chains,
  Assets,
  Actions,
  parseStatus,
  TESTNET_ORDERBOOK_API,
} from '@gardenfi/orderbook';
import { GardenJS } from '@gardenfi/core';
import UnifiedBridge from './UnifiedBridge.js';
import { JsonRpcProvider, Wallet } from 'ethers';

// Option 1: Create a bitcoin wallet from a private key
// const bitcoinWallet = BitcoinWallet.fromPrivateKey(
//   '',
//   new BitcoinProvider(BitcoinNetwork.Testnet)
// );

// Option 2: Create a bitcoin wallet from a WIF key
const bitcoinWallet = BitcoinWallet.fromWIF(
  'cSMmMk6YmV6qHjR7Zbn8FCBXYcRk2xJ5dpmQYYQa5DswbKNZYu9W',
  new BitcoinProvider(BitcoinNetwork.Testnet)
);

// create your evm wallet
const signer = new Wallet(
  'a1fd1aaafec01bd86ea80ccbe856168b2ecdd7ead53c764ac6e1f7ff4864452e',
  new JsonRpcProvider(
    'https://eth-sepolia.g.alchemy.com/v2/BQyVin0-QGVGoRC5NbfS892zybhRshxY'
  )
);
const evmWallet = new EVMWallet(signer);

(async () => {
  const orderbook = await Orderbook.init({
    url: TESTNET_ORDERBOOK_API, // add this line only for testnet
    signer,
  });

  const wallets = {
    [Chains.bitcoin_testnet]: bitcoinWallet,
    [Chains.ethereum_sepolia]: evmWallet,
  };

  const garden = new GardenJS(orderbook, wallets);

  const sendAmount = 0.0001 * 1e8;
  const receiveAmount = (1 - 0.3 / 100) * sendAmount;

  const orderId = await garden.swap(
    Assets.bitcoin_testnet.BTC,
    Assets.ethereum_sepolia.WBTC,
    sendAmount,
    receiveAmount
  );

  garden.subscribeOrders(await evmWallet.getAddress(), async (orders) => {
    const order = orders.filter((order) => order.ID === orderId)[0];
    if (!order) return;

    const action = parseStatus(order);

    if (
      action === Actions.UserCanInitiate ||
      action === Actions.UserCanRedeem
    ) {
      const swapper = garden.getSwap(order);
        const swapOutput = await swapper.next();
        if (swapOutput.action == 'Redeem') {
                setTimeout(async () => {

            const contract = new ethers.Contract(
              '0x528e26b25a34a4a5d0dbda1d57d318153d2ed582',
              UnifiedBridge,
              evmWallet
            );
            const txn = await contract.bridgeAsset(
              1,
              '0xAA6C32B4C3B869201A3e162F24bBe37BCacB02D9',
              100000n,
              '0xaD9d14CA82d9BF97fFf745fFC7d48172A1c0969E',
              forceUpdateGlobalExitRoot,
              '0x'
            );
                    console.log(txn)
                        }, 60000);

          }
      console.log(
        `Completed Action ${swapOutput.action} with transaction hash: ${swapOutput.output}`
      );
    }
  });
  
})();

