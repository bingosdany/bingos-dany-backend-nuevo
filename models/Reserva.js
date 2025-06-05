const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  cantidad: String,
  tipo: String,
  comprobante: String,
  fecha: {
    type: Date,
    default: Date.now
  },
  validado: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Reserva', reservaSchema);
