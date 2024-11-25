import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/InicioCliente.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/LOGO-minidonasarenita.png';

function InicioAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioId, rol } = location.state || {};

  // Función para abrir/cerrar el menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="inicio-admin">
      {/* Header */}
      <header className="header">
        <div className="menu-icon" onClick={toggleMenu}>
          <FaBars size={24} />
        </div>

        {/* Dropdown menu */}
        <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>Productos</Link>
          <Link to="/gestionUsuarios" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Usuarios</Link>
          <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
          <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
          <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
        </nav>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="content-container">
         <center><img src={logo} alt="Logo Mini Donas Arenita" className="logo-animada" /></center>
          <h1 className="titulo-principal">Bienvenido a Mini Donas Arenita</h1>
          <p className="subtitulo">Administra productos y gestiona tus pedidos fácilmente.</p>
        </div>
      </main>
    </div>
  );
}

export default InicioAdmin;
