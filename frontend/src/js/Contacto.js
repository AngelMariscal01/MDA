import React from 'react';
import '../css/Contacto.css';
import qrImage from '../assets/minidosnas.jpg'; // Asegúrate de tener una imagen de código QR en esta ruta

function Contacto() {
    return (
        <div className="contacto">
            <div className="contact-box">
            <a href='https://www.instagram.com/mini_donas_arenita/'>
                <img src={qrImage} alt="Código QR" className="qr-image" />
            </a>
            <p className="contact-info">
                <a href="tel:3512239057" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Teléfono: 351 223 9057
                </a>
            </p>
            <p className="contact-info">
                <a href="mailto:Ale.rb.90@outlook.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Ale.rb.90@outlook.com
                </a>
            </p>
            </div>
        </div>
    );
}

export default Contacto;
