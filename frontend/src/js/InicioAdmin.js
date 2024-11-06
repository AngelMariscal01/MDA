import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/InicioCliente.css';
import { useNavigate } from 'react-router-dom';


function InicioCliente() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Llamada a useNavigate aquí

  // Función para abrir/cerrar el menú
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
          <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>Productos</Link>
          <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>Usuarios</Link>
          <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
          <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
          {/* Botón de Cerrar sesión */}
          <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
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

export default InicioCliente;