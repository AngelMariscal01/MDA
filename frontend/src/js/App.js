import React, { useState, useEffect } from "react";
import IniciarSesion from "./Login";
import Registrarse from "./RegistrarUsuario";
import InicioCliente from "./InicioCliente";
import InicioAdministrador from "./InicioAdmin";
import UsuariosAdministrador from "./UsuariosAdmin";
import ActualizarUsuario from "./ActualizarUsuario";
import RecuperarContrasena from "./RecuperarContrasena";
import RestablecerContrasena from "./RestablecerContrasena";
import ProductosAdministrador from "./ProductosAdmin";
import RegistrarProducto from "./RegistrarProducto";
import ActualizarProducto from "./ActualizarProducto";
import ProductosCliente from "./ProductosCliente";
import Carrito from "./Carrito";
import Contacto from "./Contacto";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Pedidos from '../js/Pedidos';
// Función para decodificar el token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function App() {
  const [tokenValid, setTokenValid] = useState(false);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      // Verificar si el token es válido
      if (decodedToken.exp * 1000 > Date.now()) {
        setTokenValid(true);
        setRol(decodedToken.rol); // Extraer el rol del token
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={tokenValid ? (rol === 'admin' ? <InicioAdministrador /> : <InicioCliente />) : <IniciarSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route path="/recuperarContrasena" element={<RecuperarContrasena />} />
        <Route path="/inicioCliente" element={tokenValid && rol === 'cliente' ? <InicioCliente /> : <IniciarSesion />} />
        <Route path="/productos" element={tokenValid && rol === 'cliente' ? <ProductosCliente /> : <IniciarSesion />} />
        <Route path="/carrito" element={tokenValid && rol === 'cliente' ? <Carrito /> : <IniciarSesion />} />


        <Route path="/inicioAdministrador" element={tokenValid && rol === 'admin' ? <InicioAdministrador /> : <IniciarSesion />} />
        <Route path="/gestionUsuarios" element={tokenValid && rol === 'admin' ? <UsuariosAdministrador /> : <IniciarSesion />} />
        <Route path="/gestionProductos" element={tokenValid && rol === 'admin' ? <ProductosAdministrador /> : <IniciarSesion />} />
        <Route path="/crearProducto" element={tokenValid && rol === 'admin' ? <RegistrarProducto /> : <IniciarSesion />} />
        <Route path="/editarProducto/:productoId" element={tokenValid && rol === 'admin' ? <ActualizarProducto /> : <IniciarSesion />} />
        <Route path="/perfil/:usuarioId" element={tokenValid ? <ActualizarUsuario /> : <IniciarSesion />} />
        <Route path="/restablecerContrasena" element={<RestablecerContrasena />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/gestionPedidos" element={<Pedidos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
