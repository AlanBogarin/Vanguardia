import * as bd from "./bd.js";
import { hashPassword } from "./util.js";

async function login() {
    const form = document.getElementById("login-form");
    const inputUsuario = document.getElementById("usuario").trim();
    const inputContra = document.getElementById("contra").trim();
    const mensaje = document.getElementById("mensaje");
    // Agregar la clase de Bootstrap para mostrar los textos rojos de invalid-feedback
    form.classList.add('was-validated');
    // Comprobar si el formulario NO es válido (es decir, si hay campos vacíos)
    if (!form.checkValidity()) {
        // Mostrar mensaje en el card-footer
        mensaje.textContent = "Por favor, complete los campos solicitados.";
        mensaje.style.color = "red";
        if (inputUsuario.value === "") {
            inputUsuario.focus();
        } else if (inputContra.value === "") {
            inputContra.focus();
        }
        // Ocultar el mensaje después de 5 segundos
        setTimeout(function () {
            mensaje.textContent = "";
        }, 5000);
        return;
    }
    // CUANDO AMBOS CAMPOS TIENEN TEXTO SE VALIDAN LOS CREDENCIALES.
    const usuarioIngresado = inputUsuario.value;
    const contrasenaIngresada = inputContra.value;
    // Recuperar usuarios del localStorage
    const usuarios = bd.cargarUsuarios();
    const datosGuardados = localStorage.getItem("usuarios");
    // Buscar si existe el usuario
    const usuarioEncontrado = usuarios.find(
        (u) => u.usuario === usuarioIngresado && u.contrasena === contrasenaIngresada
    );

    if (!usuarioEncontrado) {
        // Si el usuario o contraseña son incorrectos
        mensaje.textContent = "Usuario o contraseña incorrectos.";
        mensaje.style.color = "red";
        inputUsuario.focus(); // Foco al usuario para que vuelva a intentar

        setTimeout(function () {
            mensaje.textContent = "";
        }, 2000);
    } else {
        // Si todo está correcto, ingresa al sistema
        localStorage.setItem("nomUsuario", usuarioEncontrado.nombre);
        window.location.href = "menu.html";
    }
}

if (false) {
    window.location.href = "menu.html";
}
function verBD() {
    
}
function nuevoBD() {
    initDB();
    cargarDatosPrueba();
    alertify.success("Base de datos original cargada");
}

function borrarBD() {
    localStorage.clear();
    alertify.error("Base de datos eliminada");
}