const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const Product = new Schema({
    product_name: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, slug: 'product_name', unique: 'true'},
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });



module.exports = mongoose.model('Product', Product);
