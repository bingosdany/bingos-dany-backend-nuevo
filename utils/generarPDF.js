const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generarPDF(nombre, callback) {
  const doc = new PDFDocument();
  const nombreArchivo = `${nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  const ruta = path.join(__dirname, '..', 'cartones', nombreArchivo);
  const stream = fs.createWriteStream(ruta);

  doc.pipe(stream);

  doc.fontSize(18).text(`Cartones de Bingo - Bingos Dany`, { align: 'center' });
  doc.moveDown();

  // Aquí generamos 3 cartones de ejemplo
  for (let i = 1; i <= 3; i++) {
    doc.fontSize(14).text(`Cartón ${i}: ${generarCarton()}`);
    doc.moveDown();
  }

  doc.end();

  stream.on('finish', () => {
    callback(ruta, nombreArchivo);
  });
}

function generarCarton() {
  let numeros = [];
  while (numeros.length < 15) {
    let n = Math.floor(Math.random() * 75) + 1;
    if (!numeros.includes(n)) numeros.push(n);
  }
  return numeros.join(' - ');
}

module.exports = generarPDF;
