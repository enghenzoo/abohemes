const db = require("../config/database").db;
const fs = require("fs");

module.exports = class Products {
  constructor(product) {
    this.product = product;
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM `Products`", [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static async coinstore() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM `Products` WHERE in_coin_store = 1 ORDER BY price ASC",
        [],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  async byCategory() {
    if (this.product.user) {
      this.product.favorites = await new Promise((resolve, reject) => {
        db.all(
          "SELECT favourite.product FROM `favourite` INNER JOIN Products ON favourite.product = Products.id WHERE favourite.`user` = ? AND Products.category = ?",
          [this.product.user, this.product.category],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
    }

    const products = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM `Products` WHERE category = ? AND deleted = 0 ORDER BY available DESC",
        [this.product.category],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    return { products, favorites: this.product.favorites };
  }

  async bySearch() {
    if (this.product.user) {
      this.product.favorites = await new Promise((resolve, reject) => {
        db.all(
          "SELECT product FROM `favourite` WHERE user = ?",
          [this.product.user],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
    }
    const products = await new Promise((resolve, reject) => {
      const searchQuery = `%${this.product.query}%`;
      db.all(
        "SELECT * FROM `Products` WHERE name LIKE ? OR description LIKE ? OR company LIKE ? OR category LIKE ? AND deleted = 0 ORDER BY available DESC",
        [searchQuery, searchQuery, searchQuery, searchQuery],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    return { products, favorites: this.product.favorites };
  }

  async inFavorite({ userId }) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM `favourite` WHERE `user` = ? AND `product` = ?",
        [userId, this.product.id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  removeFavorite({ userId }) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM `favourite` WHERE `user` = ? AND `product` = ?",
        [userId, this.product.id],
        (err) => {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  async byCompany() {
    if (this.product.user) {
      this.product.favorites = await new Promise((resolve, reject) => {
        db.all(
          "SELECT favourite.product FROM `favourite` INNER JOIN Products ON favourite.product = Products.id WHERE favourite.`user` = ? AND Products.company = ?",
          [this.product.user, this.product.company],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
    }

    const products = await new Promise((resolve, reject) => {
      let sql = "SELECT * FROM `Products` WHERE company = ?";
      const inputs = [this.product.company];

      if (this.product.category !== "") {
        sql += " AND category = ?";
        inputs.push(this.product.category);
      }

      sql += " AND deleted = 0 ORDER BY available DESC";

      db.all(sql, inputs, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    return { products, favorites: this.product.favorites };
  }

  async add() {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO `Products`(`name`, `description`, `category`, `company`, `price`, `image`, `available`) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          this.product.name,
          this.product.description,
          this.product.category,
          this.product.company,
          this.product.price,
          this.product.image,
          this.product.available,
        ],
        function (err) {
          if (err) reject(err);
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  }

  async edit() {
    if (this.product.image) {
      const productImage = await new Promise((resolve, reject) => {
        db.get(
          "SELECT image FROM `Products` WHERE id = ?",
          [this.product.id],
          function (err, row) {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      const imagePath = `public/talgtna${productImage.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error(err);
        });
      }
    }
    return new Promise((resolve, reject) => {
      const updates = Object.entries(this.product)
        .map(([key, value]) => `${key} = ?`)
        .join(", ");
      const values = Object.values(this.product);
      values.push(this.product.id);
      db.run(
        `UPDATE \`Products\` SET ${updates} WHERE \`id\` = ?`,
        values,
        function (err) {
          if (err) reject(err);
          resolve({ success: true, changes: this.changes });
        }
      );
    });
  }

  async addFavorite({ userId }) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO `favourite` (`product`, `user`) VALUES (?, ?)",
        [this.product.id, userId],
        function (err) {
          if (err) reject(err);
          resolve({ success: true, id: this.lastID });
        }
      );
    });
  }

  static async byFavorite({ userId }) {
    const products = await new Promise((resolve, reject) => {
      db.all(
        "SELECT favourite.product, favourite.user, Products.name, Products.image, Products.price, Products.available, Products.id FROM `favourite` INNER JOIN `Products` ON favourite.product = Products.id WHERE user = ? AND Products.deleted = 0 AND Products.available = 0",
        [userId],
        (err, rows) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const favorites = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(product) as count FROM `favourite` INNER JOIN `Products` ON favourite.product = Products.id WHERE user = ? AND Products.deleted = 0 AND Products.available = 0",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    return { products, favorites };
  }

  async byId({ coins = false }) {
    if (this.product.user) {
      this.product.favorites = await new Promise((resolve, reject) => {
        db.get(
          "SELECT favourite.product FROM `favourite` INNER JOIN Products ON favourite.product = Products.id WHERE favourite.`user` = ? AND Products.id = ?",
          [this.product.user, this.product.id],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
    }
    const product = await new Promise((resolve, reject) => {
      let sql = "SELECT * FROM `Products` WHERE id = ? AND deleted = 0";

      if (coins) {
        sql += " AND in_coin_store = 1";
      }

      db.get(sql, [this.product.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    return { product, favorites: this.product.favorites };
  }

  static async adminProducts({ limit, search }) {
    let OFFSET = limit - 50;

    const totalProducts = await new Promise((resolve, reject) => {
      let sql = "SELECT COUNT(*) as total FROM `Products`";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql += " WHERE name LIKE ? AND deleted = 0";
        inputs.push("%" + search + "%");
      } else {
        sql += "WHERE deleted = 0";
      }

      db.get(sql, inputs, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    console.log(OFFSET, search);
    const products = await new Promise((resolve, reject) => {
      let sql = "SELECT * FROM `Products` WHERE deleted = 0";
      const inputs = [];

      if (search !== undefined && search !== "") {
        sql += " AND name LIKE ? OR company LIKE ?";
        OFFSET = 0;
        inputs.push("%" + search + "%", "%" + search + "%");
      }

      sql += " ORDER BY company ASC LIMIT ? OFFSET ?";

      inputs.push(50, OFFSET);
      db.all(sql, inputs, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    return { totalProducts: totalProducts.total, products };
  }

  static async delete(ids) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Products SET deleted = 1 WHERE id IN (${ids
        .map(() => "?")
        .join(",")})`;
      db.run(sql, ids, function (err) {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async available() {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE `Products` SET `available` = ? WHERE company = ?",
        [this.product.soon, this.product.company],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
};
