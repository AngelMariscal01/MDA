import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/InicioCliente.css';

function InicioAdministrador() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="inicio-cliente">
      {/* Header with menu */}
      <header className="header">
        <div className="menu-icon" onClick={toggleMenu}>
          <FaBars size={24} />
        </div>

        {/* Dropdown menu */}
        <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>Productos</Link>
          <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>Usuarios</Link>
          <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
          <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="main-content">
        <h1>Bienvenido a Mini Donas Arenita</h1>
        <p>Administra productos y gestiona tus pedidos fácilmente.</p>
      </main>
    </div>
  );
}

export default InicioAdministrador;