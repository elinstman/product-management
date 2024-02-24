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

    const countOffersByStock = async () => {
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
            else if (hasSomeProductInStock) {
                const productInventory = productsInOffer.map(prod => {
                    return `${prod.product}, ${prod.stock} left in stock.`
                })
                someProductsInStock.push(`${offer.offerName} - ${productInventory}`)
            }
            else noProductsInStock.push(offer.offerName)

        }

        console.log(`Offers with all products in stock: ${allProductsInStock}\n`,
            `Offers with some products in stock: ${someProductsInStock}\n`,
            `Offers with no products in stock: ${noProductsInStock}`)
    }

    const viewOffersContainingCategory = async () => {

        console.log(`wich category would you like to search offers by?`);

        const listOfCategories = await categoryModel.distinct('name');
        listOfCategories.forEach((category, index) => { console.log(`${index}. ${category}`) });
        const categoryIndex = p("Enter the corresponding number: ");

        // const result = await offer.aggregate([])

        const listOfOffers = await offerModel.find();
        for (let offer of listOfOffers) {
            const productNamedInOffer = offer.products.map(obj => { return obj.productName })
            const productsInOffer = await productModel.find({ product: { $in: productNamedInOffer } });

        }
    }

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

    const addProduct = async () => {

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

    const testFunctions = async () => {
        // await countOffersByStock()
        // await addCategory()
        // await addCategoryAndSupplier("supplier", supplierModel)
        await addProduct();
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