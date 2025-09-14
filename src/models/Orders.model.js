const db = require("../config/database").db;
const { v4: uuidv4 } = require("uuid");
const {
  getLastMonthRange,
  getFirstDayOfCurrentMonth,
} = require("../utils/date");

module.exports = class Orders {
  constructor(order) {
    this.order = order;
  }

  async byId() {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT Orders.id, Users.name as user, Users.phone, Users.spare_phone, Users.building, Users.floor, Users.street, Orders.city, Orders.created_at, Orders.total, Orders.delivered, Orders.processing, Orders.discount, Orders.paymob_paid, Orders.method FROM `Orders` INNER JOIN Users ON Orders.user = Users.id WHERE Orders.id = ?",
        [this.order.id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  async add() {
    const { order } = this.order;

    return new Promise((resolve, reject) => {
      let id;

      if (order.id) {
        id = order.id;
      } else {
        id = uuidv4();
      }

      db.run(
        "INSERT INTO `Orders` (`id`, `user`, `delivered`, `processing`, `discount`, `method`, `total`, `created_at`, `city`, paymob_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          order.user,
          order.delivered,
          order.processing,
          JSON.stringify(order.discount),
          order.method,
          order.total,
          order.created_at,
          order.city,
          order.paymob_paid || 0,
        ],
        function (err) {
          if (err) reject(err);
          resolve({ id: id });
        }
      );
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT Orders.id, Orders.created_at, Orders.method, Orders.discount, Orders.delivered, Orders.total, Orders.processing, Orders.city FROM `Orders` WHERE Orders.user = ? LIMIT 15",
        [this.order.user],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async total({ orderId }) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT SUM(Products.price * OrderProducts.quantity) AS total_price FROM OrderProducts INNER JOIN Products ON OrderProducts.product = Products.id WHERE OrderProducts.order = ?",
        [orderId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static async numberOfOrders() {
    const { firstDay, lastDay } = getLastMonthRange();
    const currentFirstDay = getFirstDayOfCurrentMonth();

    const numberOfOrders = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) AS total_orders, (SELECT COUNT(*) FROM Orders WHERE created_at <= ? AND created_at >= ?) AS total_orders_lastmonth FROM Orders WHERE created_at >= ?",
        [lastDay, firstDay, currentFirstDay],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    const totalRevenue = await new Promise((resolve, reject) => {
      db.get(
        "SELECT SUM(total) AS total_revenue, (SELECT SUM(total) FROM Orders WHERE created_at <= ? AND created_at >= ?) AS total_revenue_lastmonth FROM Orders WHERE created_at >= ?",
        [lastDay, firstDay, currentFirstDay],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    return {
      numberOfOrders,
      totalRevenue,
    };
  }

  static async latestOrders() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT Orders.id, Users.name as customer, Orders.created_at as date, Orders.total as amount, Orders.delivered as status FROM `Orders` INNER JOIN Users ON Orders.user = Users.id ORDER BY Orders.created_at DESC LIMIT 5",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async adminOrders({ limit, search }) {
    const totalOrders = await new Promise((resolve, reject) => {
      let sql = "SELECT COUNT(*) as total FROM `Orders`";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql += " WHERE id LIKE ?";
        inputs.push("%" + search + "%");
      }

      db.get(sql, inputs, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    const OFFSET = limit - 50;
    const orders = await new Promise((resolve, reject) => {
      let sql =
        "SELECT Orders.id, Users.name as user, Users.phone, Users.spare_phone, Users.building, Users.floor, Users.street, Orders.city, Orders.created_at, Orders.total, Orders.delivered, Orders.processing, Orders.discount, Orders.paymob_paid, Orders.method FROM `Orders` INNER JOIN Users ON Orders.user = Users.id";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql += " WHERE Orders.id LIKE ?";
        inputs.push("%" + search + "%");
      }

      sql += " LIMIT ? OFFSET ?";

      inputs.push(limit, OFFSET);

      db.all(sql, inputs, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    return {
      totalOrders: totalOrders.total,
      orders,
    };
  }

  async edit() {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Orders SET delivered = ?, processing = ? WHERE id = ?`;
      db.run(
        sql,
        [this.order.delivered, this.order.processing, this.order.id],
        function (err) {
          if (err) reject(err);
          resolve({ success: true, changes: this.changes });
        }
      );
    });
  }

  static async count() {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as orders_count FROM `Orders` WHERE processing = 0",
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  async getCities() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT city, value FROM `Delivery` WHERE hidden = 0",
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  async cancel() {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM Orders WHERE id = ? AND user = ?`,
        [this.order.id, this.order.user],
        (err) => {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }
};
