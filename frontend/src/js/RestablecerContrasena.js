import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RestablecerContrasena() {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    // Obtiene el token desde la URL (por ejemplo, /reset-password?token=XYZ)
    const queryParams = new URLSearchParams(location.search);
    console.log(queryParams)
    const token = queryParams.get('token');

    const validarFormulario = () => {
        if (!password || !confirmPassword) {
            toast.error('Por favor, ingresa todos los campos.');
            return false;
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return false;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        return true;
    };

    const handleRestablecerContrasena = () => {
        console.log(password)
        if (validarFormulario()) {
            axios.post('http://localhost:8081/restablecerContrasena', { password, token })
                .then(() => {
                    toast.success('¡Tu contraseña ha sido restablecida con éxito!');
                    setTimeout(() => navigate('/'), 3000); // Redirige al login después de 3 segundos
                })
                .catch(err => {
                    console.error('Error al restablecer la contraseña:', err);
                    toast.error('Hubo un error al restablecer la contraseña.');
                });
        }
    };

    return (
        <div className="relative flex w-full min-h-screen flex-col bg-[#faf8fc] overflow-x-hidden" style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif', background: '#cea5db' }}>
            <h2 className="text-[#140e1b] text-2xl font-bold text-center pt-5 pb-3 sm:text-3xl md:text-4xl lg:text-5xl">
                Restablece tu contraseña
            </h2>

            <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col gap-4">
                    <input 
                        type="password" 
                        placeholder="Nueva contraseña" 
                        className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <input 
                        type="password" 
                        placeholder="Confirma la nueva contraseña" 
                        className="form-input rounded-xl bg-[#ede7f3] text-[#140e1b] placeholder:text-[#734e97] h-12 sm:h-14 px-4 py-2 sm:py-3 text-base leading-tight" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </div>

                <div className="flex justify-center mt-4">
                    <button 
                        type="button" 
                        className="rounded-full bg-[#8019e6] text-[#faf8fc] h-12 sm:h-14 w-full font-bold text-base sm:text-lg tracking-wide hover:bg-[#5f0fb3] transition duration-200" 
                        onClick={handleRestablecerContrasena}
                    >
                        Restablecer contraseña
                    </button>
                </div>

                <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
        </div>
    );
}

export default RestablecerContrasena;
