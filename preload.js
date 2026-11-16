const { contextBridge } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Opciones para evitar que se abra la consola de Windows cada vez que se ejecuta un comando
const execOptions = { windowsHide: true };

contextBridge.exposeInMainWorld('api', {
  // 1. Detectar placas conectadas
  detectarPlacas: () => {
    return new Promise((resolve, reject) => {
      const rutaCli = 'arduino-cli'; // Asegúrate de que esta sea tu ruta
      
      exec(`"${rutaCli}" board list --format json`, execOptions, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  },

  // 2. Compilar el código y ver la memoria
  compilar: (codigo, rutaCli) => {
    return new Promise((resolve, reject) => {
      // Crear carpeta temporal si no existe
      const dir = path.join(__dirname, 'temp_sketch');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      
      // Guardar el código en el archivo .ino
      const sketchPath = path.join(dir, 'temp_sketch.ino');
      fs.writeFileSync(sketchPath, codigo);

      const cli = rutaCli || 'arduino-cli';
      
      // Compilar para Arduino UNO
      exec(`"${cli}" compile -b arduino:avr:uno "${dir}"`, execOptions, (error, stdout, stderr) => {
        if (error) {
          // Si falla, devolvemos el error para que lo muestre la consola
          resolve({ success: false, error: error.message, stdout, stderr });
          return;
        }
        resolve({ success: true, stdout, stderr });
      });
    });
  },

  // 3. Subir el código a la placa
  subirAPlaca: (codigo, rutaCli, puerto) => {
    return new Promise((resolve, reject) => {
      const dir = path.join(__dirname, 'temp_sketch');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      
      const sketchPath = path.join(dir, 'temp_sketch.ino');
      fs.writeFileSync(sketchPath, codigo);

      const cli = rutaCli || 'arduino-cli';
      
      // Compilar y subir usando el puerto (ej. COM5)
      exec(`"${cli}" compile -b arduino:avr:uno -p ${puerto} --upload "${dir}"`, execOptions, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
          return;
        }
        resolve({ success: true, stdout, stderr });
      });
    });
  }
});