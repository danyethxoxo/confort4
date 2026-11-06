# Confort4

Sitio inmobiliario independiente de KW Premier. Publicación: https://danyethxoxo.github.io/confort4/

## Páginas

- `index.html`: portada breve, accesos a servicios, propiedades y formulario.
- `quienes-somos.html`: equipo, fotos y enlaces de Alberto y Renata.
- `vender.html`, `comprar.html`, `rentar.html`: guías independientes. Renta aborda arrendador e inquilino.
- `resena.html`: recepción privada de reseñas con permiso de publicación separado.
- `privacidad.html`: tratamiento de información y medios de contacto.

Contenido estructurado: `content/site.json`. Encabezado y pie compartidos: `templates/`. Las páginas se generan con `node scripts/build-pages.mjs`. No editar las páginas generadas para cambiar contenidos de las guías.

## Desarrollo y verificación

Node 24, sin dependencias npm de ejecución ni de construcción.

```sh
node scripts/build-pages.mjs
node scripts/check-pages.mjs
node --experimental-strip-types tests/forms.test.mjs
node serve.mjs
```

GitHub Actions ejecuta la generación y esas comprobaciones antes de publicar `dist/`.

## Formularios

Proyecto Supabase: `iloetojomzqtadkithtv`. Esquema privado propio: `confort4`. Función nueva: `confort4-forms`, con verificación JWT habilitada. `dist/form-config.js` solo contiene credenciales públicas; no da acceso de lectura a los registros.

`db/confort4-schema.sql` conserva el DDL aplicado en la migración `confort4_private_forms`. Los RPC de persistencia, límites y avisos solo son ejecutables por `service_role`. Las tablas tienen RLS y no están expuestas al cliente. No se modificaron tablas, funciones ni políticas de KW Premier.

La función valida el cuerpo, consentimiento, puntuación y origen; limita tamaño y frecuencia; evita duplicados por ID; guarda primero y luego intenta notificar por Resend. Una falla de correo no pierde el lead. Las reseñas entran pendientes y nunca se publican automáticamente.

**Para activar la notificación falta definir el destinatario en `confort4.settings.notification_email` con el correo que indique el propietario.** Se reutiliza la credencial de Resend del servidor; el remitente se presenta como Confort4. No se envía copia a la oficina. `CONFORT4_FROM` permite configurar un remitente propio verificado sin tocar las otras funciones.

## Futuro panel

Ver [docs/ADMIN-PLAN.md](docs/ADMIN-PLAN.md): acceso con membresía propia, edición de contenido, perfiles, galerías, operaciones, bandeja de leads, moderación y publicación. La estructura está preparada; el panel aún no está implementado.

## Inventario

El catálogo todavía no está conectado: la búsqueda por los nombres completos de los asesores no identificó sus propiedades. Confirmar IDs y alcance antes de exponer inventario. Las fotografías residenciales son ambientación, no anuncios de inmuebles disponibles.

## Recursos

Logotipo y retratos proporcionados por el usuario; logos oficiales de KW Premier del sitio existente. Fotos de ambientación de Unsplash: `photo-1600210492486-724fe5c67fb0` y `photo-1600607687920-4e2a09cf159d`. Manrope se distribuye con su licencia OFL en `dist/assets/manrope-license.txt`.

La publicación por Pages y el comportamiento de los formularios están comprobados. La herramienta de control de Chrome no puede verificar la URL, por lo que no se ha completado la revisión visual en navegador.
