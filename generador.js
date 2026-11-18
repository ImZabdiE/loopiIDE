// generador.js

const plantillas = {
    'salida': {
        setup: (pin) => `  pinMode(PIN_${pin}, OUTPUT);\n`,
        loop: (pin) => `  // Parpadear Pin ${pin}\n  digitalWrite(PIN_${pin}, HIGH);\n  delay(500);\n  digitalWrite(PIN_${pin}, LOW);\n  delay(500);\n`
    },
    'entrada': {
        setup: (pin) => `  pinMode(PIN_${pin}, INPUT_PULLUP);\n`,
        loop: (pin) => `  // Leer Pin ${pin}\n  int valor_${pin} = digitalRead(PIN_${pin});\n`
    },
    'pwm': {
        setup: (pin) => `  pinMode(PIN_${pin}, OUTPUT);\n`,
        loop: (pin) => `  // Atenuar Pin ${pin}\n  for(int i=0; i<=255; i+=5) { analogWrite(PIN_${pin}, i); delay(10); }\n`
    }
};

export function generarCodigoCpp(estadoPines, codigoUsuario = "") {
    const pinesConfigurados = Object.keys(estadoPines);
    
    if (pinesConfigurados.length === 0) { 
        return "// Esperando configuración...\n\n" + codigoUsuario; 
    }

    // Ordenamos numéricamente
    pinesConfigurados.sort((a, b) => {
        const numA = a.startsWith('A') ? parseInt(a.substring(1)) : parseInt(a);
        const numB = b.startsWith('A') ? parseInt(b.substring(1)) : parseInt(b);
        return numA - numB;
    });

    let codigoAuto = "// === BEGIN PIN CONFIG ===\n";
    
    // 1. Constantes
    for (const pin of pinesConfigurados) {
        codigoAuto += `const int PIN_${pin} = ${pin};\n`;
    }
    
    // 2. Setup
    codigoAuto += "\nvoid setup() {\n";
    for (const pin of pinesConfigurados) {
        const func = estadoPines[pin];
        if (plantillas[func] && plantillas[func].setup) {
            codigoAuto += plantillas[func].setup(pin);
        }
    }
    codigoAuto += "}\n\n";

    // 3. Loop
    codigoAuto += "void loop() {\n";
    for (const pin of pinesConfigurados) {
        const func = estadoPines[pin];
        if (plantillas[func] && plantillas[func].loop) {
            codigoAuto += plantillas[func].loop(pin);
        }
    }
    codigoAuto += "}\n\n";
    
    codigoAuto += "// === END PIN CONFIG ===\n";

    return codigoAuto + "\n" + codigoUsuario;
}