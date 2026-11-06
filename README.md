# Confort4

Primera base independiente de la landing de Confort4. HTML, CSS y JS estÃ¡ticos sin dependencias de ejecuciÃ³n.

## Vista local

Ejecutar `node serve.mjs`, abrir http://localhost:4317.

## Contenido

NavegaciÃ³n con QuiÃ©nes somos, Quiero (Vender, Comprar, Rentar), Mis propiedades; equipo; filtros con contacto contextual; WhatsApp y redes. Animaciones nativas respetan movimiento reducido. Assets proporcionados por el usuario y logos oficiales de KW Premier del repositorio existente. FotografÃ­a ambiental de CDMX: https://images.unsplash.com/photo-1547686669-9a8cb1a22d91 (Unsplash). TipografÃ­a Manrope obtenida de Google Fonts.

## Inventario / Supabase

Proyecto fuente: `iloetojomzqtadkithtv` (kwpremier web). Se inspeccionÃ³ en modo lectura. No se modificaron tablas, polÃ­ticas, funciones ni datos. La bÃºsqueda de los nombres completos de Alberto y Renata en `public.propiedades.asesor_nombre` no devolviÃ³ coincidencias; por ello esta versiÃ³n muestra un estado de catÃ¡logo en preparaciÃ³n. No contiene propiedades inventadas ni publica todo el inventario de la red. Confirmar IDs de asesores y alcance antes de conectar.

Siguiente fase: esquema privado `confort4` para configuraciÃ³n/selecciones/leads; funciones `confort4-*` con respuestas limitadas a campos pÃºblicos y propiedades autorizadas. No exponer `datos_origen`, contactos privados ni claves privilegiadas. Las propiedades deben leerse del origen para reflejar bajas y cambios, no copiarse a mano. Resend se conectarÃ¡ cuando existan formulario, aviso integral y remitente aprobado. Hoy el contacto es directo por WhatsApp.

## PublicaciÃ³n

La carpeta `dist` contiene el sitio. `.openai/hosting.json` conserva la identidad del alojamiento Sites. El repositorio GitHub es independiente del sitio KW Premier.

