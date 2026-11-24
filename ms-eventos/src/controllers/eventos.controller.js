// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Lee los datos de la petición y construye las respuestas HTTP.
// =====================================================================

const service = require('../services/eventos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }

  return id;
}

// GET /eventos
// GET /eventos?tipo=taller
async function listar(req, res) {
  const filtros = {
    tipo: req.query.tipo
  };

  const eventos = await service.listar(filtros, req.get('Authorization'));

  res.locals.idsEventos = eventos.map((evento) => evento.id);

  return res.status(200).json(eventos);
}

// GET /eventos/:id
async function obtener(req, res) {
  const evento = await service.obtener(leerId(req), req.get('Authorization'));

  res.locals.idsEventos = [evento.id];

  return res.status(200).json(evento);
}

// POST /eventos
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.get('Authorization'));

  res.locals.eventoId = nuevo.id;

  return res
    .status(201)
    .location(`${req.baseUrl}/${nuevo.id}`)
    .json(nuevo);
}

// PUT /eventos/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body, req.get('Authorization'));

  res.locals.eventoId = actualizado.id;

  return res.status(200).json(actualizado);
}

// DELETE /eventos/:id
async function eliminar(req, res) {
  const id = leerId(req);

  await service.eliminar(id);

  res.locals.eventoId = id;

  return res.status(204).end();
}

function manejarAsync(funcion) {
  return (req, res, next) => {
    Promise.resolve(funcion(req, res, next)).catch(next);
  };
}

module.exports = {
  listar: manejarAsync(listar),
  obtener: manejarAsync(obtener),
  crear: manejarAsync(crear),
  actualizar: manejarAsync(actualizar),
  eliminar: manejarAsync(eliminar)
};