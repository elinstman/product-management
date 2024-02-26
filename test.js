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
            const allOrders = await salesOrderModel.find({})
            let totalProfit = 0
            allOrders.forEach((order)=>{
                console.log(totalProfit);
                totalProfit += parseFloat(order.totalPrice-order.totalCost);
                console.log("+" ,parseFloat(order.totalPrice-order.totalCost))
            })
            console.log(totalProfit)

            // const products = 
            // Find all sales orders that contain the specified product
            // const orders = await salesOrderModel.find({ 'items.itemName': productName });

            // Calculate the total profit
            // const totalProfit = orders.reduce((sum, order) => {
            //     return sum + order.totalProfit;
            // }, 0);

            // console.log(`Total profit from all sales orders containing ${productName}: $${totalProfit}`);

            // // Return the calculated total profit
            // return totalProfit;
        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    }

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