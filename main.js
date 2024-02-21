import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
import { productModel } from "./create-database.js";

const main = async () => {
  try {
    await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

    // Meny val 1
    const viewAllProducts = async () => {
      const allProducts = await productModel.find({});
      console.log(allProducts);
    };

    // Meny val 2 (Elin jobbar här)
    const addProduct = async () => {
      let product = p("Enter the name of the product: ");

      //   console.log(
      //     "Choose a supplier:",
      //     "\n1. ElectroTech",
      //     "\n2. GreenHarvest",
      //     "\n3. TrailBlazeOutdoors"
      //   );

      //   let supplierChoice = parseInt(p("Enter the supplier-number: "));

      //   let supplier;
      //   switch (supplierChoice) {
      //     case 1:
      //       supplier = "ElectroTech";
      //       break;
      //     case 2:
      //       supplier = "GreenHarvest";
      //       break;
      //     case 3:
      //       supplier = "TrailBlazeOutdoors";
      //       break;
      //     default:
      //       console.log("Invalid category choice. Defaulting to 'GreenHarvest'.");
      //       category = "GreenHarvest";
      //   }

      //   console.log(
      //     "Choose a category:",
      //     "\n1. Electronics",
      //     "\n2. Food & Beverage",
      //     "\n3. Outdoor Gear"
      //   );

      //   let categoryChoice = parseInt(p("Enter the category-number: "));

      //   let category;
      //   switch (categoryChoice) {
      //     case 1:
      //       category = "Electronics";
      //       break;
      //     case 2:
      //       category = "Food & Beverage";
      //       break;
      //     case 3:
      //       category = "Outdoor Gear";
      //       break;
      //     default:
      //       console.log("Invalid category choice. Defaulting to 'Electronics'.");
      //       category = "Electronics";
      //   }

      let supplier;
      while (!supplier) {
        console.log(
          "Choose a supplier:",
          "\n1. ElectroTech",
          "\n2. GreenHarvest",
          "\n3. TrailBlazeOutdoors"
        );
        let supplierChoice = parseInt(p("Enter the supplier-number: "));
        switch (supplierChoice) {
          case 1:
            supplier = "ElectroTech";
            break;
          case 2:
            supplier = "GreenHarvest";
            break;
          case 3:
            supplier = "TrailBlazeOutdoors";
            break;
          default:
            console.log(
              "Invalid supplier choice. Please enter a valid supplier number."
            );
        }
      }

      let category;
      while (!category) {
        console.log(
          "Choose a category:",
          "\n1. Electronics",
          "\n2. Food & Beverage",
          "\n3. Outdoor Gear"
        );
        let categoryChoice = parseInt(p("Enter the category-number: "));
        switch (categoryChoice) {
          case 1:
            category = "Electronics";
            break;
          case 2:
            category = "Food & Beverage";
            break;
          case 3:
            category = "Outdoor Gear";
            break;
          default:
            console.log(
              "Invalid category choice. Please enter a valid category number."
            );
        }
      }

      let price = p("Enter the product price: ");
      let cost = p("Enter the product cost: ");
      let stock = p("Enter stock quantity: ");

      const newProduct = {
        product: product,
        supplier: supplier,
        category: category,
        price: price,
        cost: cost,
        stock: stock,
      };

      const productDocument = new productModel(newProduct);
      await productDocument.save();

      console.log(
        "you've added",
        productDocument.product,
        " to the list of products."
      );
    };

    // Meny val 15
    const exitApp = async () => {
      console.log("GoodBye");
      runApp = false;
    };

    const p = propmpt();
    let runApp = true;

    while (runApp) {
      console.log(
        "--------------------------------------------------------------------------------\n",
        "Menue:",
        "\n1. View all products",
        "\n2. Add new product",
        "\n3. View products by category",
        "\n4. View products by supplier",
        "\n5. View all offers within a price range",
        "\n6. View all offers that contain a product from a specific category",
        "\n7. View the number of offers based on the number of its products in stock",
        "\n8. Create order for products",
        "\n9. Create order for offers",
        "\n10. Ship orders",
        "\n11. Add a new supplier",
        "\n12. View suppliers",
        "\n13. View all sales",
        "\n14. View sum of all profits",
        "\n15. Exit",
        "\n--------------------------------------------------------------------------------"
      );

      let input = p("Make a choice by entering a number: ");

      if (input == "1") {
        console.log("Add new category");
        await viewAllProducts();
      } else if (input == "2") {
        console.log("Add new product");
        await addProduct();
      } else if (input == "3") {
        console.log("View products by category");
      } else if (input == "4") {
        console.log("View products by supplier");
      } else if (input == "5") {
        console.log("View all offers within a price range");
      } else if (input == "6") {
        console.log(
          "View all offers that contain a product from a specific category"
        );
      } else if (input == "7") {
        console.log(
          "View the number of offers based on the number of its products in stock"
        );
      } else if (input == "8") {
        console.log("Create order for products");
      } else if (input == "9") {
        console.log("Create order for offers");
      } else if (input == "10") {
        console.log("Ship orders");
      } else if (input == "11") {
        console.log("Add a new supplier");
      } else if (input == "12") {
        console.log("View suppliers");
      } else if (input == "13") {
        console.log("View all sales");
      } else if (input == "14") {
        console.log("View sum of all profits");
      } else if (input == "15") {
        await exitApp();
      } else {
        console.log("Invalid option. Choose a number between 1-15");
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await mongoose.connection.close();
  }
};
main();
