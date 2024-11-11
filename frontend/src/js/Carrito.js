// Carrito.js
import '../css/ProductosAdministrador.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import axios from 'axios';

// Componente de tarjeta de producto
function ProductCard({ product, cantidad, incrementarCantidad, disminuirCantidad, onDelete }) {
    const imagen = `http://localhost:8081${product.imagen}`;

    const handleEliminarDelCarrito = () => {
        console.log(product.producto_id);
        console.log(product.usuario_id);
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        axios
            .post('http://localhost:8081/eliminarDelCarrito', {
                producto_id: product.producto_id,
                usuario_id: product.usuario_id
            })
            .then(() => {
                onDelete(product.producto_id);
            })
            .catch((err) => {
                console.error('Error al eliminar del carrito:', err);
            });
    };

    return (
        <div className="product-card">
            <img src={imagen} alt={`Imagen de ${product.nombre}`} className="product-image" />
            <h3 className="product-name">{product.nombre} ({product.cantidad_piezas} pz)</h3>
            <p className="product-description">{product.descripcion}</p>
            <p className="product-price">${parseFloat(product.precio) * cantidad}</p>
            <div className='producto-actions'>
                <button className="cantidad-btn" onClick={() => disminuirCantidad(product.producto_id)}>-</button>
                <span>{cantidad}</span>
                <button className="cantidad-btn" onClick={() => incrementarCantidad(product.producto_id)}>+</button>
            </div>
            <button className="carrito-btn" onClick={handleEliminarDelCarrito}>
                Eliminar del carrito 🗑️
            </button>
        </div>
    );
}

function Carrito() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const location = useLocation();
    const { usuarioId, rol } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`http://localhost:8081/obtenerCarrito/${usuarioId}`, {
                params: { idUsuario: usuarioId }
            })
            .then((response) => {
                if (response.data && response.data.carrito) {
                    const carrito = response.data.carrito;
                    setProductos(carrito);
                    // Inicializar las cantidades para cada producto
                    const cantidadesIniciales = carrito.reduce((acc, product) => {
                        acc[product.producto_id] = product.cantidad;
                        return acc;
                    }, {});
                    setCantidades(cantidadesIniciales);
                } else {
                    console.log("No se encontraron productos en el carrito");
                }
            })
            .catch((err) => {
                console.error('Error al cargar el carrito:', err);
            });
    }, [usuarioId]);

    const incrementarCantidad = (productoId) => {
        setCantidades((prevCantidades) => ({
            ...prevCantidades,
            [productoId]: prevCantidades[productoId] + 1,
        }));
    };

    const disminuirCantidad = (productoId) => {
        setCantidades((prevCantidades) => ({
            ...prevCantidades,
            [productoId]: Math.max(prevCantidades[productoId] - 1, 1),
        }));
    };

    const handleDeleteProducto = (productoId) => {
        setProductos((prevProductos) =>
            prevProductos.filter((producto) => producto.producto_id !== productoId)
        );
        const { [productoId]: _, ...rest } = cantidades;
        setCantidades(rest);
    };

    // Calcular el total basado en las cantidades actuales
    const total = productos.reduce((sum, product) => {
        const cantidad = cantidades[product.producto_id] || 1;
        return sum + parseFloat(product.precio) * cantidad;
    }, 0);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="inicio-cliente">
            <header className="header">
                <div className="menu-icon" onClick={toggleMenu}>
                    <FaBars size={24} />
                </div>

                <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/productos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Productos</Link>
                    <Link to="/pedidos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Pedidos</Link>
                    <Link to="/carrito" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Carrito</Link>
                    <Link to={`/perfil/${usuarioId}`} state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Perfil</Link>
                    <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
                    <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav>
            </header>
            <main className="main-content-productos-admin">
                <h1>Carrito de compras:</h1>
                <div className="product-grid">
                    {productos.map((product) => (
                        <ProductCard
                            key={product.producto_id}
                            product={product}
                            cantidad={cantidades[product.producto_id]}
                            incrementarCantidad={incrementarCantidad}
                            disminuirCantidad={disminuirCantidad}
                            onDelete={handleDeleteProducto}
                        />
                    ))}
                </div>
                <div className="carrito-extra">
                    <h2>Notas:</h2>
                    <textarea className="notas" placeholder="Escribe tus notas aquí..."></textarea>
                    <input className='direccion' type="text" placeholder="Escribe tu dirección aquí..."></input>
                </div>
                <div className="carrito-final">
                    <label className="total">Total: ${total.toFixed(2)}</label>
                    <button className="comprar">Comprar</button>
                </div>
            </main>
        </div>
    );
}

export default Carrito;
