# 🔧 Guía de Implementación Backend - Singula SLA

## Resumen Ejecutivo

El frontend está **100% completado y listo para comunicarse**. Este documento describe EXACTAMENTE qué implementar en el backend para que funcione.

---

## 1️⃣ Paso 1: Endpoints Públicos (Sin Autenticación)

Estos **deben ser públicos** porque son catálogos de referencia que cualquier usuario necesita.

### `RolRegistroController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class RolRegistroController : ControllerBase
{
    private readonly IRepository<RolRegistro> _repository;

    public RolRegistroController(IRepository<RolRegistro> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    // NO agregar [Authorize] aquí - debe ser público
    public async Task<ActionResult<IEnumerable<object>>> GetRoles()
    {
        try
        {
            var roles = await _repository.GetAllAsync();

            var response = roles.Select(r => new
            {
                r.IdRolRegistro,
                r.NombreRol,
                r.Descripcion,
                BloqueTech = "Tech", // O valor de la BD si existe
                Icon = "dns",        // O valor de la BD si existe
                Color = "#0066cc",   // O valor de la BD si existe
                EsActivo = true      // O valor de la BD si existe
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

### `TipoSolicitudCatalogoController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class TipoSolicitudCatalogoController : ControllerBase
{
    private readonly IRepository<TipoSolicitudCatalogo> _repository;

    public TipoSolicitudCatalogoController(IRepository<TipoSolicitudCatalogo> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    // NO agregar [Authorize] aquí - debe ser público
    public async Task<ActionResult<IEnumerable<object>>> GetTipos()
    {
        try
        {
            var tipos = await _repository.GetAllAsync();

            var response = tipos.Select(t => new
            {
                t.IdTipoSolicitud,
                t.Codigo,
                t.Descripcion,
                t.Sla
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

### `EstadoSolicitudCatalogoController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class EstadoSolicitudCatalogoController : ControllerBase
{
    private readonly IRepository<EstadoSolicitudCatalogo> _repository;

    public EstadoSolicitudCatalogoController(IRepository<EstadoSolicitudCatalogo> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    // NO agregar [Authorize] aquí - debe ser público
    public async Task<ActionResult<IEnumerable<object>>> GetEstados()
    {
        try
        {
            var estados = await _repository.GetAllAsync();

            var response = estados.Select(e => new
            {
                e.IdEstadoSolicitud,
                e.Codigo,
                e.Descripcion,
                Icon = "hourglass_empty", // O valor de la BD si existe
                Color = "orange"          // O valor de la BD si existe
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

---

## 2️⃣ Paso 2: SlaController - Operaciones Autenticadas

Este controlador maneja las operaciones de SLA (requiere autenticación).

### `SlaController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Requerido para estos endpoints
public class SlaController : ControllerBase
{
    private readonly ISlaService _slaService;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IConfigurationCatalogService _configService;
    private readonly ILogger<SlaController> _logger;

    public SlaController(
        ISlaService slaService,
        IWebHostEnvironment webHostEnvironment,
        IConfigurationCatalogService configService,
        ILogger<SlaController> logger)
    {
        _slaService = slaService;
        _webHostEnvironment = webHostEnvironment;
        _configService = configService;
        _logger = logger;
    }

    /// <summary>
    /// Subir archivo Excel con datos de SLA
    /// POST /api/sla/upload
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadExcel([FromForm] IFormFile file)
    {
        try
        {
            // Validar archivo
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Archivo vacío" });

            const long maxFileSize = 10 * 1024 * 1024; // 10 MB
            if (file.Length > maxFileSize)
                return BadRequest(new { error = "Archivo muy grande (máx. 10 MB)" });

            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { error = "Solo se permiten archivos .xlsx o .xls" });

            // Crear carpeta si no existe
            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "sla");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Guardar archivo con nombre único
            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileName}_{DateTime.Now:yyyyMMdd_HHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Procesar Excel (tu lógica aquí)
            var result = await _slaService.ProcessExcelFile(filePath);

            return Ok(new
            {
                fileName = file.FileName,
                path = $"/uploads/sla/{uniqueFileName}",
                recordsProcessed = result.RecordCount,
                message = "Archivo procesado exitosamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar archivo Excel");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Crear solicitud SLA manualmente
    /// POST /api/sla/manual
    /// </summary>
    [HttpPost("manual")]
    public async Task<IActionResult> CreateManualEntry([FromBody] CreateSlaRequest request)
    {
        try
        {
            // Validar datos
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Crear solicitud
            var solicitud = new Solicitud
            {
                BloqueTech = request.BloqueTech,
                TipoSolicitud = request.TipoSolicitud,
                Prioridad = request.Prioridad,
                FechaSolicitud = request.FechaSolicitud,
                FechaIngreso = request.FechaIngreso,
                NombrePersonal = request.NombrePersonal,
                Observaciones = request.Observaciones
            };

            // Calcular SLA
            var slaConfig = await _configService.GetSlaConfig(request.TipoSolicitud, request.Prioridad);
            var diasTranscurridos = (request.FechaIngreso - request.FechaSolicitud).Days;

            solicitud.DiasTranscurridos = diasTranscurridos;
            solicitud.CumpleSla1 = request.TipoSolicitud == "Nuevo Personal" && diasTranscurridos <= 35;
            solicitud.CumpleSla2 = request.TipoSolicitud == "Reemplazo" && diasTranscurridos <= 20;

            // Guardar en BD
            var created = await _slaService.CreateSolicitud(solicitud);

            return CreatedAtAction(nameof(GetSlaData), new { id = created.Id }, new
            {
                id = created.Id,
                bloqueTech = created.BloqueTech,
                tipoSolicitud = created.TipoSolicitud,
                prioridad = created.Prioridad,
                fechaSolicitud = created.FechaSolicitud,
                fechaIngreso = created.FechaIngreso,
                diasTranscurridos = created.DiasTranscurridos,
                cumpleSla1 = created.CumpleSla1,
                cumpleSla2 = created.CumpleSla2,
                nombrePersonal = created.NombrePersonal,
                observaciones = created.Observaciones,
                message = "Solicitud creada exitosamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear solicitud manual");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener datos SLA con filtros opcionales
    /// GET /api/sla/data?start_date=2025-01-01&end_date=2025-12-31&bloque_tech=Backend&tipo_solicitud=Nuevo%20Personal
    /// </summary>
    [HttpGet("data")]
    public async Task<IActionResult> GetSlaData(
        [FromQuery] DateTime? start_date = null,
        [FromQuery] DateTime? end_date = null,
        [FromQuery] string bloque_tech = null,
        [FromQuery] string tipo_solicitud = null)
    {
        try
        {
            var query = await _slaService.GetSolicitudesAsync();

            // Aplicar filtros
            if (start_date.HasValue)
                query = query.Where(s => s.FechaSolicitud >= start_date.Value);

            if (end_date.HasValue)
                query = query.Where(s => s.FechaSolicitud <= end_date.Value);

            if (!string.IsNullOrEmpty(bloque_tech))
                query = query.Where(s => s.BloqueTech == bloque_tech);

            if (!string.IsNullOrEmpty(tipo_solicitud))
                query = query.Where(s => s.TipoSolicitud == tipo_solicitud);

            var data = query.Select(s => new
            {
                s.Id,
                bloque_tech = s.BloqueTech,
                tipo_solicitud = s.TipoSolicitud,
                s.Prioridad,
                fecha_solicitud = s.FechaSolicitud,
                fecha_ingreso = s.FechaIngreso,
                dias_transcurridos = s.DiasTranscurridos,
                cumple_sla1 = s.CumpleSla1,
                cumple_sla2 = s.CumpleSla2,
                nombre_personal = s.NombrePersonal
            });

            return Ok(new { data = data.ToList() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos SLA");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

---

## 3️⃣ Paso 3: DTOs

Crea estos DTOs en la carpeta `Models/Dto`:

### `CreateSlaRequest.cs`

```csharp
using System.ComponentModel.DataAnnotations;

public class CreateSlaRequest
{
    [Required]
    public string BloqueTech { get; set; }

    [Required]
    public string TipoSolicitud { get; set; }

    [Required]
    public string Prioridad { get; set; }

    [Required]
    public DateTime FechaSolicitud { get; set; }

    [Required]
    public DateTime FechaIngreso { get; set; }

    [Required]
    public string NombrePersonal { get; set; }

    public string Observaciones { get; set; }
}
```

---

## 4️⃣ Paso 4: Servicios (Optional but Recommended)

### `ISlaService.cs`

```csharp
public interface ISlaService
{
    Task<Solicitud> CreateSolicitud(Solicitud solicitud);
    Task<IQueryable<Solicitud>> GetSolicitudesAsync();
    Task<ProcessExcelResult> ProcessExcelFile(string filePath);
}

public class ProcessExcelResult
{
    public int RecordCount { get; set; }
    public int ErrorCount { get; set; }
    public List<string> Errors { get; set; }
}
```

---

## 5️⃣ Paso 5: Configurar wwwroot en Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... otros servicios ...

var app = builder.Build();

// ✅ HABILITAR ARCHIVOS ESTÁTICOS
app.UseStaticFiles();

// ✅ CORS PRIMERO
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

## 6️⃣ Paso 6: Crear Carpeta de Uploads

En el proyecto backend, crea esta carpeta:

```
wwwroot/
└── uploads/
    └── sla/          ← Aquí se guardarán los archivos Excel
```

Si no existe `wwwroot`, créala en la raíz del proyecto.

---

## ✅ Checklist Final

- [ ] Controlador `RolRegistroController` con GET público
- [ ] Controlador `TipoSolicitudCatalogoController` con GET público
- [ ] Controlador `EstadoSolicitudCatalogoController` con GET público
- [ ] Controlador `SlaController` con:
  - [ ] POST `/upload` (multipart/form-data)
  - [ ] POST `/manual` (JSON)
  - [ ] GET `/data` (con filtros)
- [ ] DTO `CreateSlaRequest`
- [ ] Servicio `ISlaService` (opcional)
- [ ] `app.UseStaticFiles()` en Program.cs
- [ ] CORS configurado y `app.UseCors()` ANTES de autenticación
- [ ] Carpeta `wwwroot/uploads/sla/` creada
- [ ] Backend reiniciado

---

## 🧪 Prueba Final

Una vez implementado, el frontend automáticamente:

1. Cargará los catálogos en los combobox
2. Permitirá subir archivos Excel
3. Permitirá crear solicitudes manuales
4. Mostrará datos en el dashboard

**Sin cambios adicionales en el frontend.**

---

## 📞 Soporte

Si hay preguntas sobre qué espera exactamente el frontend, consulta:

- `BACKEND_REQUIREMENTS.md` - Estructura de respuestas
- `src/stores/configStore.js` - Mapeo de datos
- `src/services/slaService.js` - Llamadas HTTP
- `src/components/ui/FileUpload.vue` - Componente de carga
