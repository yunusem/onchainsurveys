const User = require('../models/User');
const axios = require('axios');
const {
  CasperServiceByJsonRPC,
  CLPublicKey,
} = require("casper-js-sdk");

const clientService = new CasperServiceByJsonRPC("http://3.136.227.9:7777/rpc");

async function getAccountCreationTimestamp(clientService, publicKey) {
  try {
    const clPublicKey = CLPublicKey.fromHex(publicKey);
    const accountKey = clPublicKey.toAccountHashStr();
    let blockHeight = 1;
    let creationTimestamp = null;

    while (!creationTimestamp) {
      const blockInfo = await clientService.getBlockInfoByHeight(blockHeight);

      if (!blockInfo) {
        throw new Error('Account not found');
      }
      const blockRoot = await clientService.getStateRootHash(blockInfo.block.hash);
      const accountInfo = await clientService.getBlockState(blockRoot, accountKey, []);

      if (accountInfo && accountInfo.Account) {
        creationTimestamp = blockInfo.block.header.timestamp;
      } else {
        blockHeight++;
      }
    }
    return creationTimestamp;
  } catch (error) {
    console.error(`Error while fetching account creation timestamp: ${error.message}`);
    throw error;
  }
}

function calculateAccountAgeInHours(creationTimestamp) {
  const currentTime = Date.now();
  const creationTime = new Date(creationTimestamp).getTime();
  const ageInMilliseconds = currentTime - creationTime;
  const ageInHours = ageInMilliseconds / (1000 * 60 * 60);

  return ageInHours;
}

exports.syncUserDetail = async (req, res) => {
  const publicKey = req.headers['x-casper-public-key'];

  try {
    const user = await User.findById(req.params.userId);
    const latestBlock = await clientService.getLatestBlockInfo();
    const root = await clientService.getStateRootHash(latestBlock.block.hash);

    const balanceUref = await clientService.getAccountBalanceUrefByPublicKey(
      root,
      CLPublicKey.fromHex(publicKey)
    );
    const balance = await clientService.getAccountBalance(
      latestBlock.block.header.state_root_hash,
      balanceUref
    );

    const creationTimestamp = await getAccountCreationTimestamp(clientService, publicKey);
    const accountAgeInHours = calculateAccountAgeInHours(creationTimestamp);
    const validatorsInfo = await clientService.getValidatorsInfo();
    const bidsList = validatorsInfo.auction_state.bids;
    const isValidator = bidsList.some(validator => validator.public_key === publicKey);

    let stakedAmount = 0;

    bidsList.forEach((iterator) => {

      const delegators = iterator.bid.delegators;
      if (delegators) {
        delegators.forEach((delegator) => {

          if (delegator.public_key === publicKey) {
            stakedAmount += parseFloat(delegator.staked_amount);
          }
        });
      }
    });


    user.balance = balance.toString();
    user.accountAgeInHours = accountAgeInHours;
    user.isValidator = isValidator;
    user.stakedAmount = stakedAmount.toString();
    await user.save();
    res.status(200).json({ success: true, message: 'User successfully synced' });

  } catch (error) {
    console.error(`Error while syncing account details: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
};

const fetchCsprLiveAccountData = async (publicKey) => {
  const baseUrl = 'https://api.cspr.live/accounts/';
  const endpoint = '/extended-deploys?fields=entry_point,contract_package&limit=1';
  const url = `${baseUrl}${publicKey}${endpoint}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data.pageCount;
  } catch (error) {
    console.error('Failed to fetch data from api.cspr.live:', error);
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (user.active) {
      return res.status(200).json({ success: true, message: 'User is already active' });
    }

    if (user.attempts >= 3) {
      return res.status(201).json({ success: false, message: 'User has exceeded activation attempts, and got banned permanently' });
    }

    const pageCount = await fetchCsprLiveAccountData(user.publicAddress);

    if (pageCount >= 1) {
      user.active = true;
      await user.save();
      res.status(200).json({ success: true, message: 'User successfully activated' });
    } else {
      user.attempts += 1;
      await user.save();
      res.status(202).json({ success: false, message: 'Activation failed. Not enough activity found on-chain!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
