const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { publicAddress, email } = req.body;
    const user = await User.findOne({ publicAddress });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.email = email;
    await user.save();

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginWithWallet = async (req, res) => {
  try {
    const { publicAddress } = req.body;
    let alreadySigned = false;
    if (!publicAddress) {
      return res.status(400).json({ message: 'Public address is required.' });
    }

    let user = await User.findOne({ publicAddress });

    if (!user) {
      user = new User({ publicAddress });
      await user.save();
    } else {
      if(user.email) {
        alreadySigned = true;
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Authentication with wallet was successful', token, userId: user._id , alreadySigned});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
