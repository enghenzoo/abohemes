const jwt = require("jsonwebtoken");
const Users = require("../models/Users.model");
const Discount = require("../models/Discount.model");

function UserId(token) {
  const user = jwt.verify(token, process.env.SECRET_KEY);
  return user.id;
}

module.exports = {
  UserId,
};
