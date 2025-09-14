const db = require("../config/database").db;

module.exports = class Companies {
  constructor(company) {
    this.company = company;
  }

  static async getAll({ search }) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM `Companies` ORDER BY soon ASC";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql = "SELECT * FROM `Companies` WHERE name LIKE ?";
        inputs.push("%" + search + "%");
      }

      db.all(sql, inputs, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async add() {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO `Companies` (`name`, `image`) VALUES (?, ?)",
        [this.company.name, this.company.image],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }

  async edit() {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE `Companies` SET `soon` = ? WHERE `name` = ?",
        [this.company.soon, this.company.name],
        (err) => {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  static async delete({ ids }) {
    return new Promise((resolve, reject) => {
      const selectSql = `SELECT image FROM Companies WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`;

      db.all(selectSql, ids, (err, rows) => {
        if (err) return reject(err);

        for (const row of rows) {
          const imagePath = row.image;
          if (imagePath) {
            const fullPath = path.join("uploads/companies", imagePath); // adjust folder path as needed
            fs.unlink(fullPath, (unlinkErr) => {
              if (unlinkErr && unlinkErr.code !== "ENOENT") {
                console.error(`Error deleting file ${fullPath}:`, unlinkErr);
              }
            });
          }
        }

        // 3. Delete companies from DB
        const deleteSql = `DELETE FROM Companies WHERE id IN (${ids
          .map(() => "?")
          .join(",")})`;

        db.run(deleteSql, ids, (deleteErr) => {
          if (deleteErr) reject(deleteErr);
          else resolve({ success: true });
        });
      });
    });
  }

  async byName() {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM `Companies` WHERE `name` = ?",
        [this.company.name],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
};
