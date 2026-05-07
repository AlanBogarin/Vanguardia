//---------------------------------------------------------------------------------------
function cerrarSesion() {
    alertify.confirm("Nombre del sistema", "¿Quieres cerrar la sesión del usuario?",
        function(){
            localStorage.removeItem("nomUsuario"); //Elimina el nombre del usuario
            window.location.href = "index.html"; // Redirige al login
        },
        function(){
            
        }
    ).set('labels', {ok:'Sí', cancel:'No'}).set('transition', 'slide');
}
//---------------------------------------------------------------------------------------

// Función para cargar componentes HTML externos
function cargarComponentes() {
    // Cargar Navbar
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('contenedor-navbar').innerHTML = data;
        })
        .catch(error => console.error('Error al cargar navbar:', error));

    // Cargar Sidebar
    fetch('sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('contenedor-sidebar').innerHTML = data;
            
            // Inicializar el nombre del usuario después de cargar el menú lateral
            var nom = localStorage.getItem("nomUsuario");
            if (nom != "" && nom != null) {
                let usuarioDiv = document.getElementById("usuario");
                if(usuarioDiv) usuarioDiv.innerHTML = nom;
            }
        })
        .catch(error => console.error('Error al cargar sidebar:', error));
}
//---------------------------------------------------------------------------------------
