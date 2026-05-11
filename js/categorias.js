let filaSeleccionada = null;


// ======================
// OBTENER FECHA ACTUAL
// ======================

function obtenerFechaActual() {

    let fecha = new Date();

    let anio = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}


// ======================
// NUEVO
// ======================

function nuevo() {

    document.getElementById("txtId").value = "";
    document.getElementById("txtCategoria").value = "";
    document.getElementById("txtDescripcion").value = "";

    filaSeleccionada = null;
}


// ======================
// GUARDAR
// ======================

function guardar() {

    let id = document.getElementById("txtId").value;
    let categoria = document.getElementById("txtCategoria").value;
    let descripcion = document.getElementById("txtDescripcion").value;


    if (id == "" || categoria == "" || descripcion == "") {

        alert("Complete todos los campos");
        return;
    }


    let tabla = document.querySelector("#tablaCategorias tbody");


    // VALIDAR ID REPETIDO
    for (let i = 0; i < tabla.rows.length; i++) {

        if (tabla.rows[i].cells[0].innerHTML == id) {

            alert("El ID ya existe");
            return;
        }
    }


    let fechaActual = obtenerFechaActual();

    let fila = tabla.insertRow();

    fila.insertCell(0).innerHTML = id;
    fila.insertCell(1).innerHTML = categoria;
    fila.insertCell(2).innerHTML = descripcion;
    fila.insertCell(3).innerHTML = fechaActual;
    fila.insertCell(4).innerHTML = fechaActual;


    fila.onclick = function () {
        seleccionarFila(this);
    }

    nuevo();
}


// ======================
// SELECCIONAR FILA
// ======================

function seleccionarFila(fila) {

    filaSeleccionada = fila;

    document.getElementById("txtId").value = fila.cells[0].innerHTML;
    document.getElementById("txtCategoria").value = fila.cells[1].innerHTML;
    document.getElementById("txtDescripcion").value = fila.cells[2].innerHTML;
}


// ======================
// MODIFICAR
// ======================

function modificar() {

    if (filaSeleccionada == null) {

        alert("Seleccione una fila");
        return;
    }


    let id = document.getElementById("txtId").value;
    let categoria = document.getElementById("txtCategoria").value;
    let descripcion = document.getElementById("txtDescripcion").value;


    if (id == "" || categoria == "" || descripcion == "") {

        alert("Complete todos los campos");
        return;
    }


    filaSeleccionada.cells[0].innerHTML = id;
    filaSeleccionada.cells[1].innerHTML = categoria;
    filaSeleccionada.cells[2].innerHTML = descripcion;

    filaSeleccionada.cells[4].innerHTML = obtenerFechaActual();

    alert("Registro modificado correctamente");

    nuevo();
}


// ======================
// ELIMINAR
// ======================

function eliminarFila() {

    if (filaSeleccionada == null) {

        alert("Seleccione una fila");
        return;
    }


    let confirmar = confirm("¿Desea eliminar el registro?");

    if (confirmar) {

        filaSeleccionada.remove();

        alert("Registro eliminado");

        nuevo();
    }
}


// ======================
// VACIAR TABLA
// ======================

function vaciarTabla() {

    let confirmar = confirm("¿Desea vaciar todos los registros?");

    if (confirmar) {

        let tbody = document.querySelector("#tablaCategorias tbody");

        tbody.innerHTML = "";

        nuevo();

        alert("Todos los registros fueron eliminados");
    }
}


// ======================
// EXPORTAR EXCEL
// ======================

function exportarExcel() {

    let tabla = document.getElementById("tablaCategorias");

    let libro = XLSX.utils.table_to_book(tabla, {
        sheet: "Categorias"
    });

    XLSX.writeFile(libro, "categorias.xlsx");
}


// ======================
// EXPORTAR PDF
// ======================

async function exportarPDF() {

    const { jsPDF } = window.jspdf;

    let doc = new jsPDF();


    // FECHA Y HORA
    let fechaHora = new Date();

    let fechaTexto =
        fechaHora.toLocaleDateString() + " " +
        fechaHora.toLocaleTimeString();


    // LOGO
    try {

        let logo = new Image();

        logo.src = "./img/logo.png";

        await new Promise((resolve) => {

            logo.onload = () => {

                doc.addImage(logo, 'PNG', 10, 5, 30, 30);

                resolve();
            };

            logo.onerror = () => {
                resolve();
            };
        });

    } catch (error) {

        console.log("No se pudo cargar el logo");
    }


    // TITULO
    doc.setFontSize(18);

    doc.text("LISTADO DE CATEGORÍAS", 60, 20);


    // TABLA
    doc.autoTable({

        html: '#tablaCategorias',

        startY: 35,

        theme: 'grid',

        headStyles: {
            fillColor: [0, 0, 0]
        },


        didDrawPage: function (data) {

            let paginaActual =
                doc.internal.getCurrentPageInfo().pageNumber;

            let totalPaginas =
                doc.internal.getNumberOfPages();


            // FECHA ABAJO IZQUIERDA
            doc.setFontSize(10);

            doc.text(
                fechaTexto,
                10,
                doc.internal.pageSize.height - 10
            );


            // PAGINA ABAJO DERECHA
            doc.text(
                "Pág. " + paginaActual + "/" + totalPaginas,
                170,
                doc.internal.pageSize.height - 10
            );
        }
    });


    // GUARDAR PDF
    doc.save("Nombre del Sistema.pdf");
}


// ======================
// CARGAR 10 REGISTROS
// ======================

window.onload = function () {

    let datos = [

        [1, "Electrónica", "Productos electrónicos"],
        [2, "Computación", "Equipos informáticos"],
        [3, "Celulares", "Smartphones y accesorios"],
        [4, "Impresoras", "Impresoras y tintas"],
        [5, "Audio", "Parlantes y auriculares"],
        [6, "Gaming", "Consolas y videojuegos"],
        [7, "Redes", "Routers y cables"],
        [8, "Oficina", "Artículos de oficina"],
        [9, "Monitores", "Pantallas y monitores"],
        [10, "Seguridad", "Cámaras y alarmas"]
    ];


    let tabla = document.querySelector("#tablaCategorias tbody");


    datos.forEach(function (item) {

        let fila = tabla.insertRow();

        fila.insertCell(0).innerHTML = item[0];
        fila.insertCell(1).innerHTML = item[1];
        fila.insertCell(2).innerHTML = item[2];
        fila.insertCell(3).innerHTML = obtenerFechaActual();
        fila.insertCell(4).innerHTML = obtenerFechaActual();


        fila.onclick = function () {
            seleccionarFila(this);
        }
    });
}