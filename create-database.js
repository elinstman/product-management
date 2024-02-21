import mongoose, { connect } from "mongoose";

await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

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

export const productModel = mongoose.model("products", productSchema);

const productCol = await db.createCollection("products");

// Lägg in data för produkterna här!!!
let products = [
  {
    product: "Laptop X1",
    supplier: "ElectroTech",
    category: {
      name: "Electronics",
      description: "Cutting-edge technology",
    },
    price: 1299.99,
    cost: 899.99,
    stock: 50,
  },
  {
    product: "Smart Fitness Tracker",
    supplier: "ElectroTech",
    category: {
      name: "Electronics",
      description: "Cutting-edge technology",
    },
    price: 79.99,
    cost: 49.99,
    stock: 75,
  },
  {
    product: "Organic Coffee Beans",
    supplier: "GreenHarvest",
    category: {
      name: "Food & Beverage",
      description: "Locally sourced organic",
    },
    price: 19.99,
    cost: 12.99,
    stock: 100,
  },
  {
    product: "Artisanal Chocolate Box",
    supplier: "GreenHarvest",
    category: {
      name: "Food & Beverage",
      description: "Locally sourced organic",
    },
    price: 29.99,
    cost: 18.99,
    stock: 60,
  },
  {
    product: "Outdoor Adventure Backpack",
    supplier: "TrailBlazeOutdoors",
    category: {
      name: "Outdoor Gear",
      description: "Durable equipment for adventures",
    },
    price: 49.99,
    cost: 34.99,
    stock: 80,
  },
  {
    product: "Ultra Durable Thermos",
    supplier: "TrailBlazeOutdoors",
    category: {
      name: "Outdoor Gear",
      description: "Durable equipment for adventures",
    },
    price: 24.99,
    cost: 16.99,
    stock: 90,
  },
];

// // Suppliers
// const supplierSchema = mongoose.Schema({
//   supplier: { type: Number },
//   name: { type: String },
//   description: { type: String },
//   email: { type: String },
//   phone: { type: Number },
// });

// const supplierModel = mongoose.model("suppliers", supplierSchema);

// const supplierCol = await db.createCollection("suppliers");

// // Lägg till leverantörer här!!
// let suppliers = await supplierCol.insertMany([]);

// // Offers
// const offerSchema = mongoose.Schema({
//   offer: { type: Number },
//   offerName: { type: String },
//   products: {
//     type: [
//       {
//         productName: { type: String },
//         productPrice: { type: Number },
//       },
//     ],
//     default: [],
//   },
// });

// const offerModel = mongoose.model("offers", offerSchema);

// const offerCol = await db.createCollection("offers");

// // Lägg till offers här!!!
// let offers = await offerCol.insertMany([]);

// // SALES ORDERS
// const salesOrderSchema = mongoose.Schema({
//   // klurar på utseende /Elin
// });

// const salesOrderModel = mongoose.model("sales orders", salesOrderSchema);

// const salesOrderCol = await db.createCollection("sales orders");

// // Denna kommer vara tom tills användaren skapar ordrar
// let salesOrders = await salesOrderCol.insertMany([]);

const countPre = await productModel.countDocuments();

if (countPre === 0) {
  await productCol.insertMany(products)
}