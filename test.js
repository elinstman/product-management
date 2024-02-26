import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
import { productModel } from "./create-database.js";
import { categoryModel } from "./create-database.js";
import { offerModel } from "./create-database.js";
import { supplierModel } from "./create-database.js";
import { salesOrderModel } from "./create-database.js";

const test = async () => {
    const p = propmpt();

    const updateOfferStatus = async () => {
        const listOfOffers = await offerModel.find();

        for (let offer of listOfOffers) {
            const productNamedInOffer = offer.products.map(obj => { return obj.productName })
            const productsInOffer = await productModel.find({ product: { $in: productNamedInOffer } });
            const isAllProductsAvailable = productsInOffer.every(product => product.stock > 0);
            if (isAllProductsAvailable !== offer.active) {
                await offerModel.updateOne({ _id: offer._id }, { active: !offer.active })
            }
        }
    }

    const updateOrderStatus = async () => {
        const listOfOrders = await salesOrderModel.find();
        for (let order of listOfOrders) {
            if (order.status === 'shipped') {
                await salesOrderModel.updateOne({ _id: order._id }, { status: "pending" })
            }
        }
        console.log("all orders are pending")
    }

    const viewOffersContainingCategory = async () => {

        console.log(`wich category would you like to search offers by?`);

        const listOfCategories = await categoryModel.distinct('name');
        listOfCategories.forEach((category, index) => { console.log(`${index}. ${category}`) });
        const categoryIndex = p("Enter the corresponding number: ");

        const result = await offerModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "products",
                    foreignField: "_id",
                    as: "productDetails",
                }
            },
            {
                $match: {
                    "productDetails.category": listOfCategories[categoryIndex].name
                },
            },
            {
                $project: {
                    products: 1,
                    price: 1,
                    cost: 1,
                    productDetails: 1,
                },
            },
        ]);

        if (result.length === 0) {
            console.log(`No offers found for this category.`);
            return
        };

        console.log(`Offers containing products from ${listOfCategories[categoryIndex].name}:`)
        result.forEach((offer, index) => {
            console.log(index + 1, ". Offer:", offer.name)
        })
        // const listOfOffers = await offerModel.find();
        // for (let offer of listOfOffers) {
        //     const productNamedInOffer = offer.products.map(obj => { return obj.productName })
        //     const productsInOffer = await productModel.find({ product: { $in: productNamedInOffer } });

        // }
    }

    const createOfferOrderE = async () => {
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

    const shipOrder = async () => {
        //hämtar ordrar
        const pendingOders = await salesOrderModel.aggregate([
            { $match: { status: "pending" } },
        ]);
        if (!pendingOders.length) {
            console.log('No orders are available for shipping');
            return;
        }
        //välj order
        console.log("wich order would you like to ship?")
        pendingOders.forEach((order) => {
            console.log("order ", order.orderNumber, " containing: ", order.products)
        })
        const orderNumber = p("choose by entering order number: ")

        const chosenOrder = await salesOrderModel.findOne({ orderNumber: orderNumber })
        if (chosenOrder === null) {
            console.log("Invalid Order Number");
            return;
        }
        //uppdatera lager, productOder
        const productsInOrder = chosenOrder.products
        if (chosenOrder.orderType === "product-order") {
            for (let product of productsInOrder) {

                const productDoc = await productModel.find({ product: product.productName })

                await productModel.updateOne({ _id: productDoc[0]._id }, { stock: parseInt(productDoc[0].stock - product.quantity) })
            }
        } else if (chosenOrder.orderType === "offer-order") {
            console.log("offerorder")
        }

        // ändrar status pending -> shipped
        await salesOrderModel.updateOne({ _id: chosenOrder._id }, { status: "shipped" })
        console.log(`Order ${orderNumber} is nowshipped.`)


        // product-order
        //price-cost 
        //70% = profit


        // }

    }

    const createOrder = async () => {
        console.log("Which products do you want in your order?");

        const selectedProducts = [];

        const allProducts = await productModel.find({});
        allProducts.forEach((product, i) =>
            console.log(
                i, ". ",
                product.product, " ",
                product.price + "$ ",
                product.stock, "pcs left"
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
                    ).trim()
                );
                if (
                    !isNaN(productQuantity) &&
                    productQuantity > 0 &&
                    productQuantity <= allProducts[chosenProduct].stock
                ) {
                    const productAndQuantity = {
                        productName: allProducts[chosenProduct].product,
                        productPrice: parseFloat(allProducts[chosenProduct].price),
                        productCost: parseFloat(allProducts[chosenProduct].cost),
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
            totalPrice += item.quantity * item.productPrice;
        });

        let totalCost = 0;
        selectedProducts.map((item) => {
            totalCost += item.quantity * item.productCost;
        });

        const totalRevenue = totalPrice - totalCost
        const totalProfit = totalRevenue * 0.7

        const newSalesOrder = await new salesOrderModel({
            orderNumber: (await salesOrderModel.countDocuments()) + 1,
            orderType: "product-order",
            dateOfOrder: Date(Date.now()),
            products: selectedProducts,
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
    };
    

    const testFunctions = async () => {
        // await createOrder()
        // await updateOrderStatus()
        // await shipOrder()
        // await calculateRevenueAndProfit()

        // await viewOffersContainingCategory()
    }
    testFunctions()

}
test()