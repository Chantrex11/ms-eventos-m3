// =====================================================================
// CLIENTE HTTP de ms-patrocinadores, para el microservicio de eventos.
// Copie este archivo en ms-eventos/src/clients/ y COMPLÉTELO:
// la función pedir() ya está hecha; faltan las funciones que usan
// la validación, la regla de negocio y la composición.
// En el .env de ms-eventos:  PATROCINADORES_URL=http://127.0.0.1:3012
// =====================================================================
const HttpError = require('../utils/http-error');
const PATROCINADORES_URL = process.env.PATROCINADORES_URL;

// Hace una petición GET a ms-patrocinadores reenviando el token del usuario.
// Devuelve la respuesta de fetch, o null si ms-patrocinadores no respondió.
async function pedir(ruta, token) {
  try {
    return await fetch(`${PATROCINADORES_URL}${ruta}`, {
      headers: { Authorization: token },     // el token de la petición original
      signal: AbortSignal.timeout(3000),      // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                              // ms-patrocinadores caído o sin responder
  }
}

// Ejemplo de uso:
//   const respuesta = await pedir('/patrocinadores/3', token);
//   if (!respuesta) ...                   → ms-patrocinadores no respondió
//   if (respuesta.status === 404) ...     → no existe
//   const datos = await respuesta.json(); → el objeto (o el arreglo, con ?ids=)

// Comprueba la referencia antes de insertar o actualizar un evento.
async function validarExistencia(id, token) {
  const respuesta = await pedir('/patrocinadores/' + id, token);
  if (!respuesta) {
    throw new HttpError(503, 'ms-patrocinadores no responde');
  }
  if (respuesta.status === 404) {
    throw new HttpError(400, 'No existe el patrocinador con id ' + id);
  }
  if (respuesta.status === 401 || respuesta.status === 403) {
    throw new HttpError(respuesta.status, 'ms-patrocinadores rechazo la autorizacion del usuario');
  }
  if (!respuesta.ok) {
    throw new HttpError(503, 'ms-patrocinadores no esta disponible');
  }

  try {
    const patrocinador = await respuesta.json();
    if (!patrocinador || patrocinador.id !== id || typeof patrocinador.estado_contrato !== 'string') {
      throw new Error('Respuesta de patrocinador invalida');
    }
    return patrocinador;
  } catch (error) {
    throw new HttpError(503, 'ms-patrocinadores devolvio una respuesta invalida');
  }
}

// Consulta todos los IDs distintos en una sola peticion.
async function consultarPorIds(ids, token) {
  const unicos = [...new Set(ids)];
  if (unicos.length === 0) return [];
  const respuesta = await pedir('/patrocinadores?ids=' + unicos.join(','), token);
  if (!respuesta || !respuesta.ok) return null;
  try {
    const datos = await respuesta.json();
    if (!Array.isArray(datos) || datos.some(p => !p || !Number.isInteger(p.id) || typeof p.empresa !== 'string' || typeof p.sector !== 'string')) {
      return null;
    }
    return datos;
  } catch (error) {
    return null;
  }
}

module.exports = { pedir, validarExistencia, consultarPorIds };
