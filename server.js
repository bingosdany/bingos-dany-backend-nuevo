const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const generarPDF = require('./utils/generarPDF');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

const Reserva = require('./models/Reserva');

// Configuración de subida de archivos (comprobantes)
const upload = multer({ dest: 'uploads/' });

// Ruta para procesar el formulario
app.post('/reservar', upload.single('comprobante'), async (req, res) => {
  const { nombre, correo, cantidad } = req.body;
  const comprobante = req.file;

  if (!nombre || !correo || !comprobante) {
    return res.status(400).json({ mensaje: 'Faltan campos o archivo' });
  }

  try {
    const nuevaReserva = new Reserva({
      nombre,
      correo,
      cantidad,
      comprobante: comprobante.filename
    });

    await nuevaReserva.save();
    res.status(200).json({ mensaje: 'Reserva guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar reserva:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// Ruta para listar reservas (usada en el panel /admin)
app.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ fecha: -1 });
    res.status(200).json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// 📌 Ruta para validar y enviar cartones
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CORREO,
    pass: process.env.CONTRASENA
  }
});

app.post('/validar/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    if (reserva.validado) return res.status(400).json({ mensaje: 'Reserva ya validada' });

    generarPDF(reserva.nombre, async (rutaPDF, nombreArchivo) => {
      const mailOptions = {
        from: `"Bingos Dany" <${process.env.CORREO}>`,
        to: reserva.correo,
        subject: '¡Tus cartones de Bingo!',
        text: `Hola ${reserva.nombre},\n\nGracias por participar en Bingos Dany. Adjunto encontrarás tus 3 cartones para el sorteo.\n\n¡Buena suerte!`,
        attachments: [
          {
            filename: nombreArchivo,
            path: rutaPDF
          }
        ]
      };

      try {
        await transporter.sendMail(mailOptions);
        reserva.validado = true;
        await reserva.save();

        res.status(200).json({ mensaje: 'Reserva validada y cartones enviados por correo' });
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ mensaje: 'Error al enviar el correo' });
      }
    });
  } catch (error) {
    console.error('Error al validar reserva:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});


// Ruta para ver el porcentaje de cartones vendidos
const progresoRoute = require('./progreso');
app.use('/', progresoRoute);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
