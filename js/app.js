let DB;

// Campos del formulario
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

// UI
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas');

let editando;

window.onload = () => {
  eventListeners();

  crearDB();
}
class Citas {
  constructor() {
    this.citas = [];
  }

  agregarCita(cita) {
    this.citas = [...this.citas, cita];
  }

  eliminarCita(id) {
    // quitamos el elemento con filter segun la condicion
    this.citas = this.citas.filter(cita => cita.id !== id)
  }

  editarCita(citaActualizada) {
    this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);
  }
}

class UI {
  imprimirAlerta(mensaje, tipo) {
    // crear el div
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

    // Agregar clase en base al tipo de error
    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger');
    } else {
      divMensaje.classList.add('alert-success');
    }

    // Mensaje de error
    divMensaje.textContent = mensaje;

    // Agregar al DOM
    document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

    // Quitar la alerta despues de 3 segundos
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  imprimirCitas() {

    this.limpiarHTML();

    // Leer el contenido de la base de datos 
    const objectStore = DB.transaction('citas').objectStore('citas');

    objectStore.openCursor().onsuccess = function (e) {
      console.log(e.target.result);
    }
  }

  limpiarHTML() {
    while (contenedorCitas.firstChild) {
      contenedorCitas.removeChild(contenedorCitas.firstChild)
    }
  }

}

const ui = new UI();
const administrarCitas = new Citas();



// Registrar eventos

function eventListeners() {
  mascotaInput.addEventListener('change', datosCita);
  propietarioInput.addEventListener('change', datosCita);
  telefonoInput.addEventListener('change', datosCita);
  fechaInput.addEventListener('change', datosCita);
  horaInput.addEventListener('change', datosCita);
  sintomasInput.addEventListener('change', datosCita);

  formulario.addEventListener('submit', nuevaCita);
}

// Objeto con la informacion de la cita
const citaObj = {
  // name para relacionarlo con los inputs de html
  mascota: '',
  propietario: '',
  telefono: '',
  fecha: '',
  hora: '',
  sintomas: ''
}

// Funcion para agregar datos al objeto
function datosCita(e) {
  // name para relacionarlo con los inputs de html
  citaObj[e.target.name] = e.target.value
}

// Valida y agrega una nueva cita a la clase de citas
function nuevaCita(e) {
  e.preventDefault();

  // Extraer la informacion del objeto de cita
  const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

  // Validacion
  if (mascota === '' || propietario === '' || telefono === '' || fecha === '', hora === '' || sintomas === '') {
    ui.imprimirAlerta('Todos los campos son obligatorios', 'error')
    return;
  }

  if (editando) {
    ui.imprimirAlerta('Editado correctamente');

    // Pasar el objeto de la cita
    administrarCitas.editarCita({ ...citaObj })

    // Regresar el texto del boton a su estado original
    formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';

    // Quitar modo edicion
    editando = false;

  } else {

    // Generar un id unico
    citaObj.id = Date.now();

    // Creando una nueva cita
    administrarCitas.agregarCita({ ...citaObj });//agregamos una copia de citaObj

    // Insertar Registro en INDEXDB
    const transaction = DB.transaction(['citas'], 'readwrite');

    // Habilitar el objectStore
    const objectStore = transaction.objectStore('citas');

    // Insertar en la  DB
    objectStore.add(citaObj);

    transaction.oncomplete = function () {
      console.log('cita agregada');

      // Mensaje de agregado correctamente
      ui.imprimirAlerta('La cita se agrego correctamente');

    }

  }

  // Mandamos a llamar el reinicio del objeto
  reiniciarObjeto();

  // Reinicia el formulario
  formulario.reset();

  // Mostrar el HTML de las citas
  ui.imprimirCitas()
}

// Despues que se han cargado los datos volvemos a reiniciar el objeto
function reiniciarObjeto() {
  citaObj.mascota = '';
  citaObj.propietario = '';
  citaObj.telefono = '';
  citaObj.fecha = '';
  citaObj.hora = '';
  citaObj.sintomas = '';
}

function eliminarCita(id) {
  // Eliminar la cita
  administrarCitas.eliminarCita(id);

  // Mostrar un mensaje
  ui.imprimirAlerta('La cita se elimino correctamente');

  // Refrescar las citas
  ui.imprimirCitas();
}

// Carga los datos y el modo de edicion
function cargarEdicion(cita) {
  const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

  // Lenar los inputs con la info de las variables que viene de cita
  mascotaInput.value = mascota;
  propietarioInput.value = propietario;
  telefonoInput.value = telefono;
  fechaInput.value = fecha;
  horaInput.value = hora;
  sintomasInput.value = sintomas;

  // Llenar el objeto
  citaObj.mascota = mascota;
  citaObj.propietario = propietario;
  citaObj.telefono = telefono;
  citaObj.fecha = fecha;
  citaObj.hora = hora;
  citaObj.sintomas = sintomas;
  citaObj.id = id;


  // Cambiar el texto del boton
  formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  editando = true;
}

function crearDB() {
  // Crear la base de datos version 1.0
  const crearDB = window.indexedDB.open('citas', 1);

  // si hay un error
  crearDB.onerror = function () {
    console.log('hubo un error');
  }

  // si todo sale bien
  crearDB.onsuccess = function () {
    console.log('bd creada');

    DB = crearDB.result;

    console.log(DB);
  }

  // Definir el schema
  crearDB.onupgradeneeded = function (e) {
    const db = e.target.result;

    const objectStore = db.createObjectStore('citas', {
      keyPath: 'id',
      autoIncrement: true
    })

    // Definimos las columnas
    objectStore.createIndex('mascota', 'mascota', { unique: false });
    objectStore.createIndex('propietario', 'propietario', { unique: false });
    objectStore.createIndex('telefono', 'telefono', { unique: false });
    objectStore.createIndex('fecha', 'fecha', { unique: false });
    objectStore.createIndex('hora', 'hora', { unique: false });
    objectStore.createIndex('sintomas', 'sintomas', { unique: false });
    objectStore.createIndex('id', 'id', { unique: true });

    console.log('db creada y lista');
  }
}