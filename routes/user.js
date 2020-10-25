const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const oldMail = await User.findOne({ email: req.fields.email });
    // console.log(oldMail);
    if (oldMail === null) {
      if (req.fields.username) {
        const { email, username, phone, password } = req.fields;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        const newUser = new User({
          email,
          account: {
            username,
            phone,
          },
          token,
          salt,
          hash,
        });

        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          email: email,
          account: newUser.account,
          token: newUser.token,
        });
      } else {
        res.status(400).json({ message: "Username required" });
      }
    } else {
      res.status(400).json({ message: "Email already used" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const login = await User.findOne({ email: email });
    const newHash = SHA256(password + login.salt).toString(encBase64);
    if (login.hash === newHash) {
      res.status(200).json({
        _id: login._id,
        token: login.token,
        account: login.account,
      });
    } else {
      res.status(400).json({ message: "Wrong password/email" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
