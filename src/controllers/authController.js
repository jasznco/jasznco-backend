const User = require('@models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const response = require("../../responses");
const Verification = require('@models/verification');
const userHelper = require("../helper/user");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 8 characters long' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      await newUser.save();

      const userResponse = await User.findById(newUser._id).select('-password');

      res
        .status(201)
        .json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  getUser: async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

sendOTP: async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return response.badReq(res, { message: "Email does not exist." });
    }

    // Combine first and last name from request
    const fullNameFromRequest = `${firstName} ${lastName}`.trim().toLowerCase();
    const fullNameFromDB = user.name?.trim().toLowerCase();

    if (fullNameFromRequest !== fullNameFromDB) {
      return response.badReq(res, { message: "Name and email do not match our records." });
    }

    // OTP logic
    const ran_otp = '0000'; // temporary static OTP

    const ver = new Verification({
      email: email,
      user: user._id,
      otp: ran_otp,
      expiration_at: userHelper.getDatewithAddedMinutes(5),
    });

    await ver.save();

    const token = await userHelper.encode(ver._id);

    return response.ok(res, { message: "OTP sent.", token });

  } catch (error) {
    return response.error(res, error);
  }
},


  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "OTP and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp?.verified) {
        return response?.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed ! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  
};
