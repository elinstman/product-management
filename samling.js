import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
import { productModel } from "./create-database.js";
import { categoryModel } from "./create-database.js";
import { offerModel } from "./create-database.js";
import { supplierModel } from "./create-database.js";
import { salesOrderModel } from "./create-database.js";

const main = async () => {
  try {
    await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

    // Meny val 0
    const viewAllProducts = async () => {
      const allProducts = await productModel.find({});
      console.log(allProducts);
    };

    // Meny val 1 (Elin jobbar här)
    const addProduct = async () => {
      let product = p("Enter the name of the product: ");

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

  //menyval 3 och 4
    const viewProductsByAttribute = async (attribute, model) => {
      console.log(`wich ${attribute} would you like to view by?`);

      const attributeArray = await model.distinct('name');
      attributeArray.forEach((attributeOption, index) => { console.log(`${index}. ${attributeOption}`) });

      const chosenIndex = p("Enter the corresponding number: ");

      if (chosenIndex <= (attributeArray.length - 1)) {

          if(attribute === "category"){
              const productsByAttribute = await productModel.aggregate([
              { $match: { category : attributeArray[chosenIndex] } },
          ]);
          console.log(productsByAttribute);

          } else if(attribute === "supplier"){
              const productsByAttribute = await productModel.aggregate([
                  { $match: { supplier : attributeArray[chosenIndex] } },
              ]);
              console.log(productsByAttribute);
          }
          
      } else {
          console.log("Invalid input!");
      }
  }

    //7
    const countOffersByStock = async ()=> {
      const listOfOffers = await offerModel.find();
      const allProductsInStock = []
      const someProductsInStock = []
      const noProductsInStock = []

      for (let offer of listOfOffers) {
          const productsNamedInOffer = offer.products.map(obj => { return obj.productName })
          const productsInOffer = await productModel.find({ product: { $in: productsNamedInOffer } });

          const hasAllProductsAvailable = productsInOffer.every(product => product.stock > 0);
          const hasSomeProductInStock = productsInOffer.some(product => product.stock > 0)

          if (hasAllProductsAvailable) allProductsInStock.push(offer.offerName) 
          else if (hasSomeProductInStock){
              const productInventory = productsInOffer.map(prod => {
                  return `${prod.product}, ${prod.stock} left in stock.`
              })
              someProductsInStock.push(`${offer.offerName} - ${productInventory}`)
          }
          else  noProductsInStock.push(offer.offerName)

      }

      console.log(`Offers with all products in stock: ${allProductsInStock}\n`,
      `Offers with some products in stock: ${someProductsInStock}\n`,
      `Offers with no products in stock: ${noProductsInStock}`)
  }
    

    // 8
    //----------------------------------------------------------------------------------------------------
    const createOrder = async () => {
      console.log("Which products do you want in your order?");

      let selectedProducts = [];

      const allProducts = await productModel.find({});
      allProducts.forEach((product, i) =>
        console.log(
          i++,
          ". ",
          product.product,
          " ",
          product.price + "$ ",
          product.stock,
          "pcs left"
        )
      );

      let placingOrder = true;

      while (placingOrder) {
        const chosenProduct = p(
          "Please enter the corresponding number of the product you want: "
        );
        if (chosenProduct >= 0 && chosenProduct < allProducts.length) {
          const productQuantity = parseInt(
            p(
              `How many ${allProducts[chosenProduct].product} would you like to add to your order? `
            )
          );
          if (
            !isNaN(productQuantity) &&
            productQuantity > 0 &&
            productQuantity <= allProducts[chosenProduct].stock
          ) {
            let productAndQuantity = {
              productName: allProducts[chosenProduct].product,
              productPrice: allProducts[chosenProduct].price,
              productCost: allProducts[chosenProduct].cost,
              quantity: productQuantity,
            };

            selectedProducts.push(productAndQuantity);

            const continuePurchase = p(
              "Do you wish to continue shopping? Y/N "
            ).toLowerCase();
            if (continuePurchase === "n") {
              placingOrder = false;
            } else if (continuePurchase !== "y") {
              console.log("That is not a valid answer! Please try again.");
            }
          } else {
            console.log(
              "This product is out of stock or the amount entered was invalid!"
            );
          }
        } else {
          console.log(
            `${chosenProduct} is not a valid choice, please try again.`
          );
        }
      }

      let totalPrice = 0;
      selectedProducts.map((item) => {
        totalPrice += item.quantity * item.productPrice;
      });

      let totalCost = 0;
      selectedProducts.map((item) => {
        totalCost += item.quantity * item.productCost;
      });

      const newSalesOrder = await new salesOrderModel({
        orderNumber: (await salesOrderModel.countDocuments()) + 1,
        orderType: "product-order",
        dateOfOrder: Date(Date.now()),
        products: selectedProducts,
        totalPrice: totalPrice,
        totalCost: totalCost,
        status: "pending",
      });
      await newSalesOrder
        .save()
        .then(() => {
          console.log(
            `New Sales Order with ID ${newSalesOrder._id} has been created`
          );
        })
        .catch((err) => console.log(err));
    };
    //----------------------------------------------------------------------------------------------------
    // Meny val 9
    const createOfferOrder = async () => {
      console.log("Here are available offers!");

      const allOffers = await offerModel.find({});

      let placingOfferOrder = true;

      while (placingOfferOrder) {
        allOffers.forEach(async (offer, i) => {
          const offerProducts = offer.products.map((offerProduct) => {
            return `${offerProduct.productName}, Price/Unit - $${offerProduct.productPrice}`;
          });

          console.log(
            i,
            ". ",
            offer.offerName,
            "DEAL: ",
            offer.offerPrice + "$ ",
            "\n You get: : ",
            offerProducts
          );
        });

        const choosenOffer = p(
          "Enter the corresponding number of the offer you want: "
        );
        let chosenOfferIndex = parseInt(choosenOffer);

        if (chosenOfferIndex >= 0 && chosenOfferIndex < allOffers.length) {
          const offer = allOffers[chosenOfferIndex];
          const offerQuantity = parseInt(
            p(
              `How many of ${allOffers[chosenOfferIndex].offerName} would you like to add to your order? `
            )
          );
          let totalPrice = offer.offerPrice * offerQuantity;
          console.log(
            `Total price for ${offerQuantity}pcs of offer: ${allOffers[chosenOfferIndex].offerName} = $${totalPrice}`
          );

          let totaltOfferCost = offer.offerCost * offerQuantity;

          const placeOfferOrder = p(
            "Do you want to place this order? Y/N: "
          ).toLowerCase();
          if (placeOfferOrder === "y") {
            const newOfferOrder = await new salesOrderModel({
              orderNumber: (await salesOrderModel.countDocuments()) + 1,
              orderType: "offer-order",
              dateOfOrder: Date.now(),
              totalPrice: totalPrice,
              totalCost: totaltOfferCost,
              status: "pending",
            });

            await newOfferOrder
              .save()
              .then(() => {
                placingOfferOrder = false;
                console.log(
                  `New Sales Order with ID ${newOfferOrder._id} has been created`
                );
              })
              .catch((err) => console.log(err));
          } else if (placeOfferOrder !== "n") {
            placingOfferOrder = false;
            console.log("Invalid input! Please enter 'Y' or 'N'.");
          } else {
            console.log(
              `${allOffers[chosenOfferIndex].offerName} is out of stock or the input entered was invalid!`
            );
          }
        } else {
          console.log("Invalid offer index!");
        }
      }
    };

    // ---------------------------------------------------------------------------------------------------------------
    // Meny val 2 (Elin jobbar här)
    const addCategory = async () => {
      let name = p("Enter the category name: ");
      let description = p("Enter the category description: ");

      const newCategory = {
        name: name,
        description: description,
      };

      const categoryDocument = new categoryModel(newCategory);
      await categoryDocument.save();

      console.log(
        "you've added",
        categoryDocument.name,
        " to the list of categories."
      );
    };

    //------------------------------------------------------------------------------------------------------
    // const shipOrder = async () => {
    //     //choose order to ship 
    //     const pendingOders = await salesOrderModel.aggregate([
    //         { $match: { status: "pending" } },
    //       ]);

    //       if (!pendingOders.length){
    //           console.log('No orders are available for shipping');
    //           return;
    //       } else{
    //         console.log("wich order would you like to ship?")

    //         pendingOders.forEach((order)=>{
    //             console.log("order ", order.orderNumber, " containering: ", order.products )
    //         })

    //         const orderNumber = p("choose by entering order number: ")
    //         // console.log(order)
    //         const chosenOrder = await salesOrderModel.findOne({ orderNumber: orderNumber})
    //         if(chosenOrder === null){
    //             console.log("Invalid Order Number");
    //             return;
    //         } 

    //         console.log(chosenOrder.orderType)
    //         await salesOrderModel.updateOne({ _id: chosenOrder._id }, { status: "shipped" })
    //         chosenOrder.product.forEach(async(product)=>{

    //             const product = await productModel.find({ product : item.productName})
    //             console.log()
    //             const updatedQuantity =  item.quantity
                
    //             await productModel.updateOne({ product: item.productName }, { status: "shipped" })
    //         })
    //         await productModel.updateOne({ })
    //         // product-order
    //         //price-cost 
    //         //70% = profit


    //       }

    // }
    //------------------------------------------------------------------------------------------------------

    const addCategoryAndSupplier = async (field, model) => {
      const inputName = p(`Enter the name of the ${field}: `)
      if (!inputName) return 'Please enter a valid value.'
      else {
          const inputDesc = p(`Enter description or info about the ${field}: `);
          const newDoc = await new model({
              name: inputName,
              description: inputDesc,
          });
          await newDoc.save();

          console.log(
              "you've added",
              newDoc.name,
              " to the list of categories."
          );
      }

      return inputName
  }
     const addProductN = async () => {

        const newProduct = p("Enter the name of the product: ");

        const chooseCategoryandSupplier = async (field, model) => {
            console.log(`Choose a ${field} for the product`);
            const listOfOptions = await model.distinct('name');
            listOfOptions.forEach((option, index) => { console.log(`${index}. ${option}`) });
            console.log(`${listOfOptions.length}. Create a new ${field}.`);
            const chosenIndex = parseInt(p("Enter the corresponding number: "));

            let newOption;
            if (chosenIndex == listOfOptions.length) newOption = await addCategoryAndSupplier(field, model)
            else if (chosenIndex < listOfOptions.length) newOption = listOfOptions[chosenIndex]
            else { console.log("Invalid input."); return };

            return newOption
        }

        const newSupplier = await chooseCategoryandSupplier("supplier", supplierModel);
        const newCategory = await chooseCategoryandSupplier("category", categoryModel);
        const newPrice = parseFloat(p("Enter the product price: "));
        const newCost = parseFloat(p("Enter the product cost: "));
        const newStock = parseInt(p("Enter stock quantity: "));

        if (newProduct && newSupplier && newCategory && newPrice && newCost && newStock) {
            const productDocument = new productModel({
                product: newProduct,
                supplier: newSupplier,
                category: newCategory,
                price: newPrice,
                cost: newCost,
                stock: newStock,
            });

            await productDocument.save();

            console.log(
                "you've added",
                productDocument.product,
                " to the list of products."
            );
        } else {
            console.log("Information's missing. Unable to create a new product")
            return;
        }
    };

    //7
    // loopa orders for each
    // loopa product order.products ()
    //ordered- quantity = product.quantity
    
    // Meny val 5 (Elin jobbar här)
    const filterOffersByPrice = async (minPrice, maxPrice) => {
      try {
        const offers = await offerModel.find({
          $and: [
            { offerPrice: { $gte: minPrice } },
            { offerPrice: { $lte: maxPrice } },
          ],
        });
        return offers;
      } catch (error) {
        console.error("Error filtering offers by price:", error);
        return [];
      }
    };

    const filteroffers = async () => {
      try {
        console.log(
          "Price ranges:",
          "\n1. 10-50",
          "\n2. 1-100",
          "\n3. 51-100",
          "\n4. 100-2000"
        );

        let offerChoice = parseInt(
          p("Enter the number of your desired price range: ")
        );

        let minPrice, maxPrice;

        switch (offerChoice) {
          case 1:
            minPrice = 10;
            maxPrice = 50;
            break;
          case 2:
            minPrice = 1;
            maxPrice = 100;
            break;
          case 3:
            minPrice = 51;
            maxPrice = 100;
            break;
          case 4:
            minPrice = 100;
            maxPrice = 2000;
            break;
          default:
            console.log(
              "Invalid choice. Please enter a number between 1 and 4."
            );
            return;
        }

        let offerByPrice = await filterOffersByPrice(minPrice, maxPrice);
        offerByPrice = offerByPrice.filter((offer) => offer.active === true);

        if (offerByPrice.length > 0) {
          console.log("Here are the offers that match your price range:");
          offerByPrice.forEach((offer) => {
            console.log("Offer Name:", offer.offerName);
            console.log("Description:", offer.offerDescription);
            console.log("Products:");
            offer.products.forEach((product) => {
              console.log(`- ${product.productName}: ${product.productPrice}`);
            });
            console.log("Offer Price:", offer.offerPrice);
            console.log("--------------------");
          });
        } else {
          console.log("No offers match the specified price range.");
        }
      } catch (error) {
        console.error("Error filtering offers:", error);
      }
    };

    // ---------------------------------------------------------------------------------
    // Meny val 11
    const addSupplier = async () => {
      let name = p("Enter the supplier name: ");
      let description = p("Enter the supplier description: ");
      let email = p("Enter the supplier email: ");
      let phone = p("Enter the supplier phonenumber: ");

      const newSupplier = {
        name: name,
        description: description,
        email: email,
        phone: phone,
      };

      const supplierDocument = new supplierModel(newSupplier);
      await supplierDocument.save();

      console.log(
        "you've added",
        supplierDocument.name,
        " to the list of suppliers."
      );
    };

    // -------------------------------------------------------------------------------
    // Meny val 12
    const viewAllSuppliers = async () => {
      const allSuppliers = await supplierModel.find({});
      console.log(allSuppliers);
    };

    // --------------------------------------------------------------------------------------
    // Meny val 13
    const viewAllSalesOrders = async () => {
      const allOrders = await salesOrderModel.find({});
      console.log(allOrders);
    };

    // -------------------------------------------------------------------------------

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
        "\n0. View all products",
        "\n1. Add new product",
        "\n2. Add new category",
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

      if (input == "0") {
        console.log("View all products");
        await viewAllProducts();

      } else if (input == "1") {
        console.log("Add new product");
        await addProductN();

      } else if (input == "2") {
        console.log("Add new category");
        await addCategoryAndSupplier("category", categoryModel);
        // await addCategory();
      } else if (input == "3") {
        await viewProductsByAttribute("category", categoryModel)
        console.log("View products by category");

      } else if (input == "4") {
        console.log("View products by supplier");
        await viewProductsByAttribute("supplier", supplierModel)

      } else if (input == "5") {
        console.log("View all offers within a price range");
        await filteroffers();

      } else if (input == "6") {
        console.log(
          "View all offers that contain a product from a specific category"
        );

      } else if (input == "7") {
        console.log(
          "View the number of offers based on the number of its products in stock"
        );
        await countOffersByStock()

      } else if (input == "8") {
        console.log("Create order for products");
        await createOrder();

      } else if (input == "9") {
        console.log("Create order for offers");
        await createOfferOrder();

      } else if (input == "10") {
        console.log("Ship orders");
        await shipOrder()

      } else if (input == "11") {
        console.log("Add a new supplier");
        await addCategoryAndSupplier("supplier", supplierModel);
        // await addSupplier();

      } else if (input == "12") {
        console.log("View suppliers");
        await viewAllSuppliers();

      } else if (input == "13") {
        console.log("View all sales");
        await viewAllSalesOrders();

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
