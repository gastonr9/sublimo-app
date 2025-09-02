// Importar módulos necesarios de Node.js
import { promises as fs } from "fs";
import path from "path";

// Array con las rutas de los archivos de tu proyecto (modifica según tus necesidades)
const filePaths = [
  // 'components/Burgon.tsx',
  // "components/Pedidos.tsx",
  "context/AuthContext.tsx",
  "pages/Login.tsx",
  "components/Usuarios.tsx",
  "hooks/useAuth.ts",
  // "components/Inventario.tsx",
  // // "services/inventario.ts",
  // Agrega más rutas de archivos aquí
];

// Ruta del archivo de salida
const outputFile = "./output.txt";

// Función principal para leer archivos y escribir su contenido
async function combineFiles() {
  try {
    // Inicializar el contenido del archivo de salida
    let combinedContent = "";

    // Leer cada archivo y concatenar su contenido
    for (const filePath of filePaths) {
      try {
        // Leer el contenido del archivo
        const content = await fs.readFile(filePath, "utf8");

        // Agregar un encabezado con el nombre del archivo y su contenido
        combinedContent += `// Contenido de: ${filePath}\n\n${content}\n\n`;
      } catch (error) {
        // Manejar error si un archivo no existe o no se puede leer
        combinedContent += `// Error al leer: ${filePath}\n// ${error.message}\n\n`;
        console.error(`Error al leer ${filePath}: ${error.message}`);
      }
    }

    // Escribir todo el contenido combinado en el archivo de salida
    await fs.writeFile(outputFile, combinedContent, "utf8");
    console.log(`Archivo generado exitosamente: ${outputFile}`);
  } catch (error) {
    console.error("Error al generar el archivo de salida:", error.message);
  }
}

// Ejecutar la función
combineFiles();
