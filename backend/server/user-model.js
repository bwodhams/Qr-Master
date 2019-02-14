const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stripeSchema = new Schema(
  {
    stripeData : {
      creditCard : {type: Number, default: null},
      cvv : {type: Number, default: null},
      expMonth : {type: Number, default: null},
      expYear : {type: Number, default: null},
      token : {type: String, default: null},
      billingFirstName : {type: String, default: null},
      billingLastName : {type: String, default: null},
      billingAddress : {type: String, default: null},
      billingZip : {type: Number, default: null},
      billingState : {type: String, default: null},
      billingCity : {type: String, default: null}
    }
  }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required:  true},
    passwordHash: { type: String, required: true},
    registrationDate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
    emailVerified: {type: Boolean, default: false},
    emailVerifCode: {type: String},
    stripeData: {type: [stripeSchema], default: null}
  },
  { autoIndex: false }
);

const User = mongoose.model('account', userSchema);
module.exports = User;
