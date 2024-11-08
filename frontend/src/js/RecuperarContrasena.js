import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import '../css/App.css';
import axios from 'axios';

function RecuperarContrasena() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [success, setSuccess] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);


    const validarFormulario = () => {
        if (!email) {
            mostrarError('Por favor, ingresa todos los campos correctamente.');
            return false;
        }
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            mostrarError('El correo electrónico no es válido.');
            return false;
        }
        setError('');
        return true;
    };

    const mostrarError = (mensaje) => {
        setError(mensaje);
        setShowError(true);
        setTimeout(() => {
            setShowError(false);
        }, 3000);
    };
    const mostrarSuccess = (mensaje) => {
        setSuccess(mensaje);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    const handleRecuperarContrasena = () => {
        if (validarFormulario()) {
            const values = {email};
            axios.post('http://localhost:8081/recuperarContrasena', values)
                .then(() => {
                    mostrarSuccess('¡Revisa tu correo para validar tu contraseña!');
                })
                .catch(err => {
                    console.log('Error en la actualización: ', err);
                    mostrarError('Hubo un error al actualizar el usuario.');
                });
        }
    };

    return (
        <div className="relative flex w-full min-h-screen flex-col bg-[#faf8fc] overflow-x-hidden" style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif', background: '#cea5db' }}>
            <h2 className="text-[#140e1b] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
                ¡Recupera tu contraseña por correo!
            </h2>

            <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col gap-4">
                    <input type="email" placeholder="Ingresa tu correo electrónico" className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="flex justify-center mt-4">
                    <button type="button" className="rounded-full bg-[#8019e6] text-[#faf8fc] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#5f0fb3] transition duration-200" onClick={handleRecuperarContrasena}>
                        Validar correo
                    </button>
                </div>
            </div>

            {showError && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-md shadow-md">
                    {error}
                </div>
            )}
            {showSuccess && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-3 rounded-md shadow-md">
                    {success}
                </div>
            )}
        </div>
    );
}

export default RecuperarContrasena;