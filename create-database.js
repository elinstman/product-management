import mongoose, { connect } from "mongoose";

await connect("mongodb://localhost:27017/elin-nora-assignment-db");

const { db } = mongoose.connection;

const productSchema = mongoose.Schema({
  product: { type: Number },
  name: { type: String },
  supplier: { type: String },
  category: {
    name: { type: String },
    description: { type: String },
  },
  price: { type: Number },
  cost: { type: Number },
  stock: { type: Number },
});

const productModel = mongoose.model("products", productSchema);

const productCol = await db.createCollection("products");

// Lägg in data för produkterna här!!!
let products = await productCol.insertMany([]);

// Suppliers
const supplierSchema = mongoose.Schema({
  supplier: { type: Number },
  name: { type: String },
  description: { type: String },
  email: { type: String },
  phone: { type: Number },
});

const supplierModel = mongoose.model("suppliers", supplierSchema);

const supplierCol = await db.createCollection("suppliers");

// Lägg till leverantörer här!!
let suppliers = await supplierCol.insertMany([]);

// Categories
const categorySchema = mongoose.Schema({
  category: { type: Number },
  name: { type: String },
  description: { type: String },
});

const categoryModel = mongoose.model("categorys", categorySchema);

const categoryCol = await db.createCollection("categorys");

// Lägg till kategorier här!!
let categories = await categoryCol.insertMany([]);
