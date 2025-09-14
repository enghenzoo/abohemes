const AdminModel = require("../models/Admins.model");
const UserModel = require("../models/Users.model");
const OrderModel = require("../models/Orders.model");
const OrderProductsModel = require("../models/OrderProducts.model");
const ProductModel = require("../models/Products.model");
const CategoryModel = require("../models/Categories.model");
const CompanyModel = require("../models/Companies.model");
const ContactModel = require("../models/Contacts.model");
const OfferModel = require("../models/Offers.model");
const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");

const AdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await new AdminModel({ username, password }).login();

    if (admin) {
      const token = jwt.sign(
        { id: admin.id, delete_orders: admin.delete_orders, isAdmin: true },
        process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      await new AdminModel({ id: admin.id }).updateLogin();

      res.json({ token: token });
    } else {
      res.status(403).send("Forbidden Access");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDashboard = async (req, res) => {
  try {
    const activeCustomers = await UserModel.activeCustomers();
    const orders = await OrderModel.numberOfOrders();
    const overview = await AdminModel.overview();
    const top_products = await OrderProductsModel.topProducts();
    const latestOrders = await OrderModel.latestOrders();

    res.json({
      activeCustomers: activeCustomers,
      order: orders,
      overview: overview,
      top_products: top_products,
      latestOrders: latestOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const search = req.query.search;

    const { totalProducts, products } = await ProductModel.adminProducts({
      limit,
      search,
    });
    const categories = await CategoryModel.getAll({ search: "" });
    const companies = await CompanyModel.getAll({ search: "" });
    const totalPages = Math.ceil(totalProducts / 50);
    res.json({ products: products, totalPages, categories, companies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditProduct = async (req, res) => {
  try {
    const product = req.body;

    if (req.file) {
      const image = `/img/product/${product.id}${path.extname(
        req.file.originalname
      )}`;
      Object.assign(product, { image: image });
    }
    await new ProductModel(product).edit();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteProducts = async (req, res) => {
  try {
    const ids = req.body.ids;

    await ProductModel.delete(ids);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const search = req.query.search;

    const { totalOrders, orders } = await OrderModel.adminOrders({
      limit,
      search,
    });

    const ordersIds = orders.map((order) => order.id);

    const products = await OrderProductsModel.adminOrderProducts(ordersIds);

    const totalPages = Math.ceil(totalOrders / 50);
    res.json({ orders: orders, totalPages, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditOrders = async (req, res) => {
  try {
    const order = req.body;
    await new OrderModel(order).edit();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const search = req.query.search;
    const { totalUsers, users } = await UserModel.adminUsers({ limit, search });
    const totalPages = Math.ceil(totalUsers / 50);
    res.json({ users: users, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddProducts = async (req, res) => {
  try {
    const product = req.body;
    const image = `/img/product/${req.body.id}${path.extname(
      req.file.originalname
    )}`;

    Object.assign(product, { image });

    await new ProductModel(product).add();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminCompanies = async (req, res) => {
  try {
    const search = req.query.search;
    const companies = await CompanyModel.getAll({ search });
    res.json({ companies: companies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddCompanies = async (req, res) => {
  try {
    const company = req.body;

    const ext = path.extname(req.file.originalname);
    const image = `/img/compony/${company.name}${ext}`;

    Object.assign(company, { image });

    await new CompanyModel(company).add();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteCompanies = async (req, res) => {
  try {
    const ids = req.body.ids;
    await CompanyModel.delete({ ids });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditCompanies = async (req, res) => {
  try {
    const company = req.body;
    await new CompanyModel(company).edit();
    await new ProductModel({
      company: company.name,
      soon: company.soon,
    }).available();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminCategories = async (req, res) => {
  try {
    const search = req.query.search;
    const categories = await CategoryModel.getAll({ search });
    res.json({ categories: categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteCategories = async (req, res) => {
  try {
    const ids = req.body.ids;
    await CategoryModel.delete(ids);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddCategories = async (req, res) => {
  try {
    const category = req.body;
    await new CategoryModel(category).add();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminContacts = async (req, res) => {
  try {
    const search = req.query.search;
    const contacts = await ContactModel.getAll({ search });
    res.json({ contacts: contacts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditContacts = async (req, res) => {
  try {
    const contact = req.body;
    await new ContactModel(contact).edit();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteContacts = async (req, res) => {
  try {
    const ids = req.body.ids;
    await ContactModel.delete({ ids });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminOffers = async (req, res) => {
  try {
    const offers = await OfferModel.getAll();
    const companies = await CompanyModel.getAll({ search: "" });
    res.json({ offers: offers, companies: companies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddOffers = async (req, res) => {
  try {
    const offer = req.body;
    const image = `/img/offer/${offer.company}${path.extname(
      req.file.originalname
    )}`;

    Object.assign(offer, { image });
    await new OfferModel(offer).add();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteOffers = async (req, res) => {
  try {
    const ids = req.body.ids;
    await OfferModel.delete({ ids });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminCounters = async (req, res) => {
  try {
    const ordersCount = await OrderModel.count();
    const contactCount = await ContactModel.count();
    res.json({
      counters: {
        orders_count: ordersCount.orders_count,
        contact_count: contactCount.contact_count,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminReceipt = async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await new OrderModel({ id }).byId();
    const cities = await new OrderModel().getCities();

    const ordersIds = [receipt.id];
    const products = await OrderProductsModel.adminOrderProducts(ordersIds);

    receipt.products = products;

    res.status(200).json({ receipt: receipt, cities: cities });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.getAll();
    res.json({ admins: admins });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddAdmins = async (req, res) => {
  try {
    const admin = req.body;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(admin.password)
      .digest("hex");

    Object.assign(admin, { password: hashedPassword });
    await new AdminModel(admin).add();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDelivery = async (req, res) => {
  try {
    const delivery = await AdminModel.getDelivery();
    res.json({ delivery: delivery });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditHideCity = async (req, res) => {
  try {
    const { id, hide } = req.body;

    await new AdminModel({ hidden: hide, id }).hideDelivery();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminEditDelivery = async (req, res) => {
  try {
    const delivery = req.body;
    await new AdminModel({ ...delivery }).editDelivery();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminAddDelivery = async (req, res) => {
  try {
    const delivery = req.body;
    await new AdminModel({ ...delivery }).addDelivery();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AdminDeleteDelivery = async (req, res) => {
  try {
    const id = req.params.id;
    await new AdminModel({ id }).deleteDelivery();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  AdminLogin,
  AdminDashboard,
  AdminProducts,
  AdminEditProduct,
  AdminDeleteProducts,
  AdminOrders,
  AdminEditOrders,
  AdminUsers,
  AdminAddProducts,
  AdminCompanies,
  AdminAddCompanies,
  AdminDeleteCompanies,
  AdminEditCompanies,
  AdminCategories,
  AdminDeleteCategories,
  AdminAddCategories,
  AdminContacts,
  AdminDeleteContacts,
  AdminOffers,
  AdminDeleteOffers,
  AdminAddOffers,
  AdminEditContacts,
  AdminCounters,
  AdminReceipt,
  AdminAdmins,
  AdminAddAdmins,
  AdminDelivery,
  AdminEditDelivery,
  AdminAddDelivery,
  AdminDeleteDelivery,
  AdminEditHideCity,
};
