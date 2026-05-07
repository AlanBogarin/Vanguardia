function datos(){
    // CREAR UN ARRAY de objetos: usuarios---------------------------------------------
    var usuarios = [
        {
            idusuario: 1,
            cedula: "1234567",
            nombre: "AURORA ESCALANTE",
            celular: "0971-123456",
            usuario: "aurora",
            contrasena: "aurora123"
        },
        {
            idusuario: 2,
            cedula: "223344",
            nombre: "ANA BANDERAS",
            celular: "0971-001100",
            usuario: "ana",
            contrasena: "ana123"
        },
        {
            idusuario: 3,
            cedula: "556677",
            nombre: "CASIMIRO NOVENADA",
            celular: "0972-220022",
            usuario: "casimiro",
            contrasena: "casimiro123"
        }
    ];
    // Guardar en localStorage como cadena JSON
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // CREAR UN ARRAY de objetos: proveedores-----------------------------------------
    var proveedores = [
        {
            idproveedor: 1,
            ruc: "1234567-0",
            razonsocial: "DISTRI NORTE S.R.L.",
            direccion: "AV. SIN NOMBRE C/PUNTAS DEL NORTE",
            telefono: "0331-123456",
            ciudad: "CONCEPCIÓN"
        },
        {
            idproveedor: 2,
            ruc: "5400300-1",
            razonsocial: "COMERCIAL LUZ S.A.",
            direccion: "ALEJO GARCÍA Y EUSEBIO AYALA",
            telefono: "0971-102030",
            ciudad: "CIUDAD DEL ESTE"
        },
        {
            idproveedor: 3,
            ruc: "801234567-1",
            razonsocial: "INFORMÁTICA VIP",
            direccion: "AV. RODRIGUEZ DE FRANCIA 1050",
            telefono: "0981-302010",
            ciudad: "PEDRO JUAN CABALLERO"
        }
    ];
    localStorage.setItem("proveedores", JSON.stringify(proveedores));

    // CREAR UN ARRAY de objetos: marcas----------------------------------------------
    var marcas = [
        {
            idmarca: 1,
            marca: "AOC"
        },
        {
            idmarca: 2,
            marca: "INTEL"
        },
        {
            idmarca: 3,
            marca: "SAMSUNG"
        },
        {
            idmarca: 4,
            marca: "EPSON"
        },
        {
            idmarca: 5,
            marca: "SANDISK"
        }
    ];
    localStorage.setItem("marcas", JSON.stringify(marcas));
    // CREAR UN ARRAY de objetos: clasificaciones-------------------------------------
    var clasificaciones = [
        {
            idclasificacion: 1,
            clasificacion: "PENDRIVES"
        },
        {
            idclasificacion: 2,
            clasificacion: "IMPRESORAS"
        },
        {
            idclasificacion: 3,
            clasificacion: "CELULARES"
        },
        {
            idclasificacion: 4,
            clasificacion: "PROCESADORES"
        },
        {
            idclasificacion: 5,
            clasificacion: "MONITORES"
        }
    ];
    localStorage.setItem("clasificaciones", JSON.stringify(clasificaciones));

    // CREAR UN ARRAY de objetos: articulos-------------------------------------------
    var articulos = [
        {
            idarticulo: 1,
            codbarra: "1020304050600",
            descripcion: "MONITOR AOC 19P 1080",
            idmarca: 1,
            idclasificacion: 5,
            tiva: 10,
            stockactual: 20,
            preventa: 700000
        },
        {
            idarticulo: 2,
            codbarra: "1002003004000",
            descripcion: "PENDRIVE SANDISK 64GB",
            idmarca: 5,
            idclasificacion: 1,
            tiva: 5,
            stockactual: 15,
            preventa: 100000
        },
        {
            idarticulo: 3,
            codbarra: "1000200030000",
            descripcion: "PROCESADOR INTEL CORE I5",
            idmarca: 2,
            idclasificacion: 4,
            tiva: 0,
            stockactual: 10,
            preventa: 1050000
        }
    ];
    localStorage.setItem("articulos", JSON.stringify(articulos));

    // CREAR UN ARRAY de objetos: compras---------------------------------------------
    var comprascabecera = [
        {
            idcompra: 1,
            idproveedor: 1,
            numfactura: "001-001-1234567",
            feccompra: "2025-05-05",
            condicion: "CONTADO",
            stexenta: 0,
            stiva5: 200000,
            stiva10: 700000,
            totcompra: 900000,
            liqiva5: 9524,
            liqiva10: 63636,
            totiva: 73160,
            saldo: 0,
            anulado: "NO"
        }
    ];
    var comprasdetalle = [
        {
            idcompradet: 1,
            idcompra: 1,
            item: 1,
            idarticulo: 2,
            cantidad: 2,
            preuni: 100000,
            tiva: 5,
            subtotal: 200000
        },
        {
            idcompradet: 2,
            idcompra: 1,
            item: 2,
            idarticulo: 1,
            cantidad: 1,
            preuni: 700000,
            tiva: 10,
            subtotal: 700000
        },
    ];

    // Guardar en localStorage como cadena JSON
    localStorage.setItem("comprascabecera", JSON.stringify(comprascabecera));
    localStorage.setItem("comprasdetalle", JSON.stringify(comprasdetalle));
    //---------------------------------------------------------------------------------
}