import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaInfoCircle } from 'react-icons/fa';
import '../css/Pedidos.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PedidosCliente() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const location = useLocation();
    const [ultimoPedido, setUltimoPedido] = useState(null);
    var validar = true;
    const  {usuarioId, rol}  = location.state || {};
    console.log(usuarioId, rol);
    const navigate = useNavigate();

    
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };
    

    useEffect(() => {
        // Llamar a la API para obtener los pedidos
        axios
            .get(`http://localhost:8081/obtenerPedidosCliente`, {
                params: { idUsuario: usuarioId }
            })
            .then((response) => {
                console.log('Pedidos obtenidos:', response.data);
                if (response.data.message === 'No hay pedidos') {
                    console.log('No hay pedidos');
                    setPedidos([]);
                } else {
                    setPedidos(response.data);
                    const ultimoPedido = response.data[response.data.length - 1];
                    setUltimoPedido(ultimoPedido); // Establecer el último pedido
    
                    // Mostrar el toast después de establecer el último pedido
                    if (ultimoPedido && validar) {
                        toast.success(`Último pedido: ${ultimoPedido.estado_nombre}`);
                        validar = false; // Marcar que el toast ha sido mostrado
                    }
                }
            })
            .catch((error) => {
                console.error('Error al obtener pedidos:', error);
            });
    }, [usuarioId]); // Se ejecuta solo cuando 'usuarioId' cambia

    const pedidosFiltrados = pedidos.filter((pedido) => {
        const coincideBusqueda = pedido.pedido_id.toString().includes(searchTerm);
        const coincideEstado = estadoFiltro ? pedido.estado_nombre === estadoFiltro : true;

        // Extraer solo la parte de la fecha sin hora (YYYY-MM-DD)
        const fechaPedidoSoloFecha = pedido.fecha_pedido.split('T')[0];  // Esto asume que la fecha está en formato ISO (YYYY-MM-DDTHH:mm:ss)
        const coincideFecha = fechaFiltro ? fechaPedidoSoloFecha === fechaFiltro : true;

        return coincideBusqueda && coincideEstado && coincideFecha;
    });

    
    

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleEliminarPedido = (numeroPedido) => {
        if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
            console.log(`Pedido eliminado: ${numeroPedido}`);
            // Aquí puedes llamar a una API para eliminar el pedido en la base de datos
        }
    };

    const formatFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="inicio-cliente">
            {/* Barra de Navegación */}
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
                    {/* Botón de Cerrar sesión */}
                    <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav>
            </header>

            {/* Contenido Principal */}
            <main className="main-content-pedidos-admin">
                <h1>Gestión de Pedidos:</h1>
                <section className="search-bar-pedidos">
                    <input
                        type="text"
                        placeholder="Buscar por número de pedido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-productos-admin"
                    />
                    {/* Selector de fecha */}
                    <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        className="filter-input-pedidos"
                    />

                    {/* Selector de estado */}
                    <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                        className="filter-select-pedidos"
                    >
                        <option value="">Todos los estados</option>
                        {[...new Set(pedidos.map((pedido) => pedido.estado_nombre))].map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                        {/* Añade más opciones si tienes más estados */}
                    </select>
                </section>


                <div className="table-responsive">
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>ID de Pedido</th>
                                <th>Estado</th>
                                <th>Fecha de pedido</th>
                                <th>Fecha de entrega estimada</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido) => (
                                <tr key={pedido.pedido_id}>
                                    <td>{pedido.pedido_id}</td>
                                    <td>{pedido.estado_nombre}</td>
                                    <td>{formatFecha(pedido.fecha_pedido)}</td>
                                    <td>{ (pedido.fecha_entrega) ? new Date(pedido.fecha_entrega).toLocaleString().substring(0, 10) + ", " + pedido.hora_entrega.toLocaleString() : "Se asignara en breve"}</td>
                                    <td>
                                        <button
                                            className="info-button"
                                            onClick={() =>
                                                navigate(`/detallesPedido/${pedido.pedido_id}`, { state: { pedido_id: pedido.pedido_id, rol, usuarioId } })
                                            }
                                        >
                                            <FaInfoCircle />
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleEliminarPedido(pedido.pedido_id)}
                                        >
                                            
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}

export default PedidosCliente;
