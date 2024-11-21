import '../css/ProductosAdministrador.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductCard({ product, cantidad, incrementarCantidad, disminuirCantidad, onDelete }) {
    const imagen = `http://localhost:8081${product.imagen}`;
    return (
        <div className="product-card">
            <img src={imagen} alt={`Imagen de ${product.nombre_producto}`} className="product-image" />
            <h3 className="product-name">{product.nombre_producto} ({product.pz_producto} pz)</h3>
            <div className='producto-actions'>
                <span>{cantidad}</span>
            </div>
            <p className="product-price">${product.subtotal}</p>

        </div>
    );
}

function DetallesPedido() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [direccion, setDireccion] = useState('');
    const [notas, setNotas] = useState('');
    const [estadoPedido, setEstadoPedido] = useState(''); // Estado actual
    const [estados, setEstados] = useState([]); // Lista de estados disponibles
    const [fechaEntrega, setFechaEntrega] = useState(''); // Fecha estimada de entrega
    const [horaEntrega, setHoraEntrega] = useState(''); // Hora estimada de entrega
    const location = useLocation();
    const { pedido_id } = location.state || {};
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [telefono, setTelefono] = useState('');
    const [totalPedido, setTotal] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        // Obtener lista de estados disponibles
        axios
            .get('http://localhost:8081/obtenerEstados')
            .then((response) => setEstados(response.data))
            .catch((err) => console.error('Error al obtener estados:', err));

        // Obtener detalles del pedido
        axios
            .get('http://localhost:8081/obtenerDetallesPedido', { params: { pedido_id } })
            .then((response) => {
                const data = response.data;
                console.log(data);
                if (data && data.length > 0) {
                    setProductos(data[0].productos);
                    setTelefono(data[0].telefono);
                    setNombreUsuario(data[0].nombre_usuario);
                    setTotal(data[0].total);
                    setDireccion(data[0].direccion_entrega);
                    setNotas(data[0].notas_entrega);
                    setEstadoPedido(data[0].estado_id); // Estado actual
                    setFechaEntrega(data[0].fecha_entrega_estimada || ''); // Fecha estimada
                    setHoraEntrega(data[0].hora_entrega_estimada || ''); // Hora estimada
                }
            })
            .catch((err) => console.error('Error al obtener detalles del pedido:', err));
    }, [pedido_id]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    const actualizarFechaHoraEntrega = () => {
        axios
            .post('http://localhost:8081/actualizarFechaHoraEntrega', {
                pedido_id: pedido_id,
                fecha_entrega: fechaEntrega,
                hora_entrega: horaEntrega
            })
            .then(() => toast.success('Fecha y hora actualizadas correctamente'))
            .catch((err) => toast.error('Error al actualizar fecha y hora', err));
    };

    const actualizarEstadoPedido = () => {
        axios
            .post('http://localhost:8081/actualizarEstadoPedido', {
                pedido_id,
                estado_id: estadoPedido,
                fecha_entrega_estimada: fechaEntrega,
                hora_entrega_estimada: horaEntrega,
            })
            .then(() => {
                toast.success('Estado y detalles de entrega actualizados correctamente');
                setTimeout(() => navigate('/gestionPedidos'), 1000);
            })
            .catch((err) => toast.success('Error al actualizar el estado del pedido', err));
    };

    const handleActualizar = () => {
        if (estadoPedido === '') {
            toast.error('Por favor, seleccione un estado.');
            return;
        }
        if (fechaEntrega === '') {
            toast.error('Por favor, seleccione una fecha de entrega.');
            return;
        }
        if (horaEntrega === '') {
            toast.error('Por favor, seleccione una hora de entrega.');
            return;
        }
        actualizarFechaHoraEntrega();
        actualizarEstadoPedido();
    };

    return (
        <div className="inicio-cliente">
            <header className="header">
                <div className="menu-icon" onClick={toggleMenu}>
                    <FaBars size={24} />
                </div>
                <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>Productos</Link>
                    <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>Usuarios</Link>
                    <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
                    <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
                    <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav>
            </header>
            <main className="main-content-productos-admin">
                <h1>Detalles del Pedido:</h1>
                <div className="carrito-extra">
                    <h2>ID Pedido:</h2>
                    <input className="notas" value={pedido_id} readOnly />
                    <h2>Nombre:</h2>
                    <input className="notas" value={nombreUsuario} readOnly />
                    <h2>Teléfono:</h2>
                    <input className="notas" value={telefono} readOnly />
                </div>
                <div className="product-grid">
                    {productos.length === 0 ? (
                        <p>No se encontraron productos en el pedido.</p>
                    ) : (
                        productos.map((product) => (
                            <ProductCard
                                key={product.producto_id}
                                product={product}
                                cantidad={product.cantidad_pedido}
                            />
                        ))
                    )}
                </div>
                {productos.length > 0 && (
                    <>
                        <div className="carrito-extra">
                            <h2>Notas:</h2>
                            <textarea className="notas" value={notas} readOnly />
                            <h2>Dirección:</h2>
                            <input className="direccion" type="text" value={direccion} readOnly />
                            <h2>Fecha estimada de entrega:</h2>
                            <input
                                type="date"

                                className="fecha-entrega"
                                value={(fechaEntrega) ? new Date(fechaEntrega).toISOString().split('T')[0]
                                    : ''
                                }
                                onChange={(e) => setFechaEntrega(e.target.value)}
                            />
                            <h2>Hora estimada de entrega:</h2>
                            <input
                                type="time"
                                className="hora-entrega"
                                value={horaEntrega}
                                onChange={(e) => setHoraEntrega(e.target.value)}
                            />
                        </div>
                        <div className="estado">
                            <h2>Estado:</h2>
                            <select
                                className="estado-select"
                                value={estadoPedido}
                                onChange={(e) => setEstadoPedido(e.target.value)}
                            >
                                {estados.map((estado) => (
                                    <option key={estado.estado_id} value={estado.estado_id}>
                                        {estado.estado_nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className="total">Total: ${totalPedido}</label>
                        <button className="actualizar" onClick={handleActualizar}>
                            Actualizar
                        </button>
                    </>
                )}
                <ToastContainer position="bottom-right" autoClose={3000} />
            </main>
        </div>
    );
}

export default DetallesPedido;
