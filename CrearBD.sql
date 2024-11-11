CREATE DATABASE 'MDA';

-- Crear la tabla Usuarios
CREATE TABLE Usuarios (
    usuario_id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(10) CHECK (rol IN ('admin', 'cliente')) NOT NULL,
    estado VARCHAR(10) CHECK (estado IN ('activo', 'inactivo')) NOT NULL
);

-- Crear la tabla Categorías
CREATE TABLE Categorias (
    categoria_id UUID PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

-- Crear la tabla Productos
CREATE TABLE Productos (
    producto_id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    cantidad_piezas INT NOT NULL,
    imagen VARCHAR(255),
    estado VARCHAR(10) CHECK (estado IN ('activo', 'inactivo')) NOT NULL
);

-- Crear la tabla ProductosCategorias para permitir múltiples categorías por producto
CREATE TABLE ProductosCategorias (
    producto_id UUID REFERENCES Productos(producto_id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES Categorias(categoria_id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, categoria_id)
);

-- Crear la tabla EstadosPedidos
CREATE TABLE EstadosPedidos (
    estado_id UUID PRIMARY KEY,
    estado_nombre VARCHAR(50) NOT NULL
);

-- Crear la tabla Pedidos
CREATE TABLE Pedidos (
    pedido_id UUID PRIMARY KEY,
    usuario_id UUID REFERENCES Usuarios(usuario_id) ON DELETE SET NULL,
    fecha_pedido TIMESTAMP NOT NULL,
    estado_id UUID REFERENCES EstadosPedidos(estado_id) ON DELETE SET NULL,
    direccion VARCHAR(255) NOT NULL,
    notas TEXT,
    total DECIMAL(10, 2) NOT NULL
);

-- Crear la tabla DetallesPedido
CREATE TABLE DetallesPedido (
    detalle_pedido_id UUID PRIMARY KEY,
    pedido_id UUID REFERENCES Pedidos(pedido_id) ON DELETE CASCADE,
    producto_id UUID REFERENCES Productos(producto_id) ON DELETE SET NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Crear la tabla ReportesVentas
CREATE TABLE ReportesVentas (
    reporte_id UUID PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total_ventas DECIMAL(10, 2) NOT NULL,
    numero_pedidos INT NOT NULL
);

-- Crear la tabla HistorialEstadosPedidos
CREATE TABLE HistorialEstadosPedidos (
    historial_id UUID PRIMARY KEY,
    pedido_id UUID REFERENCES Pedidos(pedido_id) ON DELETE CASCADE,
    fecha_cambio TIMESTAMP NOT NULL,
    estado_anterior_id UUID REFERENCES EstadosPedidos(estado_id),
    estado_nuevo_id UUID REFERENCES EstadosPedidos(estado_id),
    motivo TEXT
);

-- Crear índices en campos que podrían ser consultados frecuentemente
CREATE INDEX idx_usuarios_estado ON Usuarios (estado);
CREATE INDEX idx_pedidos_fecha_pedido ON Pedidos (fecha_pedido);
CREATE INDEX idx_historial_fecha_cambio ON HistorialEstadosPedidos (fecha_cambio);
