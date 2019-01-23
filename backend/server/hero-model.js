const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const heroSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required:  true},
    passwd: { type: String, required: true}
  },
  { autoIndex: false }
);

const Hero = mongoose.model('account', heroSchema);
module.exports = Hero;
