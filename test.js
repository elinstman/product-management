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

    const viewOffersByCategory = async () => {
        try {
            console.log(`wich category would you like to search offers by?`);

            const listOfCategories = await categoryModel.distinct('name');
            listOfCategories.forEach((category, index) => { console.log(`${index}. ${category}`) });
            const categoryIndex = p("Enter the corresponding number: ");
            console.log(listOfCategories[categoryIndex])

            const productsInCategory = await productModel.find({ category: listOfCategories[categoryIndex] });

            const productNamesInCategory = productsInCategory.map((product) => product.product);

            const offers = await offerModel.aggregate([
                {
                    $match: {
                        'products.productName': { $in: productNamesInCategory },
                    },
                },
                {
                    $project: {
                        offerName: 1,
                        products: 1,
                        offerPrice: 1,
                    },
                },
            ]);

            offers.forEach((offer) => {
                console.log(offer.offerName, " containing: ", offer.products, "  For Only: ", offer.offerPrice, "$");
            });

        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    };


    const calculateSumOfProfits = async () => {
        try {
            //renderar produkter
            console.log(`Select a product to see it's total profit in offers:`);
            const listOfProducts = await productModel.distinct("product");
            listOfProducts.forEach((product, index) => {
                console.log(`${index}. ${product}`);
            });
            //välj produkt eller totalprofit för alla salesorders
            const selectedProductIndex = parseFloat(p("Enter the corresponding number to a product or enter anything else to see the total sales profit: "));
            //alla orders som sen ska summeras, fungerar lite som state
            let orders;

            console.log(listOfProducts[selectedProductIndex])//check 1, hittas en produkt?
            if (!listOfProducts[selectedProductIndex]) {
                orders = await salesOrderModel.find({});//om inte, summera alla ordrar
            } else {
                //om det dyker upp en produkt, hitta de offer som innehåller produkten
                const offerContainingProduct = await offerModel.aggregate([
                    {
                        $match: {
                            'products.productName': listOfProducts[selectedProductIndex],
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            offerName: 1,//räcker med att hänvisa till offerName för nästa steg?
                        },
                    },
                ]);

                console.log(offerContainingProduct)//check 2, hittas det några offer?

                if (offerContainingProduct.length === 0) {
                    console.log(`There are no offers containing this product.`); //inga offer hittas
                    return;
                }
                //hita vilka ordrar som innehåller offers från ovanstående aggregation
                //känns som att det är här dtet blir problem?
                const test = []
                for (let offer of offerContainingProduct) {
                    console.log("offer", offer)
                    const order = await salesOrderModel.aggregate([
                        {
                            $match: {
                                'items.itemName':  offer.offerName ,//tror det är här problemet ligger?
                            },
                        },
                        {
                            $project: {
                                orderNumber: 1,
                                totalPrice: 1,
                                totalCost: 1,
                            }
                        }
                    ])
                    test.push(order)
                }

                orders = test[0]

                console.log(orders) //check 3, inga orders dyker upp...
            }
            //räknar ut den totala profiten på alla ordrar i let orders
            let totalProfit = 0
            orders.forEach((order) => {
                console.log(totalProfit, " + ", parseFloat(order.totalPrice - order.totalCost));
                totalProfit += parseFloat(order.totalPrice - order.totalCost);
            })
            console.log("the total profit is: ", totalProfit)

        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    }


    // const calculateSumOfProfits = async () => {
    //     try {
    //         console.log(`Select a product to see it's total profit in offers:`);

    //         const listOfProducts = await productModel.distinct("product");
    //         listOfProducts.forEach((product, index) => {
    //             console.log(`${index}. ${product}`);
    //         });
    //         const selectedProductIndex = parseFloat(p("Enter the corresponding number to a product or enter anything else to see the total sales profit: "));
    //         let orders;
    //         console.log(listOfProducts[selectedProductIndex])
    //         if (!listOfProducts[selectedProductIndex]) {
    //             orders = await salesOrderModel.find({});
    //         } else {

    //             const offerContainingProduct = await offerModel.aggregate([
    //                 {
    //                     $match: {
    //                         'products.productName': listOfProducts[selectedProductIndex],
    //                     },
    //                 },
    //                 {
    //                     $project: {
    //                         _id: 0,
    //                         offerName: 1,
    //                     },
    //                 },
    //             ]);

    //             if (offerContainingProduct.length === 0) {
    //                 console.log(`There are no offers containing this product.`);
    //                 return;
    //             }

    //             orders = await salesOrderModel.aggregate([
    //                 {
    //                     $match: {
    //                         'items.itemName': {$in: offerContainingProduct},
    //                     },
    //                 },{
    //                     $project: {
    //                         totalPrice: 1,
    //                         totalCost: 1,
    //                     }
    //                 },
    //             ])
    //             console.log(orders)
    //         }

    //         let totalProfit = 0
    //         orders.forEach((order) => {
    //             console.log(totalProfit, " + ", parseFloat(order.totalPrice - order.totalCost));
    //             totalProfit += parseFloat(order.totalPrice - order.totalCost);
    //         })
    //         console.log("the total profit is: ", totalProfit)

    //     } catch (error) {
    //         console.error('Error:', error.message);
    //         throw error;
    //     }
    // }

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



    const testFunctions = async () => {
        // await updateOrderStatus()
        // await shipOrder()
        await calculateSumOfProfits()
    }
    testFunctions()

}
test()