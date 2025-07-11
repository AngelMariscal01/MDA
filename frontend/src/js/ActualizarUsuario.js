import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/App.css";
import axios from "axios";

function ActualizarUsuario() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const { usuarioId, rol } = location.state || {};
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  console.log(usuarioId, rol);
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    // Obtener datos del usuario
    axios
      .get("http://localhost:8081/obtenerUsuario", {
        params: { usuarioId: usuarioId },
      })
      .then((response) => {
        const usuario = response.data.usuario;
        setNombre(usuario.nombre);
        setEmail(usuario.correo);
        setTelefono(usuario.telefono);
      })
      .catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
        toast.error("Hubo un error al cargar los datos del usuario.");
      });
  }, [usuarioId]);

  const validarFormulario = () => {
    if (!email || !password || !confirmPassword || !telefono || !nombre) {
      toast.error("Por favor, ingresa todos los campos correctamente.");
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      toast.error("El correo electrónico no es valido.");
      return false;
    }
    const regexTelefono = /^\d{10}$/;
    if (!regexTelefono.test(telefono)) {
      toast.error("El número de teléfono no es valido.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleActualizar = () => {
    if (validarFormulario()) {
      const values = { nombre, email, telefono, password, usuarioId };
      axios
        .post("http://localhost:8081/actualizarUsuario", values)
        .then(() => {
          if (rol === "admin") {
            toast.success("¡Usuario actualizado exitosamente!");
            setTimeout(() => navigate("/gestionUsuarios"), 3000);
          } else if (rol === "cliente") {
            toast.success("¡Usuario actualizado exitosamente!");
            setTimeout(
              () => navigate("/inicioCliente", { state: { usuarioId, rol } }),
              1000
            );
          }
          //window.location.reload();
        })
        .catch((err) => {
          console.log("Error en la actualización: ", err);
          toast.error("Hubo un error al actualizar el usuario.");
        });
    }
  };

  return (
    <>
      {!(rol === "cliente") ? (
        <header className="header">
          <div className="menu-icon" onClick={toggleMenu}>
            <FaBars size={24} />
          </div>
          <nav className={`dropdown-menu ${isMenuOpen ? "open" : ""}`}>
            <Link
              to="/gestionProductos"
              className="menu-item"
              onClick={toggleMenu}
            >
              Productos
            </Link>
            <Link
              to="/gestionUsuarios"
              className="menu-item"
              onClick={toggleMenu}
            >
              Usuarios
            </Link>
            <Link
              to="/gestionPedidos"
              className="menu-item"
              onClick={toggleMenu}
            >
              Pedidos
            </Link>
            <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>
              Estadísticas
            </Link>
            <button className="menu-item" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </nav>
        </header>
      ) : (
        <header className="header">
          <div className="menu-icon" onClick={toggleMenu}>
            <FaBars size={24} />
          </div>
          <nav className={`dropdown-menu ${isMenuOpen ? "open" : ""}`}>
            <Link
              to="/productos"
              state={{ usuarioId, rol }}
              className="menu-item"
              onClick={toggleMenu}
            >
              Productos
            </Link>
            <Link
              to="/pedidos"
              state={{ usuarioId, rol }}
              className="menu-item"
              onClick={toggleMenu}
            >
              Pedidos
            </Link>
            <Link
              to="/carrito"
              state={{ usuarioId, rol }}
              className="menu-item"
              onClick={toggleMenu}
            >
              Carrito
            </Link>
            <Link
              to={`/perfil/${usuarioId}`}
              state={{ usuarioId, rol }}
              className="menu-item"
              onClick={toggleMenu}
            >
              Perfil
            </Link>
            <Link to="/contacto" className="menu-item" onClick={toggleMenu}>
              Contacto
            </Link>
            <button
              className="menu-item"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Cerrar sesión
            </button>
          </nav>
        </header>
      )}
      <div
        className="relative flex w-full min-h-screen flex-col bg-[var(--color-fondo)] overflow-x-hidden"
        style={{
          fontFamily: "var(--font-family)",
        }}
      >
        {/* Título */}
        <h2 className="text-[var(--color-primario)] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
          ¡Actualiza tus datos!
        </h2>

        {/* Tarjeta de Actualización */}
        <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Campos de texto */}
            <input
              type="text"
              placeholder="Ingresa tu(s) nombre(s)"
              className="form-input rounded-xl bg-[var(--color-terciario)] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Ingresa tu teléfono"
              className="form-input rounded-xl bg-[var(--color-terciario)] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              className="form-input rounded-xl bg-[var(--color-terciario)] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Ingresa o actualiza tu contraseña"
              className="form-input rounded-xl bg-[var(--color-terciario)] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="form-input rounded-xl bg-[var(--color-terciario)] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Botón de Confirmar */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="rounded-full bg-[var(--color-primario)] text-white h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[var(--color-acento)] transition duration-200"
              onClick={handleActualizar}
            >
              Confirmar
            </button>
          </div>
        </div>

        {/* Contenedor de Toast */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </>
  );
}

export default ActualizarUsuario;
