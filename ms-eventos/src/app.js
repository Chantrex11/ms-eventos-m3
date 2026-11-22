// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// =====================================================================

const express = require('express');
const eventosRoutes = require('./routes/eventos.routes');

const app = express();

// REGISTRO DE PETICIONES HTTP
app.use((req, res, next) => {
  res.on('finish', () => {
    const metodo = req.method;
    const ruta = req.originalUrl;
    const estado = res.statusCode;
    const { idsEventos, eventoId } = res.locals;

    let detalle = '';

    if (metodo === 'GET' && estado === 200 && Array.isArray(idsEventos)) {
      detalle = idsEventos.length > 0
        ? ` | IDs consultados: ${idsEventos.join(', ')}`
        : ' | Sin eventos encontrados';
    }

    if (metodo === 'POST' && estado === 201 && eventoId != null) {
      detalle = ` | ID creado: ${eventoId}`;
    }

    if (metodo === 'PUT' && estado === 200 && eventoId != null) {
      detalle = ` | ID actualizado: ${eventoId}`;
    }

    if (metodo === 'DELETE' && estado === 204 && eventoId != null) {
      detalle = ` | ID eliminado: ${eventoId}`;
    }

    console.log(`${metodo} ${ruta} → ${estado}${detalle}`);
  });

  next();
});

// Convierte el cuerpo JSON de la petición en un objeto.
app.use(express.json());

// ENDPOINT DE SALUD
app.get('/health', (req, res) => {
  res.json({
    servicio: 'ms-eventos',
    estado: 'ok'
  });
});

// RUTAS DE EVENTOS
app.use('/eventos', eventosRoutes);

// RUTA NO ENCONTRADA
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// MANEJO CENTRALIZADO DE ERRORES
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'El cuerpo de la petición no es un JSON válido'
    });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }

  return res.status(status).json({
    error: err.message,
    detalles: err.detalles
  });
});

module.exports = app;