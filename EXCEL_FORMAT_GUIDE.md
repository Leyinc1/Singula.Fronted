# Ejemplo de Estructura del Archivo Excel

## Columnas Requeridas (ACTUALIZADO)

El archivo Excel debe contener exactamente estas columnas (pueden estar en cualquier orden):

| BLOQUE TECH            | Tipo de Solicitud | Prioridad | Fecha Solicitud | Fecha de Ingreso | Nombre Personal | Area       | Eficacia  | Observaciones         |
| ---------------------- | ----------------- | --------- | --------------- | ---------------- | --------------- | ---------- | --------- | --------------------- |
| Desarrollador Backend  | Nuevo Personal    | Alta      | 15/01/2025      | 10/02/2025       | Juan Pérez      | Desarrollo | Eficaz    | Contratación exitosa  |
| Desarrollador Frontend | Nuevo Personal    | Media     | 20/01/2025      | 05/03/2025       | María García    | Frontend   | No Eficaz | Requiere capacitación |
| QA Tester              | Reemplazo         | Crítica   | 01/02/2025      | 15/02/2025       | Carlos López    | QA         | Eficaz    |                       |
| DevOps Engineer        | Nuevo Personal    | Baja      | 10/02/2025      | 10/03/2025       |                 |            | Eficaz    |                       |
| Desarrollador Backend  | Reemplazo         | Alta      | 15/02/2025      | 01/03/2025       | Ana Martínez    | Backend    | Eficaz    | Excelente desempeño   |
| Analista de Datos      | Nuevo Personal    | Media     | 01/03/2025      | 25/03/2025       | Pedro Sánchez   | Analytics  | Eficaz    |                       |

## Reglas de Validación

### 1. BLOQUE TECH (Rol) ✅ OBLIGATORIO

- **Tipo**: Texto
- **Obligatorio**: Sí
- **Ejemplos válidos**:
  - "Desarrollador Backend"
  - "Desarrollador Frontend"
  - "Desarrollador Full Stack"
  - "QA Tester"
  - "DevOps Engineer"
  - "Analista de Datos"
  - "Arquitecto de Software"
  - "Scrum Master"
  - "Product Owner"
  - "UI/UX Designer"
  - "Administrador de Sistemas"
  - "Otro"

### 2. Tipo de Solicitud ✅ OBLIGATORIO

- **Tipo**: Texto
- **Obligatorio**: Sí
- **Valores permitidos**:
  - "Nuevo Personal"
  - "Reemplazo"
- **⚠️ Importante**: Escribir exactamente como se muestra (respetando mayúsculas y espacios)

### 3. Prioridad ✅ OBLIGATORIO (NUEVO)

- **Tipo**: Texto
- **Obligatorio**: Sí
- **Valores permitidos**:
  - "Crítica" - Urgencia máxima, atención inmediata
  - "Alta" - Importante, atender pronto
  - "Media" - Prioridad estándar
  - "Baja" - Puede esperar, no urgente
- **⚠️ Importante**: Escribir exactamente como se muestra (respetando mayúsculas y tildes)

### 4. Fecha Solicitud ✅ OBLIGATORIO

- **Tipo**: Fecha
- **Obligatorio**: Sí
- **Formatos aceptados**:
  - DD/MM/YYYY (ejemplo: 15/01/2025)
  - YYYY-MM-DD (ejemplo: 2025-01-15)
  - Formato de fecha de Excel

### 5. Fecha de Ingreso ✅ OBLIGATORIO

- **Tipo**: Fecha
- **Obligatorio**: Sí
- **Formatos aceptados**:
  - DD/MM/YYYY (ejemplo: 10/02/2025)
  - YYYY-MM-DD (ejemplo: 2025-02-10)
  - Formato de fecha de Excel
- **⚠️ Importante**: Debe ser igual o posterior a la Fecha Solicitud

### 6. Nombre Personal ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Descripción**: Nombre completo de la persona contratada
- **Ejemplo**: "Juan Pérez González"

### 7. Area ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Descripción**: Área o departamento donde trabajará
- **Ejemplos**: "Desarrollo", "QA", "Infraestructura", "Analytics"

### 8. Eficacia ✅ OBLIGATORIO (NUEVO)

