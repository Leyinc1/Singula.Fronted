# Ejemplo de Estructura del Archivo Excel

## Columnas Requeridas (ACTUALIZADO - 28/Nov/2025)

El archivo Excel debe contener exactamente estas columnas (pueden estar en cualquier orden):

| AREA                   | Tipo de Solicitud | Prioridad | Fecha Solicitud | Fecha de Ingreso | Nombre Personal | Eficacia  | Observaciones         |
| ---------------------- | ----------------- | --------- | --------------- | ---------------- | --------------- | --------- | --------------------- |
| Desarrollo Backend     | Nuevo Personal    | Alta      | 15/01/2025      | 10/02/2025       | Juan Pérez      | Eficaz    | Contratación exitosa  |
| Desarrollo Frontend    | Nuevo Personal    | Media     | 20/01/2025      | 05/03/2025       | María García    | No Eficaz | Requiere capacitación |
| QA                     | Reemplazo         | Crítica   | 01/02/2025      | 15/02/2025       | Carlos López    | Eficaz    |                       |
| Infraestructura        | Nuevo Personal    | Baja      | 10/02/2025      | 10/03/2025       |                 | Eficaz    |                       |
| Desarrollo Backend     | Reemplazo         | Alta      | 15/02/2025      | 01/03/2025       | Ana Martínez    | Eficaz    | Excelente desempeño   |
| Analytics              | Nuevo Personal    | Media     | 01/03/2025      | 25/03/2025       | Pedro Sánchez   | Eficaz    |                       |

## Reglas de Validación

### 1. AREA ✅ OBLIGATORIO

- **Tipo**: Texto
- **Obligatorio**: Sí
- **Descripción**: Área o departamento al que pertenece la solicitud
- **Ejemplos válidos**:
  - "Desarrollo Backend"
  - "Desarrollo Frontend"
  - "QA"
  - "Infraestructura"
  - "DevOps"
  - "Analytics"
  - "Arquitectura"
  - "UX/UI"
  - "Seguridad"
  - "Datos"
  - Cualquier área registrada en el sistema

### 2. Tipo de Solicitud ✅ OBLIGATORIO

- **Tipo**: Texto
- **Obligatorio**: Sí (si no se especifica, el sistema puede asignar un valor por defecto)
- **Valores permitidos**:
  - "Nuevo Personal"
  - "Reemplazo"
  - O cualquier tipo registrado en el sistema
- **Nota**: El sistema buscará coincidencias con los tipos de SLA configurados

### 3. Prioridad ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No (si no se especifica, se asigna "MEDIA" por defecto)
- **Valores permitidos**:
  - "Crítica" o "CRITICA" - Urgencia máxima, atención inmediata
  - "Alta" o "ALTA" - Importante, atender pronto
  - "Media" o "MEDIA" - Prioridad estándar (por defecto)
  - "Baja" o "BAJA" - Puede esperar, no urgente
- **Nota**: El sistema normaliza automáticamente las prioridades

### 4. Fecha Solicitud ✅ OBLIGATORIO

- **Tipo**: Fecha
- **Obligatorio**: Sí
- **Formatos aceptados**:
  - DD/MM/YYYY (ejemplo: 15/01/2025)
  - YYYY-MM-DD (ejemplo: 2025-01-15)
  - DD-MM-YYYY (ejemplo: 15-01-2025)
  - MM/DD/YYYY (ejemplo: 01/15/2025)
  - Formato de fecha de Excel (automático)
- **Nota**: El sistema reconoce múltiples formatos de fecha automáticamente

### 5. Fecha de Ingreso ⚪ OPCIONAL

- **Tipo**: Fecha
- **Obligatorio**: No (puede quedar vacío si aún no se ha completado el proceso)
- **Formatos aceptados**:
  - DD/MM/YYYY (ejemplo: 10/02/2025)
  - YYYY-MM-DD (ejemplo: 2025-02-10)
  - DD-MM-YYYY (ejemplo: 10-02-2025)
  - MM/DD/YYYY (ejemplo: 02/10/2025)
  - Formato de fecha de Excel (automático)
- **Nota**: Si se especifica, debe ser igual o posterior a la Fecha Solicitud

### 6. Nombre Personal ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Descripción**: Nombre completo de la persona contratada
- **Ejemplo**: "Juan Pérez González"

### 7. Eficacia ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Valores sugeridos**:
  - "Eficaz" - La contratación cumplió con las expectativas
  - "No Eficaz" - La contratación no cumplió con las expectativas
- **Nota**: Este campo es informativo, se puede dejar vacío

### 8. Observaciones ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Descripción**: Comentarios o notas adicionales sobre la solicitud
- **Ejemplo**: "Contratación exitosa", "Requiere capacitación adicional"

## Campos que el Sistema Asigna Automáticamente

El sistema asignará automáticamente estos valores:

- **IdPersonal**: 1 (Personal genérico)
- **IdRolRegistro**: 1 (Rol por defecto)
- **IdSla**: Se busca según el tipo de solicitud, o 1 si no se encuentra
- **IdArea**: Se busca según el nombre del área, o 1 si no se encuentra
- **IdEstadoSolicitud**: Estado "Pendiente" o el primero disponible
- **NumDiasSla**: Se calcula automáticamente si hay ambas fechas
- **OrigenDato**: "excel" (para identificar datos cargados desde Excel)
- **CreadoEn**: Fecha y hora actual del servidor

