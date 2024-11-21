// Carrito.js
import '../css/ProductosAdministrador.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [notas, setNotas] = useState('');
    const [direccion, setDireccion] = useState({
        calle: '',
        numeroExterior: '',
        numeroInterior: '',
        colonia: '',
        ciudad: '',
        entreCalle1: '',
        entreCalle2: ''
    });
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

    const handleInputChange = (field, value) => {
        setDireccion((prevDireccion) => ({
            ...prevDireccion,
            [field]: value
        }));
    };

    const handleRealizarPedido = () => {
        if (!notas || Object.values(direccion).some((campo) => !campo)) {
            toast.error('Por favor, complete todos los campos.');
            return;
        }

        // Construir la dirección concatenada
        const direccionCompleta = `${direccion.calle} ${direccion.numeroExterior}${direccion.numeroInterior ? ' Int. ' + direccion.numeroInterior : ''}, ${direccion.colonia}, ${direccion.ciudad}. Entre ${direccion.entreCalle1} y ${direccion.entreCalle2}`;

        axios
            .post('http://localhost:8081/realizarPedido', {
                usuario_id: usuarioId,
                direccion: direccionCompleta,
                notas,
                productos: productos.map((product) => ({
                    producto_id: product.producto_id,
                    cantidad: cantidades[product.producto_id],
                    precio_unitario: product.precio
                }))
            })
            .then(response => {
                console.log('Pedido realizado con éxito:', response.data);
                toast.success('Pedido realizado con éxito.');
                setTimeout(() => {
                    navigate('/pedidos', { state: { usuarioId, rol } });
                    window.location.reload();
                }, 1000);

            })
            .catch(error => {
                toast.error('Error al realizar el pedido.');
                console.error('Error al realizar el pedido:', error);
            });
    };

    const total = productos.reduce((sum, product) => {
        const cantidad = cantidades[product.producto_id] || 1;
        return sum + parseFloat(product.precio) * cantidad;
    }, 0);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                    <button className="menu-item" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>Cerrar sesión</button>
                </nav>
            </header>
            <main className="main-content-productos-admin">
                <h1>Carrito de compras:</h1>
                <div className="product-grid">
                    {productos.length === 0 ? <p>No hay productos en el carrito.</p> :
                        productos.map((product) => (
                            <ProductCard
                                key={product.producto_id}
                                product={product}
                                cantidad={cantidades[product.producto_id]}
                                incrementarCantidad={incrementarCantidad}
                                disminuirCantidad={disminuirCantidad}
                            />
                        ))}
                </div>
                {productos.length > 0 && (
                    <>
                        <div className="carrito-extra">
                            <h2>Notas:</h2>
                            <textarea className="notas" placeholder="Escribe tus notas aquí..." onChange={(e) => setNotas(e.target.value)}></textarea>
                            <h2>Dirección:</h2>
                            <div className='direccion-inputs'>
                                <input type="text" className="input" placeholder="Calle" onChange={(e) => handleInputChange('calle', e.target.value)} />
                                <input type="text" className="input" placeholder="Número exterior" onChange={(e) => handleInputChange('numeroExterior', e.target.value)} />
                                <input type="text" className="input" placeholder="Número interior" onChange={(e) => handleInputChange('numeroInterior', e.target.value)} />
                                <input type="text" className="input" placeholder="Colonia" onChange={(e) => handleInputChange('colonia', e.target.value)} />
                                <input type="text" className="input" placeholder="Ciudad" onChange={(e) => handleInputChange('ciudad', e.target.value)} />
                                <input type="text" className="input" placeholder="Entre calle 1" onChange={(e) => handleInputChange('entreCalle1', e.target.value)} />
                                <input type="text" className="input" placeholder="Entre calle 2" onChange={(e) => handleInputChange('entreCalle2', e.target.value)} />
                            </div>
                            <div className='alerta'>
                                <label>Instrucciones: 
                                    <ul>
                                        <li>1. Al realizar el pedido tendrás que esperar a que se te asigne una fecha de entrega estimada.</li>
                                        <br />
                                        <li>2. Al tener tu fecha de entrega estimada tendras que hacer una transferencia de ${total.toFixed(2) * 0.5} a la <strong>cuenta: 1234-5678-9012-3456.</strong>
                                            Ingresando los primeros 5 digitos de tu <strong>ID de pedido</strong> en el concepto para poder continuar con el proceso.</li>
                                        <br />
                                        <li>3. Al recibir la transferencia tu pedido estará listo para ser preparado.</li>
                                        <br />
                                        <li>TU <strong>ID DE PEDIDO</strong> LO PODRAS ENCONTRAR EN TUS PEDIDOS.</li>
                                        <br />
                                        <li>LA <strong>CUENTA</strong> DONDE REALIZARAS LA TRANSFERENCIA LA PODRAS ENCONTRAR EN LOS DETALLES DE DICHO PEDIDO.</li>
                                    </ul>
                                </label>
                            </div>
                        </div>
                        <div className="carrito-final">
                            <label className="total">Total: ${total.toFixed(2)}</label>
                            <button className="comprar" onClick={handleRealizarPedido}>Realizar pedido</button>
                        </div>
                    </>
                )}
                <ToastContainer position="bottom-right" autoClose={3000} />
            </main>
        </div>
    );
}

export default Carrito;
