import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/InicioCliente.css';
import { useNavigate } from 'react-router-dom';

function InicioCliente() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Llamada a useNavigate aquí
  const location = useLocation();
  const  {usuarioId, rol}  = location.state || {};


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token'); // Elimina el token
    navigate('/');  // Redirige al login
    window.location.reload();
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
          <Link to={`/perfil/${usuarioId}`} state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Perfil</Link>
          <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
          {/* Botón de Cerrar sesión */}
          <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
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