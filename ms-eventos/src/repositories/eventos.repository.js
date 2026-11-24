// =====================================================================
// CAPA DE ACCESO A DATOS (REPOSITORIO)
// Microservicio: ms-eventos
// Tabla: eventos
// =====================================================================

const pool = require('../db');

const COLUMNAS = `
  id,
  codigo,
  nombre,
  DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
  asistentes_esperados,
  tipo,
  patrocinador_id
`;

// Consultar todos los eventos, con filtro opcional por tipo.
async function findAll(filtros = {}) {
  let sql = `SELECT ${COLUMNAS} FROM eventos`;
  const valores = [];

  if (filtros.tipo) {
    sql += ' WHERE tipo = ?';
    valores.push(filtros.tipo);
  }

  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

// Buscar un evento por ID.
async function findById(id) {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM eventos WHERE id = ?`,
    [id]
  );

  return filas[0] ?? null;
}

// Buscar un evento por código.
async function findByCodigo(codigo) {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM eventos WHERE codigo = ?`,
    [codigo]
  );

  return filas[0] ?? null;
}

// Registrar un evento.
async function create(evento) {
  const [resultado] = await pool.query(
    `INSERT INTO eventos
     (codigo, nombre, fecha, asistentes_esperados, tipo, patrocinador_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      evento.codigo,
      evento.nombre,
      evento.fecha,
      evento.asistentes_esperados,
      evento.tipo,
      evento.patrocinador_id
    ]
  );

  return findById(resultado.insertId);
}

// Actualizar un evento y devolver el registro.
async function update(id, evento) {
  await pool.query(
    `UPDATE eventos
     SET codigo = ?, nombre = ?, fecha = ?,
         asistentes_esperados = ?, tipo = ?, patrocinador_id = ?
     WHERE id = ?`,
    [
      evento.codigo,
      evento.nombre,
      evento.fecha,
      evento.asistentes_esperados,
      evento.tipo,
      evento.patrocinador_id,
      id
    ]
  );

  return findById(id);
}

// Eliminar un evento e indicar si existía.
async function remove(id) {
  const [resultado] = await pool.query(
    'DELETE FROM eventos WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByCodigo,
  create,
  update,
  remove
};