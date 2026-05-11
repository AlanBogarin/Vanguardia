//---------------------------------------------------------------------------------------
function cerrarSesion() {
    alertify.confirm("Nombre del sistema", "¿Quieres cerrar la sesión del usuario?",
        function(){
            localStorage.removeItem("nomUsuario"); //Elimina el nombre del usuario
            window.location.href = "login.html"; // Redirige al login
        },
        function(){
            
        }
    ).set('labels', {ok:'Sí', cancel:'No'}).set('transition', 'slide');
}
//---------------------------------------------------------------------------------------

/**
 * Carga los componentes basicos: Navbar, Sidebar, Footer
 */
function cargarComponentes() {
    cargarComponente("contenedor-navbar", "componentes/navbar.html");
    cargarComponente("contenedor-sidebar", "componentes/sidebar.html");
    cargarComponente("contenedor-footer", "componentes/footer.html");
    // Inicializar el nombre del usuario después de cargar el menú lateral
    var nom = localStorage.getItem("nomUsuario");
    if (nom != "" && nom != null) {
        let usuarioDiv = document.getElementById("usuario");
        if(usuarioDiv) usuarioDiv.innerHTML = nom;
    }
}

/**
 * Funcion para cargar componentes especificos en el html
 * @param {string} id ID de la etiqueta html
 * @param {string} path Ruta del archivo html a cargar
 */
function cargarComponente(id, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar " + path);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}
