const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const Category = new Schema({
    name: { type: String, required: true, unique: true, maxLength: 255 },
    description: { type: String, maxLength: 600 },
    slug: { type: String, slug: 'name', unique: 'true'}
});

module.exports = mongoose.model('Category', Category);
