/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

const mongoose = require('mongoose');
const env = require('./env/environment');

mongoose.Promise = global.Promise;

const mongoUri = `mongodb://qrcodes4good:A6PnUis3ScRgClirQD9VkaYTCpOxEVxn3Nek76gcxs4alcUIgVstrIzuNwVlmO81hmRktuEhywBuZMd5IYtHuQ==@qrcodes4good.documents.azure.com:10255/?ssl=true&replicaSet=globaldb`;

function connect() {
  return mongoose.connect(mongoUri, { auth: { user: env.dbName, password: env.key }});
}

module.exports = {
  connect,
  mongoose
};
