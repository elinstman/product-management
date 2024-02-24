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

    

    const testFunctions = async () => {
        // await viewProductsByCategory()
        // await viewProductsBySupplier()
        await viewProductsByAttribute("category", categoryModel)
        await viewProductsByAttribute("supplier", supplierModel)
    }
    testFunctions()

    // const closeApp = async () => {
    //     console.log("GoodBye")
    //     running = false
    // }

    // const p = propmpt();
    // let running = true

    // while (running) {
    //     const input = p("1. test script. 2. close: ")

    //     if (input == "1") await testFunctions()
    //     else if (input == "2") await closeApp()
    //     else console.log('Invalid Input')

    // }
}
test()