# Confort4: propuesta de sitio inmobiliario modular

## Alcance de la revisión

Referencia: https://jaimeluciano.com/. Se recuperó el HTML de las 105 URLs únicas de sus sitemaps: 17 páginas principales y 88 URLs editoriales, incluida la portada del blog. Se inventariaron títulos, encabezados, destinos y estructura; se revisaron con mayor detalle los servicios, equipo, preguntas frecuentes, contacto, guías de colonias y ejemplos de artículos. El inventario está conservado localmente en `confort4-reference/audit-jaime.json`.

Esto no equivale a una prueba visual e interactiva de 105 páginas: el control del navegador sigue sin poder verificar la URL. No se enviaron formularios de la referencia, ni se validaron sus herramientas fiscales o su catálogo externo. Algunas páginas no expusieron contenido principal útil en el HTML recuperado, aunque respondieron HTTP 200.

## Diagnóstico

La referencia conecta intención, educación, confianza y contacto. Sus servicios tienen recorridos propios; las guías territoriales y el blog amplían la profundidad. Se repiten bloques editoriales y existen artículos antiguos con navegación diferente. Confort4 debe aprovechar la arquitectura, con redacción y componentes propios, conservando la dirección clara de Coinbase/Cuure elegida por el usuario.

La base actual de Confort4 ya tiene rutas independientes, contenido JSON, plantillas compartidas, captura privada, avisos de correo y reseñas pendientes. Todavía faltan catálogo conectado, blog, módulos gráficos variados, herramientas, editor y panel operativo. El destinatario de pruebas debe seguir siendo Dani hasta nueva indicación.

## Mapa propuesto

- Inicio: descubrimiento, selección del recorrido y resumen editorial.
- Vender: estrategia, preparación, proceso, documentos y solicitud de asesoría.
- Comprar: necesidades, comparación, presupuesto, visitas y proceso.
- Rentar: arrendador e inquilino, con rutas claramente separadas.
- Propiedades: catálogo, filtros, fichas y comparación.
- Equipo: Alberto y Renata, trayectoria y casos documentados.
- Blog y guías: categorías, buscador, artículos y recursos relacionados.
- Zonas: guías locales cuando haya contenido e inventario confirmados.
- Reseñas y contacto: recepción, permisos, seguimiento y moderación.
- Administración: edición y operación, con acceso independiente de los visitantes.

## Biblioteca de módulos

| Módulo | Composición y comportamiento | Datos editables |
| --- | --- | --- |
| Portada | Título, una pieza visual fuerte y selector de intención | Mensaje, fotografía/video, CTA |
| Propiedades seleccionadas | Fichas fotográficas, filtros breves y comparación | Selección y orden; inventario sincronizado |
| Proceso | Diagrama de etapas y detalle contextual | Etapas, entregables, recursos |
| Comparativa | Tabla legible sobre decisiones concretas | Filas, conceptos y notas |
| Checklist | Lista interactiva, progreso y descarga | Documentos y explicación de su uso |
| Herramienta | Presupuesto desglosado y gráfico | Conceptos, supuestos y metodología |
| Zonas | Mapa y fichas territoriales | Fotos, servicios, datos con fecha/fuente |
| Equipo | Perfiles y pruebas profesionales reales | Biografía, fotos, certificaciones verificadas |
| Caso de operación | Reto, estrategia y resultado | Material autorizado y resultado documentado |
| Reseñas | Selección breve, expandir y enviar reseña | Moderación y permiso de publicación |
| Blog | Artículo principal y piezas secundarias | Portadas, resúmenes, etiquetas, autor |
| Preguntas | Buscador, categorías y acordeones | Respuestas compartidas entre páginas |
| Formulario | Flujo condicional en tres pasos | Campos por intención, textos y destinatario |

No todos los módulos deben aparecer en todas las páginas. La portada resume; las páginas de intención desarrollan; los artículos profundizan. Los datos comunes provienen de una sola fuente.

## Dirección gráfica

