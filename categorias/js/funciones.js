let filaSeleccionada = null;

function obtenerFechaActual() {

    let fecha = new Date();

    let anio = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}


function nuevo() {

    document.getElementById("txtId").value = "";
    document.getElementById("txtCategoria").value = "";
    document.getElementById("txtDescripcion").value = "";

    filaSeleccionada = null;
}


function guardar() {

    let id = document.getElementById("txtId").value;
    let categoria = document.getElementById("txtCategoria").value;
    let descripcion = document.getElementById("txtDescripcion").value;

    if (id == "" || categoria == "" || descripcion == "") {

        alert("Complete todos los campos");
        return;
    }


    let tabla = document.getElementById("tablaCategorias")
                .getElementsByTagName("tbody")[0];


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


function seleccionarFila(fila) {

    filaSeleccionada = fila;

    document.getElementById("txtId").value = fila.cells[0].innerHTML;
    document.getElementById("txtCategoria").value = fila.cells[1].innerHTML;
    document.getElementById("txtDescripcion").value = fila.cells[2].innerHTML;
}


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


    // SOLO CAMBIA LA FECHA DE MODIFICACION
    filaSeleccionada.cells[4].innerHTML = obtenerFechaActual();


    alert("Registro modificado correctamente");

    nuevo();
}


function eliminarFila() {

    if (filaSeleccionada == null) {

        alert("Seleccione una fila para eliminar");
        return;
    }


    let confirmar = confirm("¿Desea eliminar el registro?");

    if (confirmar) {

        filaSeleccionada.remove();

        alert("Registro eliminado");

        nuevo();
    }
}


function exportarExcel() {

    let tabla = document.getElementById("tablaCategorias");

    let libro = XLSX.utils.table_to_book(tabla, {
        sheet: "Categorias"
    });

    XLSX.writeFile(libro, "categorias.xlsx");
}


async function exportarPDF() {

    const { jsPDF } = window.jspdf;

    let doc = new jsPDF('p', 'mm', 'a4');


    // ===== TITULO EMPRESA =====

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text("VANGUARDIA", 105, 18, { align: "center" });


    // ===== SUBTITULO =====

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
        "Comercialización de Productos Informáticos y Tecnológicos",
        105,
        25,
        { align: "center" }
    );


    // ===== DIRECCION =====

    doc.setFontSize(9);

    doc.text(
        "Dir.: Previstero Juan Carlos García / Madrinas de Guerra - Bo. Villa Armando - Concepción",
        105,
        31,
        { align: "center" }
    );


    // ===== TELEFONO =====

    doc.text(
        "Tel.: 0985 495-253",
        105,
        36,
        { align: "center" }
    );


    // ===== LINEA =====

    doc.line(15, 40, 195, 40);


    // ===== TITULO REPORTE =====

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.text(
        "LISTADO DE CATEGORÍAS",
        105,
        48,
        { align: "center" }
    );


    // ===== SUBTITULO TABLA =====

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(
        "Vanguardia - Categorías",
        105,
        57,
        { align: "center" }
    );


    // ===== TABLA =====

    doc.autoTable({

        html: '#tablaCategorias',

        startY: 65,

        theme: 'grid',

        styles: {
            fontSize: 9,
            halign: 'center'
        },

        headStyles: {
            fillColor: [33, 37, 41],
            textColor: [255, 255, 255]
        }
    });


    // ===== GUARDAR PDF =====

    doc.save("categorias.pdf");
}