import mongoose, { connect } from "mongoose";

await connect("mongodb://localhost:27017/elin-nora-assignment-db");

const { db } = mongoose.connection;

const productSchema = mongoose.Schema({
  product: { type: String },
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
let products = await productCol.insertMany([
  {
    product: { type: "Laptop X1" },
    supplier: { type: "ElectroTech" },
    category: {
      name: { type: "Electronics" },
      description: { type: "Cutting-edge technology" },
    },
    price: { type: 1299.99 },
    cost: { type: 899.99 },
    stock: { type: 50 },
  },
  {
    product: { type: "Smart Fitness Tracker" },
    supplier: { type: "ElectroTech" },
    category: {
      name: { type: "Electronics" },
      description: { type: "Cutting-edge technology" },
    },
    price: { type: 79.99 },
    cost: { type: 49.99 },
    stock: { type: 75 },
  },
  {
    product: { type: "Organic Coffee Beans" },
    supplier: { type: "GreenHarvest" },
    category: {
      name: { type: "Food & Beverage" },
      description: { type: "Locally sourced organic" },
    },
    price: { type: 19.99 },
    cost: { type: 12.99 },
    stock: { type: 100 },
  },
  {
    product: { type: "Artisanal Chocolate Box" },
    supplier: { type: "GreenHarvest" },
    category: {
      name: { type: "Food & Beverage" },
      description: { type: "Locally sourced organic" },
    },
    price: { type: 29.99 },
    cost: { type: 18.99 },
    stock: { type: 60 },
  },
  {
    product: { type: "Outdoor Adventure Backpack" },
    supplier: { type: "TrailBlazeOutdoors" },
    category: {
      name: { type: "Outdoor Gear" },
      description: { type: "Durable equipment for adventures" },
    },
    price: { type: 49.99 },
    cost: { type: 34.99 },
    stock: { type: 80 },
  },
  {
    product: { type: "Ultra Durable Thermos" },
    supplier: { type: "TrailBlazeOutdoors" },
    category: {
      name: { type: "Outdoor Gear" },
      description: { type: "Durable equipment for adventures" },
    },
    price: { type: 24.99 },
    cost: { type: 16.99 },
    stock: { type: 90 },
  },
]);

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

// Offers
const offerSchema = mongoose.Schema({
  offernumber: { type: Number },
  active: { type: Boolean },
  offerName: { type: String },
  products: {
    type: [
      {
        productName: { type: String },
        productPrice: { type: Number },
      },
    ],
    default: [],
  },
});

const offerModel = mongoose.model("offers", offerSchema);

const offerCol = await db.createCollection("offers");

// Lägg till offers här!!!
let offers = await offerCol.insertMany([]);

// SALES ORDERS
const salesOrderSchema = mongoose.Schema({
  orderNumber: { type: Number },
  status: { type: Boolean },
  offerNumber: { type: Number },
  products: {
    type: [
      {
        productName: { type: String },
        productPrice: { type: Number },
      },
    ],
  },
});

const salesOrderModel = mongoose.model("sales-orders", salesOrderSchema);

const salesOrderCol = await db.createCollection("sales-orders");

// Denna kommer vara tom tills användaren skapar ordrar
let salesOrders = await salesOrderCol.insertMany([]);
