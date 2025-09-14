const Discount = require("../models/Discount.model");
const UserId = require("../utils/getUserId");

const getDiscount = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(500).send("Internal Server Error");
      return;
    }

    const id = UserId.UserId(token);
    const discount = await new Discount({
      user: id,
      code: req.body.code,
    }).get();

    res.json({ discount: discount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getDiscount,
};
