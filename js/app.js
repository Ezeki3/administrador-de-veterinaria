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

// Heading
const heading = document.querySelector('#administra');

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

    const fnTextoHeading = this.textoHeading;

    const total = objectStore.count();
    total.onsuccess = function () {
      fnTextoHeading(total.result)
    }

    // Crear el template
    objectStore.openCursor().onsuccess = function (e) {

      const cursor = e.target.result;

      if (cursor) {
        const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cursor.value;

        const divCita = document.createElement('div');
        divCita.classList.add('cita', 'p-3');
        divCita.dataset.id = id;

        // scRIPTING DE LOS ELEMENTOS...
        const mascotaParrafo = document.createElement('h2');
        mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
        mascotaParrafo.innerHTML = `${mascota}`;

        const propietarioParrafo = document.createElement('p');
        propietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${propietario}`;

        const telefonoParrafo = document.createElement('p');
        telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono: </span> ${telefono}`;

        const fechaParrafo = document.createElement('p');
        fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

        const horaParrafo = document.createElement('p');
        horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

        const sintomasParrafo = document.createElement('p');
        sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

        // Agregar un botón de eliminar...
        const btnEliminar = document.createElement('button');
        btnEliminar.onclick = () => eliminarCita(id); // añade la opción de eliminar
        btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
        btnEliminar.innerHTML = 'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

        // Añade un botón de editar...
        const btnEditar = document.createElement('button');
        const cita = cursor.value;
        btnEditar.onclick = () => cargarEdicion(cita);

        btnEditar.classList.add('btn', 'btn-info');
        btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'

        // Agregar al HTML
        divCita.appendChild(mascotaParrafo);
        divCita.appendChild(propietarioParrafo);
        divCita.appendChild(telefonoParrafo);
        divCita.appendChild(fechaParrafo);
        divCita.appendChild(horaParrafo);
        divCita.appendChild(sintomasParrafo);
        divCita.appendChild(btnEliminar)
        divCita.appendChild(btnEditar)

        contenedorCitas.appendChild(divCita);

        // Ve al siguiente elemento
        cursor.continue();
      }
    }
  }

  textoHeading(resultado) {
    if (resultado > 0) {
      heading.textContent = 'Administra tus Citas '
    } else {
      heading.textContent = 'No hay Citas, comienza creando una'
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

    // Edita en IndexDB
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.put(citaObj);

    transaction.oncomplete = () => {
      // ui.imprimirAlerta('Guardado correctamente')
      // Regresar el texto del boton a su estado original
      formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';

      // Quitar modo edicion
      editando = false;
    }

    transaction.onerror = () => {
      console.log('hubo un error');
    }

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

    // Mostrar citas al cargar (Pero indexdb ya esta listo)
    ui.imprimirCitas();
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