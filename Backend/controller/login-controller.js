const User = require('../Model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userField = await User.findOne({ username });
    if (!userField) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, userField.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = jwt.sign(
      { userId: userField._id,
      username: userField.username },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } 
    );

    // 4. Send response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: userField._id,
        username: userField.username,
        email: userField.email,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

module.exports = login;
