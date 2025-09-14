const express = require("express");
const router = express.Router();
const controller = require("../controllers/Company.controller");

router.get("/:name", controller.CompanyByName);

module.exports = router;
