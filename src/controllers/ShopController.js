const Product = require('../models/product');
const Category = require('../models/category');
const Cart = require('../models/cart');
const Order = require('../models/order');

class ShopController {

    // [GET] /shop
    async shop(req, res, next) {
        try {

            const page = parseInt(req.query.page) || 1;

            const productsPerPage = 9;
            const skip = (page - 1) * productsPerPage;

            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / productsPerPage);

            const products = await Product.find({})
                .skip(skip)  
                .limit(productsPerPage);  

            const categories = await Category.find();

            const user = req.session.user || null;  

            let cartItems = req.session.cart || [];

            if (user) {
                const cart = await Cart.findOne({ user: user._id }).populate('items.product');
                cartItems = cart ? cart.items : [];
            }

            res.render('shop', {
                products,
                categories,
                currentPage: page,
                totalPages,
                user,
                cartItems
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /shop/:slug
    productDetail(req, res, next) {
        const { slug } = req.params; 
        Product.findOne({ slug })  
            .then(product => {
                if (!product) {
                    return res.status(404).send('Product not found'); 
                }
                const user = req.session.user || null;  
                let cartItems = req.session.cart || [];

                const quantity = 1;

                if (user) {
                    Cart.findOne({ user: user._id }).populate('items.product')
                        .then(cart => {
                            cartItems = cart ? cart.items : [];
                            res.render('product-detail', { product, cartItems, user, quantity });
                        })
                        .catch(next);
                } else {
                    res.render('product-detail', { product, cartItems, user, quantity });
                }
            })
            .catch(next);  
    }

    // [GET] /category/:slug
    async showProductsByCategory(req, res, next) {
        const { slug } = req.params;
        const { page = 1 } = req.query;
      
        try {
            const category = await Category.findOne({ slug });
            if (!category) {
                return res.status(404).send('Category not found');
            }
        
            const productsPerPage = 9;
            const skip = (page - 1) * productsPerPage;
    
            const products = await Product.find({ category: category._id })
                .skip(skip)
                .limit(productsPerPage);
    
            const totalProducts = await Product.countDocuments({ category: category._id });
            const totalPages = Math.ceil(totalProducts / productsPerPage);
        
            const categories = await Category.find();
    
            const user = req.session.user || null;  
    
            let cartItems = req.session.cart || [];
    
            if (user) {
                const cart = await Cart.findOne({ user: user._id }).populate('items.product');
                cartItems = cart ? cart.items : [];
            }
    
            res.render('category', {
                category,
                products,
                categories,
                currentPage: page,
                totalPages,
                user,
                cartItems
            });
        } catch (error) {
            next(error);
        }
    }
    
    // [GET] /admin
    async product(req, res, next) {
        try {
            const products = await Product.find({}).populate('category', 'name');
            const categories = await Category.find({});

            if (!products || products.length === 0) {
                return res.status(404).send('Products not found');
            }

            if (!categories || categories.length === 0) {
                return res.status(404).send('Categories not found');
            }

            res.render('admin', { products, categories });
        } catch (error) {
            next(error);
        }
    }

    // [PUT] /admin/update
    updateProduct(req, res, next) {
        const { id, name, description, price, category, image } = req.body;
        Product.findByIdAndUpdate(id, {
            product_name: name,
            description: description,
            price: price,
            category: category,
            image: image
        }, { new: true })
        .then(updatedProduct => {
            if (!updatedProduct) {
                return res.status(400).json({ message: "Failed to update product" });
            }
            res.redirect('/admin');  
        })
        .catch(error => {
            console.error("Error updating product: ", error);
            return next(error);
        });
    }

    // [POST] /admin/create
    createProduct(req, res, next) {
        const { product_name, description, price, category, image } = req.body;
    
        if (!product_name || !description || !price || !category) {
            return res.status(400).json({ message: "All fields are required except image." });
        }
        const productImage = image || null;
    
        const newProduct = new Product({
            product_name: product_name,       
            description: description,
            price: price,
            category: category,               
            image: productImage,            
        });
    
        newProduct.save()
            .then(() => res.redirect('/admin'))
            .catch(error => {
                console.error("Error saving product: ", error);
                res.status(500).json({ message: "Failed to create product", error: error });
            });
    }

    // [DELETE] /admin/delete/:id
    deleteProduct(req, res, next) {
        const { id } = req.params;

        Product.findByIdAndDelete(id)
            .then(() => {
                res.redirect('/admin'); 
            })
            .catch(error => {
                console.error("Error deleting product: ", error);
                res.status(500).json({ message: "Failed to delete product", error: error });
            });
    }

    // [DELETE] /admin/orders/:id/delete
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
    
            const order = await Order.findByIdAndDelete(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            res.json({ message: 'Order deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error deleting order' });
        }
    }

    // [PUT] /admin/orders/:id/update
    async updateOrder(req, res, next) {
        try {
            console.log('req.params:', req.params);
            const { id: orderId } = req.params;
            const { status } = req.body;

            console.log('Order ID:', orderId);
            console.log('Status to update:', status);
            
            const validStatuses = ['Pending', 'Completed', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updatedData = { status };
            const order = await Order.findByIdAndUpdate(orderId, updatedData, { new: true });
    
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            res.redirect('/admin/orders');
        } catch (error) {
            next(error);
        }
    }

    // [GET] /admin/orders
    async viewOrders(req, res, next) {
        try {
            const orders = await Order.find()
                .populate('user')
                .populate('items.product')
                .sort({ createdAt: -1 });
            res.render('admin-orders', { orders });
        } catch (error) {
            next(error);
        }
    }
        
}

module.exports = new ShopController;