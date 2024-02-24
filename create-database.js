import mongoose, { connect } from "mongoose";

await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

const { db } = mongoose.connection;

const productSchema = mongoose.Schema({
  product: { type: String },
  supplier: { type: String },
  category: { type: String }, 
  price: { type: Number },
  cost: { type: Number },
  stock: { type: Number },
});

export const productModel = mongoose.model("products", productSchema);

const productCol = await db.createCollection("products");

// Lägg in data för produkterna här!!!
const products = [
  {
    product: "Laptop X1",
    supplier: "ElectroTech",
    category: "Electronics",
    price: 1299.99,
    cost: 899.99,
    stock: 50,
  },
  {
    product: "Smart Fitness Tracker",
    supplier: "ElectroTech",
    category: "Electronics",
    price: 79.99,
    cost: 49.99,
    stock: 75,
  },
  {
    product: "Organic Coffee Beans",
    supplier: "GreenHarvest",
    category: "Food & Beverage",
    price: 19.99,
    cost: 12.99,
    stock: 100,
  },
  {
    product: "Artisanal Chocolate Box",
    supplier: "GreenHarvest",
    category: "Food & Beverage",
    price: 29.99,
    cost: 18.99,
    stock: 60,
  },
  {
    product: "Outdoor Adventure Backpack",
    supplier: "TrailBlazeOutdoors",
    category: "Outdoor Gear",
    price: 49.99,
    cost: 34.99,
    stock: 80,
  },
  {
    product: "Ultra Durable Thermos",
    supplier: "TrailBlazeOutdoors",
    category: "Outdoor Gear",
    price: 24.99,
    cost: 16.99,
    stock: 90,
  },
];

const productCountPre = await productModel.countDocuments();

if (productCountPre === 0) {
  await productCol.insertMany(products);
}

// Suppliers
const supplierSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  email: { type: String },
  phone: { type: Number },
});

export const supplierModel = mongoose.model("suppliers", supplierSchema);

const supplierCol = await db.createCollection("suppliers");

// Lägg till leverantörer här!!
const suppliers = [
  {
    name: "ElectroTech",
    description: "Specialiserad på elektroniska produkter",
    email: "info@electrotech.com",
    phone: 123456789,
  },
  {
    name: "GreenHarvest",
    description: "Levererar ekologiska livsmedel och produkter",
    email: "contact@greenharvestorganic.com",
    phone: 987654321,
  },
  {
    name: "TrailBlazeOutdoors",
    description: "Försäljare av utomhusutrustning och äventyrsprodukter",
    email: "sales@trailblazeoutdoors.com",
    phone: 555123456,
  },
];

const supplierCountPre = await supplierModel.countDocuments();

if (supplierCountPre === 0) {
  await supplierCol.insertMany(suppliers);
}

// Offers
const offerSchema = mongoose.Schema({
  offernumber: { type: Number },
  active: { type: Boolean },
  offerName: { type: String },
  offerDescription: { type: String },
  products: {
    type: [
      {
        productName: { type: String },
        productPrice: { type: Number },
      },
    ],
    default: [],
  },
  offerPrice: { type: Number },
  offerCost: { type: Number },
});

export const offerModel = mongoose.model("offers", offerSchema);

const offerCol = await db.createCollection("offers");

let offers = [
  {
    offernumber: 1,
    active: true,
    offerName: "Sportlovsrea 2024",
    offerDescription: "10% rabatt på ordinarie priser",
    products: [
      { productName: "Laptop X1", productPrice: 1199.99 },
      { productName: "Smart Fitness Tracker", productPrice: 69.99 },
      { productName: "Outdoor Adventure Backpack", productPrice: 39.99 },
    ],
    offerPrice: 1179.0,
    offerCost: 984.97,
  },
  {
    offernumber: 2,
    active: true,
    offerName: "Höstspecial 2024",
    offerDescription: "15% rabatt på ordinarie priser",
    products: [
      { productName: "Organic Coffee Beans", productPrice: 15.99 },
      { productName: "Artisanal Chocolate Box", productPrice: 24.99 },
      { productName: "Ultra Durable Thermos", productPrice: 19.99 },
    ],
    offerPrice: 50.0,
    offerCost: 48.97,
  },
  {
    offernumber: 3,
    active: false,
    offerName: "Outdoorpack 2024",
    offerDescription: "20% rabatt på ordinarie priser",
    products: [
      { productName: "Smart Fitness Tracker", productPrice: 59.99 },
      { productName: "Outdoor Adventure Backpack", productPrice: 34.99 },
      { productName: "Ultra Durable Thermos", productPrice: 24.99 },
    ],
    offerPrice: 95.0,
    offerCost: 101.97,
  },
];

const offerCountPre = await offerModel.countDocuments();

if (offerCountPre === 0) {
  await offerCol.insertMany(offers);
}

// SALES ORDERS
const salesOrderSchema = mongoose.Schema({
  orderNumber: { type: Number },
  orderType: { type: String },
  dateOfOrder: { type: Date, default: Date.now() },
  products: {
    type: [
      {
        productName: { type: String },
        productPrice: { type: Number },
        quantity: { type: Number },
      },
    ],
  },
  totalPrice: { type: Number },
  totalCost: { type: Number },
  totalProfit: { type: Number },
  status: { type: String },
});

export const salesOrderModel = mongoose.model("sales-orders", salesOrderSchema);

const salesOrderCol = await db.createCollection("sales-orders");

// Kategorier

const categorySchema = mongoose.Schema({
  name: { type: String },
  description: { type: String },
});

export const categoryModel = mongoose.model("category", categorySchema);

const categoryCol = await db.createCollection("categories");

const categories = [
  {
    name: "Electronics",
    description: "Cutting-edge technology",
  },
  {
    name: "Food & Beverage",
    description: "Locally sourced organic",
  },
  {
    name: "Outdoor Gear",
    description: "Durable equipment for adventures",
  },
];

const categoryCountPre = await categoryModel.countDocuments();

if (categoryCountPre === 0) {
  await categoryCol.insertMany(categories);
}
