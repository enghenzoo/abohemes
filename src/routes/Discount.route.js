const express = require("express");
const router = express.Router();
const controller = require("../controllers/Discount.controller");

router.post("/", controller.getDiscount);

module.exports = router;
