# Panel Confort4: operación y límites

Implementado en `admin.html`; no es una maqueta. Usa las cuentas existentes de Supabase Auth, membresía independiente en `confort4.members` y validación de identidad en el servidor para cada acción. La sesión se conserva en sessionStorage de esa pestaña y se puede cerrar; no guarda contraseñas. Si existe un factor TOTP verificado, solicita el código nativo antes de habilitar el panel.

## Flujo de edición

1. Editar textos, fotografías, artículos o módulos mediante campos estructurados.
2. Guardar el borrador. El número de revisión impide sobrescribir una edición concurrente.
3. Abrir vista previa. No publica ni habilita envíos de formulario.
4. Publicar. Guarda la publicación anterior en versiones y actualiza el feed público.
5. Restaurar una versión si hace falta; se recupera primero en borrador, nunca se publica automáticamente.

La página pública lee contenido publicado al cargar. Guardar un borrador no modifica el sitio público. Las publicaciones quedan auditadas. La exportación HTML de GitHub y sus metadatos sociales requieren reconstrucción posterior; los cambios visibles del panel llegan por el feed sin reconstrucción.

## Roles

| Acción | Editor | Administrador |
| --- | --- | --- |
| Leer y guardar borrador, vista previa, subir imágenes, restaurar borrador | Sí | Sí |
| Consultar contactos/reseñas e inventario | Sí | Sí |
| Publicar, moderar, cambiar seguimiento, seleccionar inmuebles, destinatario | No | Sí |

Dani y Alberto están autorizados como administradores con las direcciones confirmadas por el propietario. Falta el correo de Renata. Crear una cuenta en Auth no concede membresía automáticamente. No hay autorregistro ni invitaciones desde el panel en esta versión.

## Contactos y reseñas

La bandeja muestra datos privados y el estado del aviso. Permite seguimiento nuevo, contactado, en proceso, cerrado o archivado; páginas de 50 registros. No hay exportación de datos en esta versión.

Las reseñas entran pendientes. Solo se pueden aprobar si `publishConsent=true`; una restricción de base de datos impide eludirlo. El feed solo devuelve nombre para mostrar, puntuación y comentario aprobados. Correos, teléfonos, contacto preferido y contexto del proyecto nunca son públicos.

## Imágenes

Subida de JPG, PNG o WebP hasta 3 MB. Validación del archivo en servidor y nombre aleatorio. La URL resultante puede pegarse en portadas o fotografías de perfiles. El bucket es público porque sirve imágenes del sitio; no subir documentos privados. No se modifican ni borran imágenes existentes de KW. No hay gestor de borrado ni conversión automática de imágenes en esta versión.

## Inventario y avisos

Las propiedades publicadas de Alberto (ID KW confirmado `2000102839`) entran automáticamente. Se pueden sumar selecciones publicadas del inventario compartido. El panel no edita sus precios ni disponibilidad: eso se gestiona en el sistema de origen. La API nunca devuelve propiedades suspendidas/no publicadas.

El destinatario actual es **dani.guerrero@kwmexico.mx**, exclusivamente para pruebas. Cambiarlo requiere la acción explícita de un administrador. El acceso de Alberto al panel no lo convierte en destinatario del correo. Las notificaciones reutilizan la credencial Resend del servidor bajo la marca Confort4. Las fallas de correo no borran registros; no existe todavía un reintento automático ni seguimiento de entrega al buzón.

## Validación y pendientes editoriales

Pruebas DOM del guardado y seguimiento, pruebas de API de identidad/membresía/MFA, pruebas SQL con rollback de guardar/publicar/restaurar y validación de permisos. No se ingresó con la contraseña real de un asesor y no se pudo hacer revisión visual en navegador por indisponibilidad de la conexión de Chrome.

Casos de éxito, operaciones pasadas, estadísticas, credenciales específicas, zonas especializadas y nuevas cuentas requieren información real del equipo. No se rellenaron con datos inventados.
