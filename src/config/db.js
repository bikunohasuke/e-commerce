const mongoose = require('mongoose');
const createCategories = require('../util/createCategories');

async function connect(){

    try {
        await mongoose.connect('mongodb://localhost:27017/ecommerce');
        console.log('Connection successfull!!!');

        await createCategories();
    } catch (error) {
        console.log('Connection failed!!!')
    }

}

module.exports = { connect };
