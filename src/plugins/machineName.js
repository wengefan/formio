'use strict';

const mongoose = require('mongoose');
const util = require('../util/util');
const _ = require('lodash');

module.exports = (modelName) => (schema, options) => {
  // Add the machineName param.
  schema.add({
    machineName: {
      type: String,
      description: 'A unique, exportable name.',
      __readonly: true
    }
  });

  // Add a compound index for both machine name and the deleted flag.
  schema.index({machineName: 1}, {unique: true, partialFilterExpression: {deleted: {$eq: null}}});

  schema.pre('save', function(next) {
    const model = mongoose.model(modelName);
    if (!_.isFunction(schema.machineName)) {
      // Do not alter an already established machine name.
      if (this._id && this.machineName) {
        return next();
      }

      return util.uniqueMachineName(this, model, next);
    }
    schema.machineName(this, (err, machineName) => {
      if (err) {
        return next(err);
      }

      // Do not alter an already established machine name.
      if (this._id && this.machineName) {
        return next();
      }

      this.machineName = machineName;
      util.uniqueMachineName(this, model, next);
    });
  });
};
