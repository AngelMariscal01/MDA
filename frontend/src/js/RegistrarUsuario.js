import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/App.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/LOGO-minidonasarenita.png";

function Registrarse() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");

  const validarFormulario = () => {
    const trimmedNombre = nombre.trim();
    const trimmedApellido = apellido.trim();
    const trimmedEmail = email.trim();
    const trimmedTelefono = telefono.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (
      !trimmedNombre ||
      !trimmedApellido ||
      !trimmedEmail ||
      !trimmedTelefono ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      toast.error("Por favor, completa todos los campos.");
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(trimmedEmail)) {
      toast.error("El correo electrónico no es válido.");
      return false;
    }

    const regexTelefono = /^\d{10}$/;
    if (!regexTelefono.test(trimmedTelefono)) {
      toast.error("El número de teléfono debe tener exactamente 10 dígitos.");
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    if (trimmedPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleRegistrarse = () => {
    if (validarFormulario()) {
      const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;
      const values = {
        nombreCompleto,
        email: email.trim(),
        telefono: telefono.trim(),
        password: password.trim(),
      };

      axios
        .post("http://localhost:8081/registrarUsuario", values)
        .then(() => {
          toast.success("Usuario registrado con éxito!");
          setTimeout(() => navigate("/iniciarSesion"), 3000);
        })
        .catch((err) => {
          console.error("Error en el registro:", err);
          toast.error(
            "Hubo un error al registrar el usuario. Inténtalo de nuevo."
          );
        });
    }
  };

  return (
    <div
      className="relative flex w-full min-h-screen flex-col bg-[#faf8fc] overflow-x-hidden"
      style={{
        fontFamily: 'Epilogue, "Noto Sans", sans-serif',
        background: "#F2A7A7",
      }}
    >
      {/* Imagen del Perrito */}
      <div className="logo-container">
        <img src={logo} alt="Perrito con dona" className="logo-resplandor" />
      </div>

      {/* Mensaje de Bienvenida */}
      <h2 className="text-[#140e1b] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
        ¡Regístrate!
      </h2>

      {/* Tarjeta de Registro */}
      <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Ingresa tu(s) nombre(s)"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ingresa tu(s) apellido(s)"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Ingresa tu teléfono"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <input
            placeholder="Ingresa tu correo electrónico"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar tu contraseña"
            className="form-input rounded-xl bg-[#F2D5C4] text-[#D97789] placeholder:text-[#F2A7A7] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="rounded-full bg-[#D97789] text-[#faf8fc] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#D9BB84] transition duration-200"
            onClick={handleRegistrarse}
          >
            Confirmar
          </button>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default Registrarse;