Blanco, carbón y rojo Confort4; tipografía consistente, fotografía cuidada, iconos SVG de una misma familia y diagramas propios del proceso inmobiliario. Alternar fotografía, tablas, diagramas, herramientas y piezas editoriales en lugar de repetir tarjetas o bloques de imagen/texto.

El movimiento debe explicar continuidad: avance del proceso, transición de filtros, respuesta de una herramienta y entradas puntuales. Evitar escenas largas fijadas al scroll y elementos dispersos que ya fueron rechazados. En móvil, los diagramas pasan a recorridos verticales y las tablas se adaptan conservando la comparación. Movimiento reducido conserva todo el contenido.

## Formulario y seguimiento

1. Intención: vender, comprar, ofrecer en renta o buscar renta.
2. Proyecto: solo preguntas relevantes; colonia o zona, tipo, presupuesto orientativo y plazo cuando corresponda.
3. Contacto: nombre, medio preferido, dato de contacto necesario, autorización y resumen editable.

Entrar desde una propiedad o guía conserva el contexto y evita preguntar otra vez. Volver a un paso no borra respuestas. Validación junto al campo, envío con estado visible, confirmación con referencia y alternativa WhatsApp.

Mantener las protecciones actuales de persistencia, límites y duplicados. Añadir seguimiento de entrega/rebote y reintentos autorizados de avisos; correo aceptado por el proveedor no implica llegada a la bandeja. La bandeja administrativa debe distinguir lead guardado, aviso enviado y seguimiento comercial.

## Blog

Lanzar con seis artículos originales revisados: preparación de una venta; conceptos de presupuesto de compra; comparación en una visita; apartado y enganche; entrega e inventario en renta; comparación entre compra y renta según objetivos. Son temas propuestos, no artículos ya escritos.

Cada artículo: resumen inicial, autor, actualización, índice, bloques de lectura, una tabla/diagrama/checklist útil cuando corresponda, fuentes y contenido relacionado. Las estimaciones y datos normativos requieren fuente y vigencia verificadas antes de publicar. No importar textos, reseñas ni resultados del sitio de referencia.

## Administración

Guardar contenido en bloques tipados: encabezado, texto breve, imagen, galería, tabla, proceso, FAQ, recurso y CTA. Cada bloque tiene validación, vista previa, orden y estado de publicación. Los asesores editan información y medios dentro de layouts cuidados; el sistema visual mantiene coherencia.

Panel: páginas, perfiles, blog, propiedades seleccionadas, recursos, leads, reseñas y configuración. Borrador, vista previa, publicación y versiones. Membresía explícita de Confort4; pertenecer a KW no concede acceso automáticamente. Contenido publicado separado de datos privados; archivos y tablas propios. Los resultados históricos solo se publican con soporte y permiso.

## Secuencia de construcción

1. Una página piloto completa de venta y el sistema visual de módulos. Validar desktop/móvil y todos los estados antes de replicar.
2. Formulario condicional y panel mínimo de leads, contenido y reseñas.
3. Catálogo y fichas: confirmar IDs de Alberto/Renata y reglas de selección; reflejar bajas y cambios sin duplicar manualmente el inventario.
4. Blog con seis piezas originales, después guías locales y recursos.

Una etapa está terminada cuando sus datos son reales, sus controles funcionan, puede editarse y ha sido revisada visualmente. Un componente que solo parece interactivo no cumple el criterio.

## Fuentes de estructura

- https://jaimeluciano.com/
- https://jaimeluciano.com/vender-casa-cdmx/
- https://jaimeluciano.com/comprar-casa-cdmx/
- https://jaimeluciano.com/rentar-casa-cdmx/
- https://jaimeluciano.com/sobre-mi/
- https://jaimeluciano.com/preguntas-frecuentes/
- https://jaimeluciano.com/contacto/
- https://jaimeluciano.com/blog/
- https://jaimeluciano.com/colonia-roma-norte-cdmx/
- https://jaimeluciano.com/colonia-del-valle-cdmx/

La revisión no cambia el sitio publicado.
