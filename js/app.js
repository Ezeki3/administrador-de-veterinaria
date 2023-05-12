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

class Citas {
  constructor() {
    this.citas = [];
  }
}

class UI {

}

const ui = new UI();
const administrarCitas = new Citas();

// Registrar eventos
eventListeners();
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
  console.log(citaObj);
}

// Valida y agrega una nueva cita a la clase de citas
function nuevaCita(e) {
  e.preventDefault();

  // Extraer la informacion del objeto de cita
  const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

  // Validacion
  if (mascota === '' || propietario === '' || telefono === '' || fecha === '', hora === '' || sintomas === '') {
    console.log('todos los campos son obligatorios');
    return
  }
}