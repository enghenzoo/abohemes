const db = require("../config/database").db;
const { getCurrentDay } = require("../utils/date");

module.exports = class Contact {
  constructor(contact) {
    this.contact = contact;
  }

  static async getAll({ search }) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM `Contact`";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql += " WHERE name LIKE ?";
        inputs.push("%" + search + "%");
      }

      db.all(sql, inputs, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static async delete({ ids }) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Contact WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`;

      db.run(sql, ids, function (err) {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async add() {
    return new Promise((resolve, reject) => {
      const created_at = getCurrentDay();
      db.run(
        "INSERT INTO `Contact` (`name`, `email`, `phone`, `message`, `created_at`) VALUES (?, ?, ?, ?, ?)",
        [
          this.contact.name,
          this.contact.email,
          this.contact.phone,
          this.contact.message,
          created_at,
        ],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  async edit() {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE `Contact` SET seen = ? WHERE id = ?",
        [this.contact.seen, this.contact.id],
        function (err) {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  static async count() {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as contact_count FROM `Contact` WHERE seen = 0",
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }
};