## Cálculos Automáticos

El sistema calculará automáticamente:

1. **Días SLA (NumDiasSla)**: Diferencia en días entre Fecha de Ingreso y Fecha Solicitud
   - Solo se calcula si ambas fechas están presentes
   - Ejemplo: Si Fecha Solicitud = 15/01/2025 y Fecha Ingreso = 10/02/2025, entonces NumDiasSla = 26 días

## Resumen de Campos

### ✅ Campos Obligatorios
1. **AREA** - Nombre del área o departamento
2. **Fecha Solicitud** - Fecha de la solicitud

### ⚪ Campos Opcionales  
3. **Tipo de Solicitud** - Si no se especifica, se asigna por defecto
4. **Prioridad** - Si no se especifica, se asigna "MEDIA"
5. **Fecha de Ingreso** - Puede quedar vacío si aún no se completa
6. **Nombre Personal** - Información adicional
7. **Eficacia** - Información adicional
8. **Observaciones** - Información adicional

## Ejemplo Completo

### Caso 1: Solicitud con toda la información ✅

- **AREA**: Desarrollo Backend
- **Tipo de Solicitud**: Nuevo Personal
- **Prioridad**: Alta
- **Fecha Solicitud**: 15/01/2025
- **Fecha Ingreso**: 10/02/2025
- **Nombre Personal**: Juan Pérez
- **Eficacia**: Eficaz
- **Observaciones**: Contratación exitosa
- **Días SLA**: 26 días (calculado automáticamente)

### Caso 2: Solicitud con información mínima ✅

- **AREA**: QA
- **Fecha Solicitud**: 01/02/2025
- (Todos los demás campos vacíos o con valores por defecto)
- **Resultado**: El sistema asignará valores por defecto para los campos faltantes

### Caso 3: Ejemplo de error ❌

- **AREA**: (vacío)
- **Fecha Solicitud**: 15/01/2025
- **Resultado**: ❌ Error - AREA es obligatorio

## Archivo de Plantilla

Se ha creado un archivo Excel de ejemplo llamado `plantilla_carga_sla.xlsx` en la raíz del proyecto con:
- Encabezados correctamente formateados
- 6 filas de ejemplo con diferentes escenarios
- Formato de fechas correcto
- Todas las columnas con el ancho apropiado

**Puedes usar este archivo como plantilla** para crear tus propias cargas de datos.

## Errores Comunes

### ❌ Error: "Formato de fecha inválido"

**Problema**: La fecha no está en un formato reconocido
**Solución**: Usar formato DD/MM/YYYY, YYYY-MM-DD o el formato de fecha de Excel

### ❌ Error: "Columna AREA no encontrada"

**Problema**: Falta la columna AREA (obligatoria)
**Solución**: Asegurarse de que el Excel tenga una columna llamada "AREA" o "area" o "ÁREA"

### ❌ Error: "AREA está vacía"

**Problema**: La columna AREA existe pero alguna fila tiene el valor vacío
**Solución**: Llenar todas las filas con un nombre de área válido

### ❌ Error: "El área no existe en el sistema"

**Problema**: El área especificada no está registrada en la base de datos
**Solución**: El sistema asignará el área por defecto (ID 1). Para mejores resultados, registrar primero las áreas en el sistema

## Recomendaciones

1. **Usar la plantilla proporcionada**: `plantilla_carga_sla.xlsx`
2. **Verificar las fechas**: Asegurarse de que estén en formato correcto
3. **Revisar las áreas**: Usar nombres de áreas que ya existan en el sistema
4. **Probar con pocas filas primero**: Cargar 2-3 filas de prueba antes de cargar todo
5. **Revisar los mensajes de error**: El sistema reporta qué filas fallaron y por qué

## Notas Técnicas

- **Tamaño máximo**: 10 MB
- **Formatos aceptados**: .xlsx, .xls
- **Codificación**: UTF-8 (para caracteres especiales y tildes)
- **Primera fila**: Debe contener los encabezados
- **Filas vacías**: Se ignoran automáticamente

## Tips para una Carga Exitosa

1. ✅ Usar la primera fila como encabezado (nombres de columnas)
2. ✅ No dejar filas vacías entre datos
3. ✅ Eliminar filas de totales o resúmenes del Excel
4. ✅ Verificar que no haya espacios extra al inicio o final de las celdas
5. ✅ Asegurarse de que las fechas estén formateadas como fechas en Excel
6. ✅ El archivo debe pesar menos de 10 MB
7. ✅ Usar la plantilla `plantilla_carga_sla.xlsx` como referencia

## Plantilla de Excel

Puedes descargar una plantilla pre-configurada desde el sistema o crear tu propio archivo siguiendo esta estructura exacta.

### Estructura Mínima

```
BLOQUE TECH | Tipo de Solicitud | Fecha Solicitud | Fecha de Ingreso
```

¡Recuerda que todos los campos son obligatorios para cada fila de datos!
