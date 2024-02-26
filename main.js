import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
import {
  productModel,
  categoryModel,
  offerModel,
  supplierModel,
  salesOrderModel,
} from "./create-database.js";

const main = async () => {
  try {
    await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

    // Meny val 0
    const viewAll = async (model) => {
      const allDocs = await model.find({});
      console.log(allDocs);
    };

    //menyval 3 och 4
    const viewProductsByAttribute = async (attribute, model) => {
      console.log(`wich ${attribute} would you like to view by?`);

      const attributeArray = await model.distinct("name");
      attributeArray.forEach((attributeOption, index) => {
        console.log(`${index}. ${attributeOption}`);
      });

      const chosenIndex = p("Enter the corresponding number: ");

      if (chosenIndex <= attributeArray.length - 1) {
        if (attribute === "category") {
          const productsByAttribute = await productModel.aggregate([
            { $match: { category: attributeArray[chosenIndex] } },
          ]);
          console.log(productsByAttribute);
        } else if (attribute === "supplier") {
          const productsByAttribute = await productModel.aggregate([
            { $match: { supplier: attributeArray[chosenIndex] } },
          ]);
          console.log(productsByAttribute);
        }
      } else {
        console.log("Invalid input!");
      }
    };

    //7
    const countOffersByStock = async () => {
      const listOfOffers = await offerModel.find();
      const allProductsInStock = [];
      const someProductsInStock = [];
      const noProductsInStock = [];

      for (let offer of listOfOffers) {
        const productsNamedInOffer = offer.products.map((obj) => {
          return obj.productName;
        });
        const productsInOffer = await productModel.find({
          product: { $in: productsNamedInOffer },
        });

        const hasAllProductsAvailable = productsInOffer.every(
          (product) => product.stock > 0
        );
        const hasSomeProductInStock = productsInOffer.some(
          (product) => product.stock > 0
        );

        if (hasAllProductsAvailable) allProductsInStock.push(offer.offerName);
        else if (hasSomeProductInStock) {
          const productInventory = productsInOffer.map((prod) => {
            return `${prod.product}, ${prod.stock} left in stock.`;
          });
          someProductsInStock.push(`${offer.offerName} - ${productInventory}`);
        } else noProductsInStock.push(offer.offerName);
      }

      console.log(
        `Offers with all products in stock: ${allProductsInStock}\n`,
        `Offers with some products in stock: ${someProductsInStock}\n`,
        `Offers with no products in stock: ${noProductsInStock}`
      );
    };

    const updateOfferStatus = async () => {
      const listOfOffers = await offerModel.find();

      for (let offer of listOfOffers) {
        const productNamedInOffer = offer.products.map((obj) => {
          return obj.productName;
        });
        const productsInOffer = await productModel.find({
          product: { $in: productNamedInOffer },
        });
        const isAllProductsAvailable = productsInOffer.every(
          (product) => product.stock > 0
        );
        if (isAllProductsAvailable !== offer.active) {
          await offerModel.updateOne(
            { _id: offer._id },
            { active: !offer.active }
          );
        }
      }
    };
    // 8
    //----------------------------------------------------------------------------------------------------
    const createProductOrder = async () => {
      console.log("Which products do you want in your order?");

      let selectedProducts = [];

      const allProducts = await productModel.find({});
      allProducts.forEach((product, i) =>
        console.log(
          i,
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
          const stockQuantity = parseInt(allProducts[chosenProduct].stock)
          if (
            !isNaN(productQuantity) &&
            productQuantity > 0 &&
            productQuantity <= stockQuantity
          ) {
            const productAndQuantity = {
              itemName: allProducts[chosenProduct].product,
              itemPrice: parseFloat(allProducts[chosenProduct].price),
              itemCost: parseFloat(allProducts[chosenProduct].cost),
              quantity: parseInt(productQuantity),
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
        totalPrice += item.quantity * item.itemPrice;
      });

      let totalCost = 0;
      selectedProducts.map((item) => {
        totalCost += item.quantity * item.itemCost;
      });

      const newSalesOrder = await new salesOrderModel({
        orderNumber: (await salesOrderModel.countDocuments()) + 1,
        orderType: "product-order",
        dateOfOrder: Date(Date.now()),
        items: selectedProducts,
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
      await updateOfferStatus()
      console.log("Here are available offers!");

      const allOffers = await offerModel.find({ active: true });
      const selectedOffers = []
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

        const chosenOfferIndex = parseInt(p(
          "Enter the corresponding number of the offer you want: "
        ));
        const offer = allOffers[chosenOfferIndex];

        if (!offer) {
          console.log("\nInvalid input! \n");
        } else {
          const offerQuantity = parseInt(
            p(
              `How many of ${allOffers[chosenOfferIndex].offerName} would you like to add to your order? `
            )
          );

          if (!isNaN(offerQuantity) && offerQuantity > 0) {

            const totalOfferPrice = parseFloat(offer.offerPrice) * offerQuantity
            let totalOfferCost = 0
            if (offerQuantity <= 10) totalOfferCost = parseFloat(offer.offerCost) * offerQuantity
            else totalOfferCost = parseFloat((parseFloat(offer.offerCost) * offerQuantity) * 0.9)
            const totalOfferRevenue = parseFloat(totalOfferPrice - totalOfferCost)
            const totalOfferProfit = parseFloat(totalOfferRevenue * 0.7)
            const offerObj = ({
              itemName: offer.offerName,
              itemPrice: offer.offerPrice,
              sumPriceOffer: totalOfferPrice,
              sumCostOffer: totalOfferCost,
              sumRevenueOffer: totalOfferRevenue,
              sumProfitOffer: totalOfferProfit,
              quantity: offerQuantity
            })

            selectedOffers.push(offerObj)
          } else {
            console.log("invalid input")
          }
        }

        const placeOfferOrder = p(
          "Do you want to continue placing this order? Y/N: "
        ).toLowerCase();

        if (placeOfferOrder === 'n') {
          if (selectedOffers.length == 0) {
            return
          }
          placingOfferOrder = false
        } else if (placeOfferOrder !== 'y') {
          console.log("Invalid answer");
          return;
        }
      }

      let totalPrice = 0
      selectedOffers.map(item => totalPrice += item.sumPriceOffer)

      let totalCost = 0
      selectedOffers.map(item => totalCost += item.sumCostOffer)

      const totalRevenue = parseFloat(totalPrice - totalCost)
      const totalProfit = parseFloat(totalRevenue * 0.7)

      const newSalesOrder = await new salesOrderModel({
        orderNumber: (await salesOrderModel.countDocuments()) + 1,
        orderType: "offer-order",
        dateOfOrder: Date.now(),
        items: selectedOffers,
        totalPrice: totalPrice,
        totalCost: totalCost,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
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
    }

    const addCategoryAndSupplier = async (field, model) => {
      const inputName = p(`Enter the name of the ${field}: `);
      if (!inputName) return "Please enter a valid value.";
      else {
        const inputDesc = p(`Enter description or info about the ${field}: `);
        const newDoc = await new model({
          name: inputName,
          description: inputDesc,
        });
        await newDoc.save();

        console.log("you've added", newDoc.name, `to the list of ${field}.`);
      }

      return inputName
    }
    const addProduct = async () => {

      const newProduct = p("Enter the name of the product: ");

      const chooseCategoryandSupplier = async (field, model) => {
        console.log(`Choose a ${field} for the product`);
        const listOfOptions = await model.distinct("name");
        listOfOptions.forEach((option, index) => {
          console.log(`${index}. ${option}`);
        });
        console.log(`${listOfOptions.length}. Create a new ${field}.`);
        const chosenIndex = parseInt(p("Enter the corresponding number: "));

        let newOption;
        if (chosenIndex == listOfOptions.length)
          newOption = await addCategoryAndSupplier(field, model);
        else if (chosenIndex < listOfOptions.length)
          newOption = listOfOptions[chosenIndex];
        else {
          console.log("Invalid input.");
          return;
        }

        return newOption;
      };

      const newSupplier = await chooseCategoryandSupplier(
        "supplier",
        supplierModel
      );
      const newCategory = await chooseCategoryandSupplier(
        "category",
        categoryModel
      );
      const newPrice = parseFloat(p("Enter the product price: "));
      const newCost = parseFloat(p("Enter the product cost: "));
      const newStock = parseInt(p("Enter stock quantity: "));

      if (
        newProduct &&
        newSupplier &&
        newCategory &&
        newPrice &&
        newCost &&
        newStock
      ) {
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
        console.log("Information's missing. Unable to create a new product");
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

    const shipOrder = async () => {
      const pendingOders = await salesOrderModel.aggregate([
        { $match: { status: "pending" } },
      ]);
      if (!pendingOders.length) {
        console.log('No orders are available for shipping');
        return;
      }

      console.log("wich order would you like to ship?")
      pendingOders.forEach((order) => {
        console.log("order ", order.orderNumber, " containing: ", order.items)
      })
      const orderNumber = p("choose by entering order number: ")

      const chosenOrder = await salesOrderModel.findOne({ orderNumber: orderNumber })
      if (chosenOrder === null) {
        console.log("Invalid Order Number");
        return;
      }

      const productsInOrder = chosenOrder.items
      if (chosenOrder.orderType === "product-order") {
        for (let item of productsInOrder) {

          const productDoc = await productModel.find({ product: item.itemName })

          await productModel.updateOne({ _id: productDoc[0]._id }, { stock: parseInt(productDoc[0].stock - item.quantity) })
        }
      } else if (chosenOrder.orderType === "offer-order") {
        for (let offer of productsInOrder) {

          const offerDoc = await offerModel.find({ offerName: offer.itemName })

          const productsInOffer = offerDoc[0].products

          for (let product of productsInOffer) {
            const productDoc = await productModel.find({ product: product.productName })
            await productModel.updateOne({ _id: productDoc[0]._id }, { stock: parseInt(productDoc[0].stock - offer.quantity) })
          }
        }
      }

      await salesOrderModel.updateOne({ _id: chosenOrder._id }, { status: "shipped" })
      console.log(`Order ${orderNumber} is now shipped.`)
    }
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

      if (input == "0") await viewAll(productModel);
      else if (input == "1") await addProduct();
      else if (input == "2")
        await addCategoryAndSupplier("category", categoryModel);
      else if (input == "3")
        await viewProductsByAttribute("category", categoryModel);
      else if (input == "4")
        await viewProductsByAttribute("supplier", supplierModel);
      else if (input == "5") await filteroffers();
      else if (input == "6") {
        console.log(
          "View all offers that contain a product from a specific category"
        );
      } else if (input == "7") await countOffersByStock();
      else if (input == "8")
        await createProductOrder();
        else if (input == "9")
        await createOfferOrder();
      else if (input == "10") await shipOrder();
      else if (input == "11")
        await addCategoryAndSupplier("supplier", supplierModel);
      else if (input == "12") await viewAll(supplierModel);
      else if (input == "13") await viewAll(salesOrderModel);
      else if (input == "14") {
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
