const db = require("../config/database").db;
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const { getCurrentDay } = require("../utils/date");

module.exports = class Admin {
  constructor(admin) {
    this.admin = admin;
  }

  async login() {
    const { admin } = this;
    const hashedPassword = crypto
      .createHash("sha256")
      .update(admin.password)
      .digest("hex");
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM admins WHERE username = ? AND password = ?",
        [admin.username, hashedPassword],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  async updateLogin() {
    const { admin } = this;
    return new Promise((resolve, reject) => {
      const currentDate = getCurrentDay();
      db.run(
        "UPDATE admins SET login_at = ? WHERE id = ?",
        [currentDate, admin.id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static async overview() {
    return new Promise((resolve, reject) => {
      db.all(
        `WITH RECURSIVE months(date) AS (
    SELECT date('now', 'start of month', '-11 months')
    UNION ALL
    SELECT date(date, '+1 month')
    FROM months
    WHERE date < date('now', 'start of month')
)
SELECT 
    strftime('%Y-%m', months.date) AS month,
    COALESCE(SUM(Orders.total), 0) AS monthly_total
FROM months
LEFT JOIN Orders ON strftime('%Y-%m', Orders.created_at) = strftime('%Y-%m', months.date)
    AND Orders.created_at >= date('now', '-12 months') AND Orders.delivered = 1
GROUP BY strftime('%Y-%m', months.date)
ORDER BY month;`,
        [],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM `Admins`", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async add() {
    return new Promise((resolve, reject) => {
      const id = uuid();
      db.run(
        "INSERT INTO `Admins` (`id`, `username`, `password`) VALUES (?, ?, ?)",
        [id, this.admin.username, this.admin.password],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  static async getDelivery() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM `Delivery`", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async editDelivery() {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE `Delivery` SET `value` = ?, `city` = ? WHERE `id` = ?",
        [this.admin.value, this.admin.city, this.admin.id],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  async hideDelivery() {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE `Delivery` SET `hidden` = ? WHERE `id` = ?",
        [!this.admin.hidden, this.admin.id],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  async deleteDelivery() {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM `Delivery` WHERE `id` = ?",
        [this.admin.id],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  async addDelivery() {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO `Delivery` (`city`, `value`) VALUES (?, ?)",
        [this.admin.city, this.admin.value],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }
};
