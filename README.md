# Confort4

Sitio público: https://danyethxoxo.github.io/confort4/

Sitio modular independiente, publicado en GitHub Pages. HTML, CSS y módulos JavaScript nativos, con Lenis 1.3.27 para el desplazamiento suave. El build copia su módulo, CSS y licencia MIT a dist/vendor. Supabase KW Premier aporta autenticación y lectura de inventario; todos los registros nuevos pertenecen a Confort4.

## Páginas y módulos

- Inicio: presentación, rutas de servicio, catálogo, proceso narrativo, lecturas, preguntas, contacto y reseñas. Orden y visibilidad editables.
- Equipo: perfiles de Alberto Flores Resendiz y Renata Flores, con sus fotografías. Sin retratos en el inicio.
- Vender, comprar y rentar: guías, proceso, tablas de decisiones, checklists, preguntas y CTA. Renta contempla a arrendador e inquilino.
- Propiedades: filtros de operación, zona, moneda y precio; guardadas locales; comparación de hasta tres; fichas con galería y contacto contextual.
- Blog: seis artículos iniciales originales; búsqueda, categorías, índice de lectura, puntos clave y recursos relacionados. Fotografía editorial de ambientación.
- Recursos: tres checklists imprimibles.
- Contacto: formulario de una sola vista, validación, canal preferido, contexto de propiedad, consentimiento y envío idempotente.
- Reseñas: permiso de publicación separado; nunca se publican sin revisión y consentimiento.
- Panel `admin.html`: contenido, módulos, perfiles, servicios, proceso, blog, FAQ, checklists, imágenes, contactos y seguimiento, moderación, inventario adicional, destinatario y versiones.

## Desarrollo y pruebas

Node 24:

```sh
npm ci
npm test
node serve.mjs
```

jsdom es únicamente una dependencia de pruebas. `npm test` genera 24 páginas, comprueba enlaces, valida funciones con solicitudes simuladas y ejecuta recorridos DOM del sitio y del panel. GitHub Actions ejecuta esas pruebas antes de publicar `dist/`.

El rediseño Nivara se revisó visualmente en Chrome y con una vista de 390 píxeles dentro de un iframe de prueba. Las pruebas de autenticación utilizan solicitudes simuladas y controles de permisos del servidor.

## Contenido y publicación

`content/site.json` e `inventory.json` son la base estática versionada. `dist/ui.mjs` comparte el renderizador entre generación y cliente. `scripts/build-pages.mjs` genera páginas, rutas permanentes para los seis artículos/cuatro fichas iniciales, metadatos y sitemap.

La edición cotidiana se hace en el panel: **Guardar borrador → Vista previa → Publicar**. La API entrega exclusivamente el contenido publicado. El visitante recibe el HTML estático y después su versión vigente en Supabase. Los cambios del panel no hacen commits ni reconstruyen GitHub Pages; la base HTML de respaldo y los metadatos para enlaces compartidos se actualizan al reconstruir el repositorio. Artículos e inmuebles nuevos siguen disponibles mediante rutas con parámetros; pueden incorporarse a la exportación estática posterior.

La vista previa guarda solo contenido público del borrador en almacenamiento local y bloquea envíos de formulario. Las credenciales y los datos de contactos nunca forman parte de esa vista previa.

## Inventario

Lectura de `public.propiedades`, únicamente `estatus='publicada'`. El ID KW `2000102839` de Alberto fue confirmado por el propietario. Se muestran sus cuatro propiedades publicadas y las selecciones adicionales hechas por administradores. El catálogo se actualiza al abrir/recargar la página; no es una suscripción en tiempo real. No modifica fichas ni permisos de KW Premier.

Si falla la conexión, el catálogo conserva la última selección incluida en la exportación y avisa que debe confirmarse su vigencia. Precios en monedas diferentes no se filtran bajo un único presupuesto: el visitante elige moneda antes del importe máximo.

## Supabase y correo

Proyecto `iloetojomzqtadkithtv`. Esquema privado `confort4`, tablas con RLS y sin acceso directo anónimo/autenticado. Las funciones RPC son exclusivas de `service_role`, ejecutadas por Edge Functions:

- `confort4-forms`: validación, consentimiento, límites, deduplicación, persistencia y aviso por Resend. Si falla el correo, conserva el contacto.
- `confort4-site`: contenido publicado; identidad validada con Auth y membresía propia para el panel; MFA cuando la cuenta lo tiene habilitado; control de versión; subida de imágenes con tipo/firma/tamaño validados.

El bucket público `confort4-media` contiene solo imágenes destinadas al sitio. Una política restrictiva evita escrituras directas desde clientes; las subidas pasan por el servidor con membresía comprobada. No se permiten SVG aportados por usuarios.

**Los avisos siguen dirigidos únicamente a `dani.guerrero@kwmexico.mx` para pruebas.** Alberto no recibe copia. Las credenciales Resend y `service_role` permanecen en el servidor; `form-config.js` contiene solo claves públicas. `sent` indica aceptación de Resend, no confirma llegada al buzón. No hay un trabajo automático de reintento de notificaciones fallidas.

DDL aplicado en orden: `db/confort4-schema.sql`, `db/confort4-cms.sql`, `db/confort4-media.sql`. Son registros de migraciones aplicadas, no scripts que deban repetirse sobre tablas existentes. La configuración del destinatario y la siembra de contenido se realizaron aparte. Nunca aplicar migraciones genéricas a KW Premier.

## Acceso del equipo

Dani y Alberto tienen membresía propia de administrador usando sus cuentas existentes. No se crearon contraseñas ni se enviaron invitaciones. Renata requiere su correo confirmado para autorizar su cuenta. El registro o el inicio de sesión en el proyecto KW Premier por sí solo no da acceso a Confort4.

Ver [docs/ADMIN-PLAN.md](docs/ADMIN-PLAN.md) para operación, roles y límites.

## Recursos gráficos

Logo y retratos aportados por el usuario; logos KW Premier del sitio existente. Ambientación Unsplash: `photo-1600210492486-724fe5c67fb0`, `photo-1600607687920-4e2a09cf159d`; no se presentan como inmuebles disponibles. Portadas fotográficas en `dist/assets/editorial-*.jpg`. Manrope conserva su licencia OFL en assets.

## Rediseño Nivara — noviembre de 2026

Referencia visual elegida por el propietario: https://nivara-architecture-template.vercel.app/. La portada usa su fotografía de fachada y la tipografía Inter Tight, cuya licencia OFL acompaña el archivo. El contenido y los enlaces corresponden a Confort4. Las imágenes editoriales adicionales proceden de Unsplash: photo-1600596542815-ffad4c1539a9, photo-1600607687939-ce8a6c25118c, photo-1600585154340-be6161a56a0c y photo-1600566753190-17f0baa2a6c3. Son ambientación.

Texto destacado al hacer scroll, escena fotográfica que se abre con el desplazamiento, presentación de propiedades con pausa y controles, servicios desplegables y contacto visible. Las preferencias de movimiento reducido desactivan la animación y el avance automático. La herramienta de precio de referencia y ahorro se retiró de inicio, recursos, artículos y selección de módulos del panel.
