import mongoose, { connect } from "mongoose";
import propmpt from "prompt-sync";
// import { productModel } from "./create-database"

const main = async () => {
    try {
        await connect("mongodb://127.0.0.1:27017/elin-nora-assignment-db");

        // const viewAllProducts = async () => {
        //     const allProducts = await productModel.find({})
        //     console.log(allProducts)
        // }

        const exitApp = async() => {
            console.log("GoodBye")
            runApp = false;
        }

        const p = propmpt();
        let runApp = true;

        while (runApp) {

            console.log(
                "--------------------------------------------------------------------------------\n",
                "Menue:",
                "\n1. Add new category",
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
                "\n--------------------------------------------------------------------------------")

            let input = p("Make a choice by entering a number: ")


            if (input == "1") {
                console.log("Add new category")
                await viewAllProducts()

            } else if (input == "2") {
                console.log("Add new product")

            } else if (input == "3") {
                console.log("View products by category")

            } else if (input == "4") {
                console.log("View products by supplier");

            } else if (input == "5") {
                console.log("View all offers within a price range");

            } else if(input == "6"){
                console.log("View all offers that contain a product from a specific category")

            } else if(input == "7"){
                console.log("View the number of offers based on the number of its products in stock")
                
            } else if(input == "8"){
                console.log("Create order for products")
                
            } else if(input == "9"){
                console.log("Create order for offers")
                
            } else if(input == "10"){
                console.log("Ship orders")

            } else if(input == "11"){
                console.log("Add a new supplier")
                
            } else if(input == "12"){
                console.log("View suppliers")
                
            } else if(input == "13"){
                console.log("View all sales")
                
            } else if(input == "14"){
                console.log("View sum of all profits")
                
            } else if(input == "15"){
                await exitApp()
                
            } 
            else {
                console.log("Invalid option. Choose a number between 1-15")
            }
        }


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.connection.close();
    }
}

main()