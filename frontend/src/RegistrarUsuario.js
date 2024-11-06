import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios'

function Registrarse() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    const validarFormulario = () => {
        // Verifica si el correo está vacío
        if (!email || !password || !confirmPassword || !telefono || !nombre || !apellido) {
            mostrarError('Por favor, ingresa todos los campos correctamente.');
            return false;
        }

        // Verifica el formato del correo
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            mostrarError('El correo electrónico no es valido.');
            return false;
        }
        const regexTelefono = /^(?:\+?\d{1,3}[-. ]?)?(?:\(?\d{2,3}\)?[-. ]?)?\d{3}[-. ]?\d{4}$/;
        if (!regexTelefono.test(telefono)) {
            mostrarError('El número de telefono no es valido.');
            return false;
        }

        // Verifica si la contraseña está vacía
        if (password !== confirmPassword) {
            mostrarError('La contraseña no coincide.');
            return false;
        }

        // Verifica la longitud de la contraseña
        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }

        // Si pasa todas las validaciones
        setError('');
        return true;
    };

    const mostrarError = (mensaje) => {
        setError(mensaje);
        setShowError(true);
        setTimeout(() => {
            setShowError(false);
        }, 3000); // Oculta el mensaje después de 3 segundos
    };

    const handleRegistrarse = () => {
        if (validarFormulario()) {
            console.log('Entre1')
            const nombreCompleto = nombre + " " + apellido
            console.log('Entre2')
            const values = {nombreCompleto, email, telefono, password};
            console.log('Entre3')
            axios.post('http://localhost:8081/registrarUsuario', values)
            .then(()=>{
                console.log('Entre4')
                navigate('/');
            })
            .catch(err => {
                console.log('Entre5')
                console.log('Error en el registro: ', err);
                mostrarError('Hubo un error al registrar el usuario.');
            });
        }
    };

    return (
        <div
            className="relative flex w-full min-h-screen flex-col bg-[#faf8fc] overflow-x-hidden"
            style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' , background: '#cea5db'}}
            
        >
            {/* Mensaje de Bienvenida */}
            <h2 className="text-[#140e1b] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
                ¡Regístrate!
            </h2>

            {/* Contenedor del Formulario */}
            <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
                {/* Campos de Entrada */}
                <div className="flex flex-col gap-4">
                    <label htmlFor='name' className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Ingresa tu(s) nombre(s)"
                            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </label>
                    <label htmlFor='lastname' className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Ingresa tu(s) apellido(s)"
                            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                        />
                    </label>
                    <label htmlFor='phone' className="flex flex-col">
                        <input
                            type="tel"
                            pattern='[0-9]{10}'
                            placeholder="Ingresa tu teléfono"
                            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </label>
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
                    <label htmlFor='confirmPassword' className="flex flex-col">
                        <input
                            type="password"
                            placeholder="Confirmar tu contraseña"
                            className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </label>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-center mt-4">
                    <button
                        type="button"
                        className="rounded-full bg-[#8019e6] text-[#faf8fc] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#5f0fb3] transition duration-200"
                        onClick={handleRegistrarse}
                    >
                        Confirmar
                    </button>
                </div>
            </div>

            {/* Mensaje de Error */}
            {showError && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-md shadow-md">
                    {error}
                </div>
            )}


        </div>
    );
}

export default Registrarse;
