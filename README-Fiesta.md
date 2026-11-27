# Fiesta · La mesa de Navidad

Landing y carta responsive en React, Vite y TypeScript. El botón de la portada abre el book de Canva. El enlace Book navideño de la navegación lleva a la carta interactiva. Los 15 platos del menú y los cuatro congelados incluyen fotografías extraídas del diseño de Fiesta. Los títulos usan texto y fuentes locales. La tipografía caligráfica es Pinyon Script. Los títulos serif usan Kepler Std cuando está instalada y Bodoni Moda como alternativa incluida.

## Publicación

Extraer el ZIP en la raíz de la rama main del repositorio conectado a Cloudflare. El archivo contiene el código fuente, la configuración y los recursos que se publican. Publicar-Fiesta.ps1 toma la lista de archivos del ZIP, crea el commit de esos archivos y ejecuta git push origin main. Si el commit ya existe, reintenta el push. Los cambios preparados en otras rutas quedan fuera del commit. No hace falta instalar dependencias en el equipo que realiza el push.

Para compilar en Cloudflare, utilizar Node 22.12 o posterior, el comando npm run build y el directorio de salida dist. El sitio está preparado para la raíz del dominio. El manifiesto npm y el lockfile permiten reproducir la instalación. Las fuentes y fotos se sirven desde el propio despliegue.

## Alcance de la selección

Mis pedidos guarda las selecciones en la sesión de la pestaña y permite abrir WhatsApp con la lista. La persona revisa el mensaje antes de enviarlo. Los importes se muestran como S/ — según el prototipo. La disponibilidad y el pago se coordinan con el restaurante. El rótulo Libro de reclamaciones está pendiente de la URL oficial. El enlace Condiciones de pedido lleva a los detalles de entrega y pago.

## Edición

Los nombres, categorías, contactos de asesoría, enlace al book y respuestas de entrega están en src/book.ts y src/main.tsx. Las fotografías y tipografías están en public/book. El catálogo usa una grilla en escritorio y un carrusel con controles en celular. Al ampliar una foto se puede cerrar con Escape, el botón de cierre o Volver a la carta.
