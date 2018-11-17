// Schema for storing forms and their data in a database. Forms such as surveys.
// Created October 2, 2017 by Larry Maddocks
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO: Take out isBlank if not needed.
var formSchema = new Schema({
  formName: { type: String },
  id: {
    type: String,
    index: true
  },
   isBlank: {
    type: Boolean,
    index: true
  },
  userEmail: {
    type: String
  },
  doc: Object,

  // permissions: {type: Array, required: 'choose permission types allowed to complete this form'},
  // permissions: {type: Array}, //an array of permissions, such as admin, editor
  created: { type: Date, default: Date.now }
});

// formSchema.path('email').validate(function(value, next) {
//   formService.findform(value, function(err, form) {
//     if (err) {
//       console.log(err);
//       return next(false);
//     }
//     next(!form);
//   });
// }, 'That email is already in use');

//var form = mongoose.model('form', formSchema);

module.exports = {
  // form: form
  FormSchema: formSchema
};
