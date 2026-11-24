const patrocinadores = require('../clients/patrocinadores.client');
const repo = require('../repositories/eventos.repository');
const { validarEvento, construirEvento } = require('../models/evento');
const HttpError = require('../utils/http-error');

// Ficha 6: rechazar patrocinadores cuyo contrato esta vencido.
async function validarPatrocinador(id, token) {
  const patrocinador = await patrocinadores.validarExistencia(id, token);
  if (patrocinador.estado_contrato === 'vencido') {
    throw new HttpError(409, 'El patrocinador tiene el contrato vencido');
  }
  return patrocinador;
}

function conPatrocinador(evento, patrocinador, aviso) {
  return {
    ...evento,
    patrocinador: patrocinador ? {
      id: patrocinador.id,
      empresa: patrocinador.empresa,
      sector: patrocinador.sector
    } : null,
    ...(aviso ? { aviso } : {})
  };
}

async function componer(eventos, token) {
  if (eventos.length === 0) return [];
  const datos = await patrocinadores.consultarPorIds(eventos.map(e => e.patrocinador_id), token);
  const porId = new Map((datos || []).map(p => [p.id, p]));
  return eventos.map(evento => {
    const patrocinador = porId.get(evento.patrocinador_id);
    const aviso = patrocinador ? undefined : datos === null
      ? 'No se pudo consultar ms-patrocinadores'
      : 'El patrocinador asociado no existe en el proveedor';
    return conPatrocinador(evento, patrocinador, aviso);
  });
}

function validarDatos(datos) {
  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  return construirEvento(datos);
}

// Listar eventos, con filtro opcional por tipo.
async function listar(filtros = {}, token) {
  const { tipo } = filtros;

  if (tipo !== undefined && (typeof tipo !== 'string' || tipo.trim() === '')) {
    throw new HttpError(400, 'tipo debe ser un texto no vacío');
  }

  const eventos = await repo.findAll({ tipo: tipo?.trim() });
  return componer(eventos, token);
}

// Obtener un evento por ID.
async function obtener(id, token) {
  const evento = await repo.findById(id);

  if (!evento) {
    throw new HttpError(404, `No existe el evento con id ${id}`);
  }

  return (await componer([evento], token))[0];
}

// Crear un evento.
async function crear(datos, token) {
  const evento = validarDatos(datos);
  const patrocinador = await validarPatrocinador(evento.patrocinador_id, token);

  try {
    const nuevo = await repo.create(evento);
    return conPatrocinador(nuevo, patrocinador);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'El código del evento ya está registrado');
    }

    throw error;
  }
}

// Actualizar un evento.
async function actualizar(id, datos, token) {
  const evento = validarDatos(datos);
  const patrocinador = await validarPatrocinador(evento.patrocinador_id, token);
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

  return conPatrocinador(actualizado, patrocinador);
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