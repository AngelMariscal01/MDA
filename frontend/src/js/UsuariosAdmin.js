import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../css/InicioCliente.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UsuariosAdministrador() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [usuarios, setUsuarios] = useState([]); // Cambiar usuarios a state
  const navigate = useNavigate(); // Llamada a useNavigate aquí

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const mostrarError = (mensaje) => {
    setError(mensaje);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000); // Oculta el mensaje después de 3 segundos
  };
  
  const cerrarSesion = () => {
    localStorage.removeItem('token'); // Elimina el token
    navigate('/');  // Redirige al login
    window.location.reload();
  };


  useEffect(() => {
    axios
      .get('http://localhost:8081/usuarios')
      .then((response) => {
        setUsuarios(response.data.usuarios); // Actualizar el estado con los usuarios
      })
      .catch((err) => {
        console.log('Error al cargar los usuarios: ', err);
        mostrarError('Hubo un error al cargar los usuarios.');
      });
  }, []); // [] asegura que el efecto solo se ejecute una vez al montar

  const handleEstadoChange = (usuarioId, nuevoEstado) => {
    
    const confirmar = window.confirm('¿Estás seguro de actualizar el estado de este usuario?');
    if (!confirmar) return;
    const estado = nuevoEstado ? 'activo' : 'inactivo';
    axios
      .post('http://localhost:8081/usuarios/actualizarEstado', { usuarioId, estado })
      .then((response) => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.usuario_id === usuarioId ? { ...usuario, estado } : usuario
          )
        );
      })
      .catch((err) => {
        console.log('Error al actualizar el estado del usuario: ', err);
        mostrarError('Hubo un error al actualizar el estado del usuario.');
      });
  };

  const handleRolChange = (usuarioId, nuevoEstado) => {

    const confirmar = window.confirm('¿Estás seguro de actualizar el rol de este usuario?');
    if (!confirmar) return;

    const rol = nuevoEstado ? 'admin' : 'cliente';
    axios
      .post('http://localhost:8081/usuarios/actualizarRol', { usuarioId, rol })
      .then((response) => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.usuario_id === usuarioId ? { ...usuario, rol } : usuario
          )
        );
      })
      .catch((err) => {
        console.log('Error al actualizar el estado del usuario: ', err);
        mostrarError('Hubo un error al actualizar el estado del usuario.');
      });
  };

  const handleEditarUsuario = (usuarioId) => {
    navigate(`/perfil/${usuarioId}`, { state: { usuarioId } }); // Redirige a la ruta de edición con el ID del usuario
  };

  const handleEliminarUsuario = (usuarioId) => {
    // Asegúrate de enviar `usuario_id` en lugar de `usuarioId`

    const confirmar = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmar) return;

    axios
      .post('http://localhost:8081/usuarios/eliminar', { usuarioId })
      .then((response) => {
        window.location.reload();
      })
      .catch((err) => {
        console.log('Error al eliminar el usuario: ', err);
        mostrarError('Hubo un error al eliminar el usuario.');
        
      });
  };

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

    <button className="add-user-button" onClick={(e) => navigate('/registrarse')}>
      <FaPlus size={16} /> 
    </button>

    <main className="main-content-usuarios-admin">
      <h1>Usuarios:</h1>

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
            {usuarios.map((usuario) => (
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
                <button className="edit-button" onClick={(e) => handleEditarUsuario(usuario.usuario_id)}  >
                  <FaEdit />
                </button>
                  <button className="delete-button " onClick={(e) => handleEliminarUsuario(usuario.usuario_id)}>
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

export default UsuariosAdministrador;
