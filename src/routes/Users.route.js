const express = require("express");
const router = express.Router();
const controller = require("../controllers/Users.controller");

router.post("/fav", controller.AddToFav);
router.delete("/fav", controller.RemoveFromFav);
router.get("/favorites", controller.GetFavorites);
router.get("/coupons", controller.GetCoupons);
router.get("/get", controller.GetUserData);
router.post("/create", controller.CreateUser);

module.exports = router;
