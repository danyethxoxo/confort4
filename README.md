# Confort4

Primera base independiente de la landing de Confort4. HTML, CSS y JS estáticos sin dependencias de ejecución.

## Vista local

Ejecutar `node serve.mjs`, abrir http://localhost:4317.

## Contenido

Navegación con Quiénes somos, Quiero (Vender, Comprar, Rentar), Mis propiedades; equipo; filtros con contacto contextual; WhatsApp y redes. Animaciones nativas respetan movimiento reducido. Assets proporcionados por el usuario y logos oficiales de KW Premier del repositorio existente. Fotografía ambiental de CDMX: https://images.unsplash.com/photo-1512813195386-6cf811ad3542 (Unsplash). Tipografía Manrope obtenida de Google Fonts.

## Inventario / Supabase

Proyecto fuente: `iloetojomzqtadkithtv` (kwpremier web). Se inspeccionó en modo lectura. No se modificaron tablas, políticas, funciones ni datos. La búsqueda de los nombres completos de Alberto y Renata en `public.propiedades.asesor_nombre` no devolvió coincidencias; por ello esta versión muestra un estado de catálogo en preparación. No contiene propiedades inventadas ni publica todo el inventario de la red. Confirmar IDs de asesores y alcance antes de conectar.

Siguiente fase: esquema privado `confort4` para configuración/selecciones/leads; funciones `confort4-*` con respuestas limitadas a campos públicos y propiedades autorizadas. No exponer `datos_origen`, contactos privados ni claves privilegiadas. Las propiedades deben leerse del origen para reflejar bajas y cambios, no copiarse a mano. Resend se conectará cuando existan formulario, aviso integral y remitente aprobado. Hoy el contacto es directo por WhatsApp.

## Publicación

La carpeta `dist` contiene el sitio. `.openai/hosting.json` conserva la identidad del alojamiento Sites. El repositorio GitHub es independiente del sitio KW Premier.
