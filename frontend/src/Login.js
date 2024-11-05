import React from 'react';

function Login() {
  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded" style={{ width: '90%', maxWidth: '400px' }}>
        <form action="">
          <div className="mb-3">
            <label htmlFor="email"><strong>Correo:</strong></label>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              className="form-control rounded-0"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password"><strong>Contraseña:</strong></label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="form-control rounded-0"
            />
          </div>
          <button className="btn btn-success w-100 rounded-0"><strong>Ingresar</strong></button>
          <p></p>
          <button className="btn btn-default border w-100 bg-light rounded-0">Registrarse</button>
          <p></p>
          <a href="">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </div>
  );
}

export default Login;