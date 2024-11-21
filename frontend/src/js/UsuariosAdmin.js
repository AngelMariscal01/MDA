import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../css/InicioCliente.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UsuariosAdministrador() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const navigate = useNavigate();
  const location = useLocation();
  const { rol } = location.state || {};

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    axios
      .get('http://localhost:8081/usuarios')
      .then((response) => setUsuarios(response.data.usuarios))
      .catch((err) => {
        console.log('Error al cargar los usuarios:', err);
        toast.error('Hubo un error al cargar los usuarios.');
      });
  }, []);

  const handleEstadoChange = (usuarioId, nuevoEstado) => {
    if (!window.confirm('¿Estás seguro de actualizar el estado de este usuario?')) return;
    
    const estado = nuevoEstado ? 'activo' : 'inactivo';
    axios
      .post('http://localhost:8081/usuarios/actualizarEstado', { usuarioId, estado })
      .then(() => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.usuario_id === usuarioId ? { ...usuario, estado } : usuario
          )
        );
      })
      .catch((err) => {
        console.log('Error al actualizar el estado del usuario:', err);
        toast.error('Hubo un error al actualizar el estado del usuario.');
      });
  };

  const handleRolChange = (usuarioId, nuevoEstado) => {
    if (!window.confirm('¿Estás seguro de actualizar el rol de este usuario?')) return;

    const rol = nuevoEstado ? 'admin' : 'cliente';
    axios
      .post('http://localhost:8081/usuarios/actualizarRol', { usuarioId, rol })
      .then(() => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.usuario_id === usuarioId ? { ...usuario, rol } : usuario
          )
        );
      })
      .catch((err) => {
        console.log('Error al actualizar el rol del usuario:', err);
        toast.error('Hubo un error al actualizar el rol del usuario.');
      });
  };

  const handleEditarUsuario = (usuarioId, rol) => {
    navigate(`/perfil/${usuarioId}`, { state: { usuarioId, rol } });
  };

  const handleEliminarUsuario = (usuarioId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    axios
      .post('http://localhost:8081/usuarios/eliminar', { usuarioId })
      .then(() => {
        toast.success('Usuario eliminado exitosamente.');
        setTimeout(() => window.location.reload(), 3000);
      })
      .catch((err) => {
        console.log('Error al eliminar el usuario:', err);
        toast.error('Hubo un error al eliminar el usuario.');
      });
  };

  // Filtrar los usuarios en función del término de búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <button className="add-user-button" onClick={() => navigate('/registrarse')}>
        <FaPlus size={16} />
      </button>

      <main className="main-content-usuarios-admin">
        <h1>Usuarios:</h1>

        {/* Campo de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="table-responsive">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.usuario_id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.telefono}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={usuario.rol === 'admin'}
                      onChange={(e) => handleRolChange(usuario.usuario_id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={usuario.estado === 'activo'}
                      onChange={(e) => handleEstadoChange(usuario.usuario_id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button className="edit-button" onClick={() => handleEditarUsuario(usuario.usuario_id, rol)}>
                      <FaEdit />
                    </button>
                    <button className="delete-button" onClick={() => handleEliminarUsuario(usuario.usuario_id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </main>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default UsuariosAdministrador;
