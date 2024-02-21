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

// Collection för offers
const offerSchema = mongoose.Schema({
  // schema utifrån chatgpts data?!
});

const offerModel = mongoose.model("offers", offerSchema);

const offerCol = await db.createCollection("offers");

// Lägg till offers här!!!
let offers = await offerCol.insertMany([]);
