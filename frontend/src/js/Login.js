import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../css/App.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/LOGO-minidonasarenita.png';
//const jwt = require('jsonwebtoken');
//const jose = require('node-jose');

function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function IniciarSesion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validarFormulario = () => {
    // Verifica si el correo está vacío
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico.');
      return false;
    }

    // Verifica el formato del correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      toast.error('El correo electrónico no es valido.');
      return false;
    }

    // Verifica si la contraseña está vacía
    if (!password) {
      toast.error('Por favor, ingresa tu contraseña.');
      return false;
    }

    // Verifica la longitud de la contraseña
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    return true;
};

  const handleIniciarSesion = () => {
    if (validarFormulario()) {
        const values = { email, password };
        
        axios.post('http://localhost:8081/login', values)
        .then((response) => {
            const token = response.data.user.token; // Obtén el objeto de usuario del backend
            if(token){
              localStorage.setItem('token', token)
              if(parseJwt(token).rol === 'admin' && parseJwt(token).estado === 'activo'){
                toast.success('Bienvenido Administrador!');
                setTimeout(() => {
                  navigate('/inicioAdministrador', { state: {usuarioId:parseJwt(token).usuario_id, rol:parseJwt(token).rol } })
                  window.location.reload();
                }, 1000);
              }else if (parseJwt(token).rol === 'cliente' && parseJwt(token).estado === 'activo'){
                toast.success('Bienvenido!');
                setTimeout(() => {
                  navigate('/productos', { state: {usuarioId:parseJwt(token).usuario_id, rol:parseJwt(token).rol } })
                  window.location.reload();
                }, 1000);
              }
              else if (parseJwt(token).estado === 'inactivo'){
                toast.error('Cuenta inactiva');
              }
            }
        })
        .catch(err => {
            console.log('Error en el inicio de sesión: ', err);
            toast.error('Error en el inicio de sesión');
        });
    }
  };

  return (
    <div
      className="relative flex w-full min-h-screen flex-col bg-[#faf8fc] overflow-x-hidden"
      style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' }}
    >
      {/* Imagen de Fondo */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div
          className="rounded-xl bg-cover bg-center bg-no-repeat min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] flex flex-col justify-end"
          style={{
            backgroundImage: `url(${logo})`,
          }}
        ></div>
      </div>

      {/* Mensaje de Bienvenida */}
      <h2 className="text-[#140e1b] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
        Bienvenid@ a Mini Donas Arenita!
      </h2>

      {/* Campos de Entrada */}
      <div className="max-w-lg w-full mx-auto flex flex-col gap-4 px-4 py-3 sm:px-6 md:px-8">
        <label htmlFor='email' className="flex flex-col">
          <input
            placeholder="Ingresa tu correo electrónico"
            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label htmlFor='password' className="flex flex-col">
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-center">
        <div className="flex flex-col gap-3 max-w-lg w-full px-4 py-3 sm:px-6 md:px-8">
          <button
            type="button"
            className="rounded-full bg-[#8019e6] text-[#faf8fc] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#5f0fb3] transition duration-200"
            onClick={handleIniciarSesion}
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            className="rounded-full border border-[#140e1b] text-[#140e1b] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#f0f0f0] transition duration-200"
            onClick={() => navigate('/registrarse')}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Olvidaste tu Contraseña */}
      <a href="/recuperarContrasena" className="text-[#734e97] text-sm text-center underline pb-3 sm:text-base">
        ¿Olvidaste tu Contraseña?
      </a>
      <a href="/contacto" className="text-[#734e97] text-sm text-center underline pb-3 sm:text-base">@Contacto</a>

      {/* Mensaje de Error */}
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Espacio al final */}
      <div className="h-5 bg-[#faf8fc]">
        
      </div>
    </div>
  );
}

export default IniciarSesion;