const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required:  true},
    passwordHash: { type: String, required: true},
    registrationDate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
    emailVerified: {type: Boolean, default: false},
    emailVerifCode: {type: String},
    loginAuthToken: {type: String},
    stripeData : {
      creditCard : [{type: String, default: null}],
      creditCardLastDigits : [{type: String, default: null}],
      creditCardType : [{type: String, default: null}],
      cvv : [{type: String, default: null}],
      expMonth : [{type: String, default: null}],
      expYear : [{type: String, default: null}],
      token : [{type: String, default: null}],
      billingFirstName : [{type: String, default: null}],
      billingLastName : [{type: String, default: null}],
      billingAddress : [{type: String, default: null}],
      billingZip : [{type: String, default: null}],
      billingState : [{type: String, default: null}],
      billingCity : [{type: String, default: null}]
    },
    resetPassword: {type: Boolean, default: false},
    resetPasswordCode: {type: String},
    generatedQRCodes : {
      qrCodeString : [{type: String, default: null}],
      qrCodeData : [{type: String, default: null}]
    }
  },
  { autoIndex: false }
);

const User = mongoose.model('account', userSchema);
module.exports = User;
