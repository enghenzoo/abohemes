const Offers = require("../models/Offers.model");
const Categories = require("../models/Categories.model");
const Companies = require("../models/Companies.model");
const Contacts = require("../models/Contacts.model");
const Orders = require("../models/Orders.model");

const Home = async (req, res) => {
  try {
    const companies = await Companies.getAll({ search: "" });
    const offers = await Offers.getAll();
    const categories = await Categories.getAll({ search: "" });

    res.json({
      offers: offers,
      categories: categories,
      companies: companies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const City = async (req, res) => {
  try {
    const cities = await new Orders().getCities();
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const AddContact = async (req, res) => {
  try {
    const contact = req.body;
    const result = await new Contacts(contact).add();

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(500).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  Home,
  AddContact,
  City,
};
