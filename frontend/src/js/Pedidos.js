import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaInfoCircle, FaTrash } from 'react-icons/fa';
import '../css/Pedidos.css';

function Pedidos() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const pedidos = [
        { numero: '84651454', estado: 'En preparación', fecha: '16/02/2024' },
        { numero: '84654156146', estado: 'Entregado', fecha: '10/02/2024' },
        { numero: '846514554', estado: 'En preparación', fecha: '15/02/2024' },
    ];

    const pedidosFiltrados = pedidos.filter((pedido) =>
        pedido.numero.includes(searchTerm)
    );

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleEliminarPedido = (numeroPedido) => {
        if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
            console.log(`Pedido eliminado: ${numeroPedido}`);
        }
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
                    <button className="menu-item" onClick={() => navigate('/')}>
                        Cerrar sesión
                    </button>
                </nav>
            </header>

            {/* Contenido Principal */}
            <main className="main-content-pedidos-admin">
                <h1>Gestión de Pedidos:</h1>
                <input
                    type="text"
                    placeholder="Buscar por número de pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-pedidos"
                />
                <div className="table-responsive">
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>Número de Pedido</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido) => (
                                <tr key={pedido.numero}>
                                    <td>{pedido.numero}</td>
                                    <td>{pedido.estado}</td>
                                    <td>{pedido.fecha}</td>
                                    <td>
                                        <button
                                            className="info-button"
                                            onClick={() =>
                                                alert(`Detalles del pedido: ${pedido.numero}`)
                                            }
                                        >
                                            <FaInfoCircle />
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleEliminarPedido(pedido.numero)}
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

export default Pedidos;
