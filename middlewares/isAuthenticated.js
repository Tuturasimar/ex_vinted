const isAuthenticated = async (req, res, next) => {
  const User = require("../models/User");
  const Offer = require("../models/Offer");

  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token }).select("account _id");

    if (!user) {
      return res.json({ message: "Unauthorized" });
    } else {
      req.user = user;
      // console.log(req.user);
      return next();
    }
  } else {
    return res.json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