- **Tipo**: Texto
- **Obligatorio**: Sí
- **Valores permitidos**:
  - "Eficaz" - La contratación cumplió con las expectativas
  - "No Eficaz" - La contratación no cumplió con las expectativas
- **⚠️ Importante**: Escribir exactamente como se muestra (respetando mayúsculas y tildes)

### 9. Observaciones ⚪ OPCIONAL

- **Tipo**: Texto
- **Obligatorio**: No
- **Descripción**: Comentarios o notas adicionales sobre la solicitud
- **Ejemplo**: "Contratación exitosa", "Requiere capacitación adicional"

## Cálculos Automáticos

El sistema calculará automáticamente:

1. **Días Transcurridos**: Diferencia entre Fecha de Ingreso y Fecha Solicitud
2. **Cumple SLA1**:
   - Solo para "Nuevo Personal"
   - ✅ Cumple si días transcurridos < 35
   - ❌ No cumple si días transcurridos ≥ 35
3. **Cumple SLA2**:
   - Solo para "Reemplazo"
   - ✅ Cumple si días transcurridos < 20
   - ❌ No cumple si días transcurridos ≥ 20

## Ejemplo Completo

### Caso 1: SLA1 Cumplido ✅

- **Rol**: Desarrollador Backend
- **Tipo**: Nuevo Personal
- **Fecha Solicitud**: 15/01/2025
- **Fecha Ingreso**: 10/02/2025
- **Días**: 26 días
- **Resultado**: ✅ Cumple SLA1 (< 35 días)

### Caso 2: SLA1 No Cumplido ❌

- **Rol**: Desarrollador Frontend
- **Tipo**: Nuevo Personal
- **Fecha Solicitud**: 20/01/2025
- **Fecha Ingreso**: 05/03/2025
- **Días**: 44 días
- **Resultado**: ❌ No cumple SLA1 (≥ 35 días)

### Caso 3: SLA2 Cumplido ✅

- **Rol**: QA Tester
- **Tipo**: Reemplazo
- **Fecha Solicitud**: 01/02/2025
- **Fecha Ingreso**: 15/02/2025
- **Días**: 14 días
- **Resultado**: ✅ Cumple SLA2 (< 20 días)

### Caso 4: SLA2 No Cumplido ❌

- **Rol**: DevOps Engineer
- **Tipo**: Reemplazo
- **Fecha Solicitud**: 01/02/2025
- **Fecha Ingreso**: 25/02/2025
- **Días**: 24 días
- **Resultado**: ❌ No cumple SLA2 (≥ 20 días)

## Errores Comunes

### ❌ Error: "Formato de fecha inválido"

**Problema**: La fecha no está en un formato reconocido
**Solución**: Usar formato DD/MM/YYYY o YYYY-MM-DD

### ❌ Error: "Tipo de solicitud inválido"

**Problema**: El texto no es exactamente "Nuevo Personal" o "Reemplazo"
**Solución**: Copiar y pegar los valores exactos

### ❌ Error: "Fecha de ingreso anterior a fecha de solicitud"

**Problema**: La Fecha de Ingreso es anterior a la Fecha Solicitud
**Solución**: Verificar que las fechas sean lógicas

### ❌ Error: "Columna requerida faltante"

**Problema**: Falta alguna de las 4 columnas obligatorias
**Solución**: Asegurarse de que las 4 columnas estén presentes

## Tips para una Carga Exitosa

1. ✅ Usar la primera fila como encabezado (nombres de columnas)
2. ✅ No dejar filas vacías entre datos
3. ✅ Eliminar filas de totales o resúmenes del Excel
4. ✅ Verificar que no haya espacios extra al inicio o final de las celdas
5. ✅ Asegurarse de que las fechas estén formateadas como fechas en Excel
6. ✅ El archivo debe pesar menos de 10 MB
7. ✅ Formatos aceptados: .xlsx, .xls

## Plantilla de Excel

Puedes descargar una plantilla pre-configurada desde el sistema o crear tu propio archivo siguiendo esta estructura exacta.

### Estructura Mínima

```
BLOQUE TECH | Tipo de Solicitud | Fecha Solicitud | Fecha de Ingreso
```

¡Recuerda que todos los campos son obligatorios para cada fila de datos!
