-- IMPORTANTE: Actualización de la tabla usuarios para soportar autenticación JWT
-- La columna Contraseña debe tener VARCHAR(255) para almacenar hashes bcrypt

-- Verificar la estructura actual
DESCRIBE usuarios;

-- Actualizar la columna Contraseña de VARCHAR(40) a VARCHAR(255)
ALTER TABLE usuarios MODIFY COLUMN Contraseña VARCHAR(255);

-- Verificar que el cambio se aplicó correctamente
DESCRIBE usuarios;

-- NOTA: Los hashes bcrypt generan cadenas de ~60 caracteres, pero usamos 255 para flexibilidad
