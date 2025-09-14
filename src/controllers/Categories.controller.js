const Offers = require("../models/Offers.model");
const Products = require("../models/Products.model");
const UserId = require("../utils/getUserId");

const ProductByCategory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    let id;

    if (token) {
      id = UserId.UserId(token);
    }

    const name = req.params.name;

    const offers = await Offers.getAll();
    const products = await new Products({
      category: name,
      user: id,
    }).byCategory();

    res.json({
      offers: offers,
      products: products.products,
      favorites: products.favorites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  ProductByCategory,
};
