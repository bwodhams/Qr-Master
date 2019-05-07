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

const mongoUri = `mongodb://` + env.dbName + `:` + env.key + `@` + env.dbName + `.documents.azure.com:` + env.cosmosPort + `/?ssl=true&replicaSet=globaldb`;

function connect() {
  return mongoose.connect(mongoUri, {
    auth: {
      user: env.dbName,
      password: env.key
    }
  });
}

module.exports = {
  connect,
  mongoose
};