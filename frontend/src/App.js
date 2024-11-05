import React from "react";
import Login from "./Login";
import Registrarse from "./RegistrarUsuario"
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/registrarse" element={<Registrarse />}></Route>
      </Routes>
    </BrowserRouter>
      

  )
}
export default App;
