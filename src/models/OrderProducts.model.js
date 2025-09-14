const db = require("../config/database").db;

module.exports = class OrderProducts {
  constructor(orderproducts) {
    this.orderproducts = orderproducts;
  }

  async add() {
    const { order, orderproducts } = this.orderproducts;
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare(
          "INSERT INTO `OrderProducts` (`product`, `order`, `quantity`, `price_at_order`, with_coins) VALUES (?, ?, ?, ?, ?)"
        );

        for (let i = 0; i < orderproducts.products.length; i++) {
          const product = orderproducts.products[i];

          stmt.run(
            [
              product.id,
              order,
              product.quantity,
              product.price,
              product.with_coins,
            ],
            function (err) {
              if (err) reject(err);
            }
          );
        }
        stmt.finalize((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT OrderProducts.quantity, OrderProducts.`order`, OrderProducts.with_coins, Products.id, Products.name, Products.image, Products.price FROM OrderProducts INNER JOIN Products ON OrderProducts.product = Products.id WHERE OrderProducts.`order` = ?",
        [this.orderproducts.order],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  async total() {
    const sql = `SELECT price, description, name from Products WHERE id IN (${this.orderproducts.products
      .map(() => "?")
      .join(",")})`;

    const ids = this.orderproducts.products.map((item) => item.id);

    const prices = await new Promise((resolve, reject) => {
      db.all(sql, [...ids], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    let total = 0;
    let totalCoinsSpent = 0;
    const cart = [];
    for (let i = 0; i < this.orderproducts.products.length; i++) {
      cart.push({
        id: this.orderproducts.products[i].id,
        name: prices[i].name,
        quantity: this.orderproducts.products[i].quantity,
        price: prices[i].price,
        description: prices[i].description,
        with_coins: this.orderproducts.products[i].with_coins,
      });
      if (this.orderproducts.products[i].with_coins) {
        totalCoinsSpent +=
          this.orderproducts.products[i].quantity * prices[i].price;
      } else {
        total += this.orderproducts.products[i].quantity * prices[i].price;
      }
    }

    return { total, totalCoinsSpent, cart };
  }

  static async topProducts() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT SUM(quantity) as sales, SUM(quantity*price) as revenue, name FROM OrderProducts INNER JOIN Products ON OrderProducts.product = Products.id GROUP BY name ORDER BY revenue DESC LIMIT 5",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async adminOrderProducts(ids) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT OrderProducts.\`order\`, OrderProducts.quantity, OrderProducts.with_coins, Products.name, OrderProducts.price_at_order FROM OrderProducts INNER JOIN Products ON OrderProducts.product = Products.id WHERE OrderProducts.\`order\` IN (${ids
        .map(() => "?")
        .join(",")})`;
      db.all(sql, ids, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};
