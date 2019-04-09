const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		passwordHash: { type: String, required: true },
		registrationDate: { type: Date, default: Date.now },
		lastAccess: { type: Date, default: Date.now },
		emailVerified: { type: Boolean, default: false },
		emailVerifCode: { type: String },
		loginAuthToken: { type: String },
		stripeData: {
			token: [ { type: String, default: null } ],
			title: [ { type: String, default: null } ],
			name: [ { type: String, default: null } ],
			primaryCard: [ { type: Boolean, default: false } ],
			creditCardLastDigits: [ { type: String, default: null } ],
			creditCardType: [ { type: String, default: null } ],
			numberOfDigits: [ { type: String, default: null } ]
		},
		customerToken: { type: String, default: null },
		stripeToken: { type: String, default: null },
		tosAccepted: { type: Boolean, default: false },
		resetPassword: { type: Boolean, default: false },
		resetPasswordCode: { type: String },
		generatedQRCodes: [ {} ],
		savedQRCodes: [ {} ],
		sentPayments: [ {} ],
		receivedPayments: [ {} ]
	},
	{ autoIndex: false }
);

const User = mongoose.model('account', userSchema);
module.exports = User;
