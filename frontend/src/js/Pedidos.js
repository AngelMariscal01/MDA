import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaInfoCircle, FaTrash } from 'react-icons/fa';
import '../css/Pedidos.css';
import axios from 'axios';

function PedidosAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Llamar a la API para obtener los pedidos
        axios
            .get(`http://localhost:8081/obtenerPedidos`)
            .then((response) => {
                setPedidos(response.data);
            })
            .catch((error) => {
                console.error('Error al obtener pedidos:', error);
            });
    }, []);

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
            axios.post('http://localhost:8081/eliminarPedido', { pedido_id: numeroPedido })
                .then(() => {
                    alert('Pedido eliminado exitosamente.');
                    window.location.reload();
                })
                .catch((err) => {
                    console.error('Error al eliminar el pedido:', err);
            })
        }
    };
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
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
                    <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>
                        Productos
                    </Link>
                    <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>
                        Usuarios
                    </Link>
                    <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>
                        Pedidos
                    </Link>
                    <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
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

                    </select>
                </section>


                <div className="table-responsive">
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>ID de Pedido</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido) => (
                                <tr key={pedido.pedido_id}>
                                    <td>{pedido.pedido_id}</td>
                                    <td>{pedido.estado_nombre}</td>
                                    <td>{formatFecha(pedido.fecha_pedido)}</td>
                                    <td>
                                        <button
                                            className="info-button"
                                            onClick={() =>
                                                navigate(`/detalles-pedido/${pedido.pedido_id}`, { state: { pedido_id: pedido.pedido_id } })
                                            }
                                        >
                                            <FaInfoCircle />
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleEliminarPedido(pedido.pedido_id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default PedidosAdmin;
