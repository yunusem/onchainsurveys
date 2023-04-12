const User = require('../models/User');
const axios = require('axios');

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

    if (pageCount >= 0) {
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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
