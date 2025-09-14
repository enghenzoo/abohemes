const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

require("dotenv").config();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://talgtna.techno-pro.site",
  ],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static("public"));
app.use(cors(corsOptions));

app.use("/talgtna/api", require("./routes/Index.route"));
app.use("/talgtna/api/company", require("./routes/Companies.route"));
app.use("/talgtna/api/products", require("./routes/Products.route"));
app.use("/talgtna/api/category", require("./routes/Categories.route"));
app.use("/talgtna/api/order", require("./routes/Orders.route"));
app.use("/talgtna/api/user", require("./routes/Users.route"));
app.use("/talgtna/api/admin", require("./routes/Admins.route"));
app.use("/talgtna/api/discount", require("./routes/Discount.route"));

app.get("*", (req, res, next) => {
  if (req.path.includes("api")) {
    return next();
  }

  if (req.path.startsWith("/")) {
    return res.sendFile(
      path.resolve(
        __dirname,
        "..",
        "public",
        "talgtna",
        "frontend",
        "index.html"
      )
    );
  }
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
