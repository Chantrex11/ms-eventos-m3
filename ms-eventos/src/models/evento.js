// =====================================================================
// CAPA DE MODELO (entidad)
// Define los campos de un evento y sus reglas de validación.
// =====================================================================

const TIPOS_VALIDOS = ['conferencia', 'taller', 'feria'];
const MAX_ASISTENTES = 2147483647; // Límite del INT en MySQL.

// Valida el formato, el rango de MySQL y que la fecha exista.
function fechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaObjeto = new Date(`${fecha}T00:00:00Z`);

  return (
    anio >= 1000 &&
    fechaObjeto.getUTCFullYear() === anio &&
    fechaObjeto.getUTCMonth() + 1 === mes &&
    fechaObjeto.getUTCDate() === dia
  );
}

// Devuelve una lista de errores de validación.
function validarEvento(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del evento'];
  }

  const errores = [];

  if (typeof datos.codigo !== 'string' || datos.codigo.trim() === '') {
    errores.push('codigo es obligatorio');
  } else if (datos.codigo.trim().length > 30) {
    errores.push('codigo debe tener máximo 30 caracteres');
  }

  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  } else if (datos.nombre.trim().length > 100) {
    errores.push('nombre debe tener máximo 100 caracteres');
  }

  if (!fechaValida(datos.fecha)) {
    errores.push('fecha debe tener el formato AAAA-MM-DD y ser una fecha válida');
  }

  if (
    !Number.isInteger(datos.asistentes_esperados) ||
    datos.asistentes_esperados <= 0 ||
    datos.asistentes_esperados > MAX_ASISTENTES
  ) {
    errores.push('asistentes_esperados debe ser un entero entre 1 y 2147483647');
  }

  if (
    typeof datos.tipo !== 'string' ||
    !TIPOS_VALIDOS.includes(datos.tipo.trim())
  ) {
    errores.push('tipo debe ser uno de estos valores: conferencia, taller o feria');
  }

  return errores;
}

// Construye el evento con los campos permitidos.
function construirEvento(datos) {
  return {
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados: datos.asistentes_esperados,
    tipo: datos.tipo.trim()
  };
}

module.exports = { validarEvento, construirEvento };