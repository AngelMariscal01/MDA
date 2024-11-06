import React from "react";
import IniciarSesion from "./Login";
import Registrarse from "./RegistrarUsuario"
import InicioCliente from "./InicioCliente";
import InicioAdministrador from "./InicioAdmin";
import UsuariosAdministrador from "./UsuariosAdmin";
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IniciarSesion/>}></Route>
        <Route path="/registrarse" element={<Registrarse />}></Route>
        <Route path="/inicioCliente" element={<InicioCliente />}></Route>
        <Route path="/inicioAdministrador" element={<InicioAdministrador />}></Route>
        <Route path="/gestionUsuarios" element={<UsuariosAdministrador />}></Route>
      </Routes>
    </BrowserRouter>
      

  )
}
export default App;
