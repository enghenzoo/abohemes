const db = require("../config/database").db;

module.exports = class Discount {
  constructor(discount) {
    this.discount = discount;
  }

  async get() {
    const used = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM `UsedCoupon` WHERE user = ? AND coupon = ?",
        [this.discount.user, this.discount.code],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (used) {
      return { success: false, message: "الكوبون مستخدم بالفعل" };
    }

    return new Promise((resolve, reject) => {
      db.get(
        "SELECT code, value FROM `Coupons` WHERE code = ?",
        [this.discount.code],
        (err, row) => {
          if (err) reject(err);
          resolve({ success: true, coupon: row });
        }
      );
    });
  }

  async check() {
    const used = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM `UsedCoupon` WHERE user = ? AND coupon = ?",
        [this.discount.user, this.discount.code],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (used) {
      return { success: false, message: "coupon already used" };
    }

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO UsedCoupon (`user`, `coupon`) VALUES (?, ?)",
        [this.discount.user, this.discount.code],
        (err) => {
          if (err) reject(err);
          resolve({ success: true });
        }
      );
    });
  }
};
