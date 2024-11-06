import React from "react";
import IniciarSesion from "./Login";
import Registrarse from "./RegistrarUsuario"
import InicioCliente from "./InicioCliente";
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IniciarSesion/>}></Route>
        <Route path="/registrarse" element={<Registrarse />}></Route>
        <Route path="/inicioCliente" element={<InicioCliente />}></Route>
      </Routes>
    </BrowserRouter>
      

  )
}
export default App;
