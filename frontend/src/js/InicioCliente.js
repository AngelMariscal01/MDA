import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/InicioCliente.css';

function InicioCliente() {
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
          <Link to="/productos" className="menu-item" onClick={toggleMenu}>Productos</Link>
          <Link to="/pedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
          <Link to="/carrito" className="menu-item" onClick={toggleMenu}>Carrito</Link>
          <Link to="/perfil" className="menu-item" onClick={toggleMenu}>Perfil</Link>
          <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="main-content">
        <h1>Bienvenido a Mini Donas Arenita</h1>
        <p>Explora nuestros productos y realiza tus pedidos fácilmente.</p>
      </main>
    </div>
  );
}

export default InicioCliente;