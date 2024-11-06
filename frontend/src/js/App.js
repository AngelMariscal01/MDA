import React, { useState, useEffect } from "react";
import IniciarSesion from "./Login";
import Registrarse from "./RegistrarUsuario";
import InicioCliente from "./InicioCliente";
import InicioAdministrador from "./InicioAdmin";
import UsuariosAdministrador from "./UsuariosAdmin";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
        <Route path="/inicioCliente" element={tokenValid && rol === 'cliente' ? <InicioCliente /> : <IniciarSesion />} />
        <Route path="/inicioAdministrador" element={tokenValid && rol === 'admin' ? <InicioAdministrador /> : <IniciarSesion />} />
        <Route path="/gestionUsuarios" element={tokenValid && rol === 'admin' ? <UsuariosAdministrador /> : <IniciarSesion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
