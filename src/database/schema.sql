-- ============================================
-- Guardian AI - Esquema de base de datos
-- PostgreSQL 14+
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabla: usuarios
-- Un usuario se crea automaticamente la primera
-- vez que inicia sesion (a partir del JWT de Clerk)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id    VARCHAR(255) UNIQUE NOT NULL,
    nombre      VARCHAR(255),
    email       VARCHAR(255) UNIQUE,
    foto        TEXT,
    creado      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios (clerk_id);

-- ============================================
-- Tabla: analisis
-- Cada analisis pertenece a un usuario registrado.
-- Los invitados nunca generan filas aqui.
-- ============================================
CREATE TABLE IF NOT EXISTS analisis (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_audio  VARCHAR(255),
    riesgo        INTEGER CHECK (riesgo BETWEEN 0 AND 100),
    resumen       TEXT,
    recomendacion TEXT,
    fecha         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analisis_usuario_id ON analisis (usuario_id);
CREATE INDEX IF NOT EXISTS idx_analisis_fecha ON analisis (fecha DESC);

-- ============================================
-- Tabla: tecnicas
-- Tecnicas de ingenieria social detectadas
-- en un analisis (relacion N a 1 con analisis)
-- ============================================
CREATE TABLE IF NOT EXISTS tecnicas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analisis_id UUID NOT NULL REFERENCES analisis(id) ON DELETE CASCADE,
    tecnica     VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tecnicas_analisis_id ON tecnicas (analisis_id);

-- ============================================
-- Tabla: frases
-- Frases textuales extraidas del audio/transcripcion
-- que respaldan el analisis (relacion N a 1 con analisis)
-- ============================================
CREATE TABLE IF NOT EXISTS frases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analisis_id UUID NOT NULL REFERENCES analisis(id) ON DELETE CASCADE,
    frase       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_frases_analisis_id ON frases (analisis_id);

-- ============================================
-- Trigger para mantener "actualizado" al dia
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_actualizado ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
