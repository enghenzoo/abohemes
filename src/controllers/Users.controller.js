const Users = require("../models/Users.model");
const Products = require("../models/Products.model");
const UserId = require("../utils/getUserId");
const jwt = require("jsonwebtoken");

const AddToFav = async (req, res) => {
  try {
    const { product_id } = req.body;

    const user = req.headers.authorization.split(" ")[1];

    if (!user) {
      res.status(500).send("Internal Server Error");
      return;
    }
    const id = UserId.UserId(user);

    const isRegister = await new Users({ id: id }).byId();

    if (!isRegister) {
      res.status(403).send("Forbidden Access");
      return;
    }

    const inFavorite = await new Products({ id: product_id }).inFavorite({
      userId: id,
    });

    if (inFavorite) {
      res.json({ success: false });
      return;
    }

    const addToFav = await new Products({ id: product_id }).addFavorite({
      userId: id,
    });

    if (!addToFav.success) {
      res.status(500).send("Internal Server Error");
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const RemoveFromFav = async (req, res) => {
  try {
    const { product_id } = req.body;

    const user = req.headers.authorization.split(" ")[1];

    if (!user) {
      res.status(500).send("Internal Server Error");
      return;
    }
    const id = UserId.UserId(user);

    const isRegister = await new Users({ id: id }).byId();

    if (!isRegister) {
      res.status(403).send("Forbidden Access");
      return;
    }

    const removeFromFav = await new Products({ id: product_id }).removeFavorite(
      {
        userId: id,
      }
    );

    if (!removeFromFav.success) {
      res.status(500).send("Internal Server Error");
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const GetFavorites = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(500).send("Internal Server Error");
      return;
    }

    const id = UserId.UserId(token);

    const products = await Products.byFavorite({ userId: id });

    res.json({
      products: products.products,
      favorites: products.favorites.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const GetCoupons = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(500).send("Internal Server Error");
      return;
    }

    const id = UserId.UserId(token);
    const coupons = await new Users({ id: id }).coupons();
    res.json({ coupons: coupons });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const GetProductToOrder = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const product = req.params.product;

    if (!token) {
      res.status(500).send("Internal Server Error");
      return;
    }

    const coins = await new Users({ id: UserId.UserId(token) }).getCoins();
    const products = await new Products({ id: product }).byId({ coins: true });

    res.json({ coins: coins.coins, product: products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const GetUserData = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await new Users({ id: UserId.UserId(token) }).getUser();
    res.json({ user: user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const CreateUser = async (req, res) => {
  try {
    const body = req.body;

    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      const user = await new Users({
        id: UserId.UserId(token),
        street: body.street,
        building: body.building,
        floor: body.floor,
        city: body.city,
      }).update();

      console.log(user);

      res.json({
        success: true,
        token: jwt.sign({ id: UserId.UserId(token) }, process.env.SECRET_KEY),
        favorites: user.favorites,
      });
      return;
    }

    const user = await new Users({
      name: body.name,
      phone: body.phone,
      spare_phone: body.spare_phone,
      street: body.street,
      building: body.building,
      floor: body.floor,
      city: body.city,
    }).add();
    console.log(user);

    res.json({
      success: true,
      token: jwt.sign({ id: user.id }, process.env.SECRET_KEY),
      favorites: user.favorites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  AddToFav,
  GetFavorites,
  GetCoupons,
  GetProductToOrder,
  GetUserData,
  CreateUser,
  RemoveFromFav,
};
