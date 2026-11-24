CREATE DATABASE IF NOT EXISTS eventos_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE eventos_db;

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    asistentes_esperados INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    patrocinador_id INT NOT NULL,

    CONSTRAINT chk_patrocinador CHECK (patrocinador_id > 0),

    CONSTRAINT chk_asistentes
        CHECK (asistentes_esperados > 0),

    CONSTRAINT chk_tipo
        CHECK (tipo IN ('conferencia', 'taller', 'feria'))
);

INSERT INTO eventos
(codigo, nombre, fecha, asistentes_esperados, tipo, patrocinador_id)
VALUES
('EVT-001', 'Conferencia de Tecnologia', '2026-12-10', 120, 'conferencia', 1),
('EVT-002', 'Taller de Programacion', '2026-12-15', 35, 'taller', 2),
('EVT-003', 'Feria de Innovacion', '2026-12-20', 200, 'feria', 4);