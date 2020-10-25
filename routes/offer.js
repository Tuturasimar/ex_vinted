const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dt64ugeka",
  api_key: "623752297424679",
  api_secret: "2K2TOxV_pfhsnDrm3qPbwC2Q3fU",
});
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.user);
    // const token = req.headers.authorization.replace("Bearer ", "");
    // const user = await User.findOne({ token: token });
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });
    let pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(pictureToUpload, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    newOffer.product_image = result;
    await newOffer.save();

    // const finalOffer = await Offer.find().populate("owner");
    res.json({ newOffer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let page;
    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = Number(req.query.limit);

    const offers = await Offer.find(filters)
      .select("product_name product_price")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.find({ _id: req.params.id }).populate("owner");
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
