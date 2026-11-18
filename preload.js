const { contextBridge } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Opciones para evitar que se abra la consola de Windows al ejecutar comandos
const execOptions = { windowsHide: true };

contextBridge.exposeInMainWorld('api', {
  // 1. Detectar placas conectadas
  detectarPlacas: () => {
    return new Promise((resolve, reject) => {
      const rutaCli = 'C:\\ArduinoCLI\\arduino-cli.exe'; // Tu ruta
      
      exec(`"${rutaCli}" board list --format json`, execOptions, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  },

  // 2. Leer el archivo JSON de la placa
  cargarPerfilPlaca: (idPlaca) => {
    return new Promise((resolve, reject) => {
      const ruta = path.join(__dirname, 'placas', `${idPlaca}.json`);
      
      fs.readFile(ruta, 'utf8', (err, data) => {
        if (err) {
          console.error("Error leyendo JSON de placa:", err);
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  },

  // 3. Compilar el código
  compilar: (codigo, rutaCli) => {
    return new Promise((resolve, reject) => {
      const dir = path.join(__dirname, 'temp_sketch');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      
      const sketchPath = path.join(dir, 'temp_sketch.ino');
      fs.writeFileSync(sketchPath, codigo);

      const cli = rutaCli || 'arduino-cli';
      
      exec(`"${cli}" compile -b arduino:avr:uno "${dir}"`, execOptions, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
          return;
        }
        resolve({ success: true, stdout, stderr });
      });
    });
  },

  // 4. Subir a la placa
  subirAPlaca: (codigo, rutaCli, puerto) => {
    return new Promise((resolve, reject) => {
      const dir = path.join(__dirname, 'temp_sketch');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      
      const sketchPath = path.join(dir, 'temp_sketch.ino');
      fs.writeFileSync(sketchPath, codigo);

      const cli = rutaCli || 'arduino-cli';
      
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