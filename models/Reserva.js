const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reserva', reservaSchema);
