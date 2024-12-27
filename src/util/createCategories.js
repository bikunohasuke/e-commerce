const Category = require('../models/category');

const createCategories = async () => {
    const categories = [
        { name: 'Whey Protein', description: 'High-quality whey protein for muscle building and recovery.' },
        { name: 'Mass Gainer', description: 'Mass gainer supplements for weight gain and muscle growth.' },
        { name: 'Creatine', description: 'Creatine supplements for strength and performance enhancement.' },
        { name: 'Pre-workout', description: 'Pre-workout supplements to boost energy and endurance.' },
        { name: 'Fish Oil', description: 'Fish oil supplements for overall health and omega-3 fatty acids.' },
        { name: 'Vitamins and Minerals', description: 'Multivitamins and minerals to support general health.' }
    ];

    try {
        for (const category of categories) {
            const existingCategory = await Category.findOne({ name: category.name });
            if (!existingCategory) {
                const newCategory = new Category(category);
                newCategory.slug = newCategory.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                await newCategory.save();
                console.log(`Category Created: ${category.name}, Slug: ${newCategory.slug}`);
            } else {
                console.log(`Category "${category.name}" already exists.`);
            }
        }
    } catch (err) {
        console.error('Error creating categories:', err);
    }
};

module.exports = createCategories;