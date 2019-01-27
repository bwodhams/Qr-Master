const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required:  true},
    passwordHash: { type: String, required: true},
    registrationDate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
  },
  { autoIndex: false }
);

const User = mongoose.model('account', userSchema);
module.exports = User;
