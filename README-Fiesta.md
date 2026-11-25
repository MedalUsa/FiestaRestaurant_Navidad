# Fiesta · La mesa de Navidad

Carta de 16 productos en cinco categorías. La experiencia utiliza React, Vite y TypeScript. El carrito y los pedidos se guardan durante la sesión de la pestaña. El pago funciona en el navegador con la tarjeta de prueba de la interfaz. Los importes y cupos son ilustrativos.

## Desarrollo local

Con Node.js 22.12 o posterior, ejecuta `npm ci` y `npm run dev` desde la raíz. Para verificar una compilación de producción, usa `npm run build` y luego `npm run preview`.

## Recursos visuales

Cada producto tiene su propia imagen en `public/media`. Los productos que carecían de fotografía usan imágenes generadas para esta presentación. La asignación por producto está en `src/menu.ts`. Las miniaturas del pedido se recortan en formato cuadrado. Los cinco títulos de sección se extrajeron del arte de la carta 2026. La portada usa una solapa de papel y la confirmación se revela desde el botón de pago.

## GitHub y Cloudflare Pages

El archivo Fiesta-Navidad-Final.zip se extrae en la raíz del repositorio. El script Publicar-Fiesta.ps1 comprueba la rama main, instala las dependencias, compila, añade los archivos del ZIP, crea el commit y ejecuta git push origin main. Se puede volver a ejecutar si un push requiere autenticación. Usa el parámetro -Zip si guardaste la descarga en otra carpeta.

En Cloudflare, abre Workers & Pages → Create application → Pages → Connect to Git. Elige GitHub y FiestaRestaurant_Navidad. Configura la rama de producción main, preset React (Vite), comando npm run build y salida dist. Deja vacío el directorio raíz. La demo funciona sin credenciales de Shopify ni servidor.
