const repo = require('../repositories/eventos.repository');
const { validarEvento, construirEvento } = require('../models/evento');
const HttpError = require('../utils/http-error');

function validarDatos(datos) {
  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  return construirEvento(datos);
}

// Listar eventos, con filtro opcional por tipo.
async function listar(filtros = {}) {
  const { tipo } = filtros;

  if (tipo !== undefined && (typeof tipo !== 'string' || tipo.trim() === '')) {
    throw new HttpError(400, 'tipo debe ser un texto no vacío');
  }

  return repo.findAll({ tipo: tipo?.trim() });
}

// Obtener un evento por ID.
async function obtener(id) {
  const evento = await repo.findById(id);

  if (!evento) {
    throw new HttpError(404, `No existe el evento con id ${id}`);
  }

  return evento;
}

// Crear un evento.
async function crear(datos) {
  const evento = validarDatos(datos);

  try {
    return await repo.create(evento);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'El código del evento ya está registrado');
    }

    throw error;
  }
}

// Actualizar un evento.
async function actualizar(id, datos) {
  const evento = validarDatos(datos);
  let actualizado;

  try {
    actualizado = await repo.update(id, evento);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'El código del evento ya está registrado');
    }

    throw error;
  }

  if (!actualizado) {
    throw new HttpError(404, `No existe el evento con id ${id}`);
  }

  return actualizado;
}

// Eliminar un evento.
async function eliminar(id) {
  const eliminado = await repo.remove(id);

  if (!eliminado) {
    throw new HttpError(404, `No existe el evento con id ${id}`);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};