const db = require("../config/database").db;

module.exports = class Offers {
  constructor(offer) {
    this.offer = offer;
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM `Offer`", [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async add() {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO `Offer` (`image`, `company`) VALUES (?, ?)",
        [this.offer.image, this.offer.company],
        function (err) {
          if (err) reject(err);
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  }

  static async delete({ ids }) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Offer WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`;

      db.run(sql, ids, function (err) {
        if (err) reject(err);
        resolve();
      });
    });
  }
};
