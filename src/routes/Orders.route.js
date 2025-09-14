const express = require("express");
const router = express.Router();

const controller = require("../controllers/Orders.controller");

router.post("/", controller.AddOrder);
router.post("/success", controller.CompleteOrder);
router.post("/create/paymentlink", controller.GetPaymentLink);
router.post("/payment/response", controller.PaymentResponse);
router.get("/history", controller.GetOrders);
router.delete("/cancel/:id", controller.CancelOrder);

module.exports = router;
