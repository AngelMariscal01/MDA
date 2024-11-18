import '../css/ProductosAdministrador.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import axios from 'axios';

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

function DetallesPedidoCliente() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [direccion, setDireccion] = useState('');
    const [notas, setNotas] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [estadoPedido, setEstadoPedido] = useState(''); // Estado actual
    const [estados, setEstados] = useState([]); // Lista de estados disponibles
    const [fechaEntrega, setFechaEntrega] = useState(''); // Fecha estimada de entrega
    const [horaEntrega, setHoraEntrega] = useState(''); // Hora estimada de entrega

    const location = useLocation();
    const { pedido_id, usuarioId, rol } = location.state || {};

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
    const estadoIndex = estados.findIndex((estado) => estado.estado_id === estadoPedido);
    const progressEstados = estados.map((estado, index) => ({
        nombre: estado.estado_nombre,
        activo: index <= estadoIndex, // Determina si el estado está activo o no
    }));
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    const mostrarError = (mensaje) => {
        setError(mensaje);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
    };

    const actualizarFechaHoraEntrega = () => {
        axios
            .post('http://localhost:8081/actualizarFechaHoraEntrega', {
                pedido_id: pedido_id,
                fecha_entrega: fechaEntrega,
                hora_entrega: horaEntrega
            })
            .then(() => alert('Fecha y hora actualizadas correctamente'))
            .catch((err) => mostrarError('Error al actualizar fecha y hora.'));
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
                alert('Estado y detalles de entrega actualizados correctamente');
                setTimeout(() => navigate('/gestionPedidos'), 1000);
            })
            .catch((err) => mostrarError('Error al actualizar el estado del pedido.'));
    };

    const handleActualizar = () => {
        if (estadoPedido === '') {
            mostrarError('Seleccione un estado.');
            return;
        }
        if (fechaEntrega === '') {
            mostrarError('Seleccione una fecha de entrega.');
            return;
        }
        if (horaEntrega === '') {
            mostrarError('Seleccione una hora de entrega.');
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
                    <Link to="/productos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Productos</Link>
                    <Link to="/pedidos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Pedidos</Link>
                    <Link to="/carrito" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Carrito</Link>
                    <Link to={`/perfil/${usuarioId}`} state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Perfil</Link>
                    <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
                    <button className="menu-item" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>Cerrar sesión</button>
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
                                readOnly
                            />
                            <h2>Hora estimada de entrega:</h2>
                            <input
                                type="time"
                                className="hora-entrega"
                                value={horaEntrega}
                                onChange={(e) => setHoraEntrega(e.target.value)}
                                readOnly
                            />
                        </div>
                        <div className="estado-progreso">
                            <h2>Estado del Pedido:</h2>
                            <div className="progress-bar">
                                {progressEstados.map((estado, index) => (
                                    <div
                                        key={index}
                                        className={`progress-step ${estado.activo ? 'active' : 'inactive'}`}
                                    >
                                        
                                        <div className="circle">{estado.activo ? '✔' : ''}</div>
                                        <p>{estado.nombre}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {
                            !fechaEntrega  ?                         
                            <div className='alerta'>
                            <label>Instrucciones: 
                                <ul>
                                    <li>1. Espera a que se te asigne una fecha de entrega estimada para continuar con el proceso.</li>
                                    
                                </ul>
                            </label>
                        </div> : fechaEntrega && estadoPedido == '35d48694-9551-4f0f-aa08-e152356a96bb' ?
                            <div className='alerta'>
                            <label>Instrucciones: 
                                <ul>
                                    <li>Realiza una transferencia de ${totalPedido*0.5} a la cuenta para continuar con el proceso:</li>

                                    <li>NO CUENTA. 000000000000000
                                        <br></br>
                                        NOMBRE: Alejandra Ruiz 
                                        <br></br>
                                        BANCO: BBVA. 
                                        <br></br>
                                        CONCEPTO: {pedido_id.toString().substring(0, 5)}
                                    </li>
                                    <br></br>
                                    <li>Dudas o aclaraciones: <a href="/contacto" target="_blank" rel="noopener noreferrer">@Contacto</a></li>
                                    <li>Una vez realizada la transferencia, no se podrá cancelar el pedido, ni recibir un reembolso. Gracias por su preferencia.</li>
                                </ul>
                            </label>
                        </div> : ''
                        }

                        <label className="total">Total: ${totalPedido}</label>
                        <br></br>
                        <br></br>
                        <br></br>
                    </>
                )}
                {showError && (
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-md shadow-md">
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}

export default DetallesPedidoCliente;
