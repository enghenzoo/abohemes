const express = require("express");
const router = express.Router();
const controller = require("../controllers/Index.controller");

router.get("/", controller.Home);
router.get("/city", controller.City);
router.post("/contact", controller.AddContact);

module.exports = router;
