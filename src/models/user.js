const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs'); 

const User = new Schema({
    fullName: { type: String, default: '' },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

User.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    bcrypt.hash(this.password, salt)
        .then(hash => {
            this.password = hash; 
            next(); 
        })
        .catch(err => next(err))
});

User.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', User);