// ==========================================================================
// PRÁCTICA: CALENDARIO Y AGENDA EN JAVASCRIPT VANILLA
// ==========================================================================

// --- ESTADO GLOBAL Y ELEMENTOS DEL DOM ---

let currentDate = new Date(); // Fecha actual que se muestra en el calendario
let selectedDateKey = null;   // Fecha seleccionada en formato 'YYYY-MM-DD'

// En la Fase 1 y 2 usaremos este objeto en memoria.
// ¡En la Fase 3 lo conectaremos con LocalStorage!
let events = {};

// Selección de elementos del DOM (Ya completado)
const monthYearDisplay = document.getElementById('month-year-display');
const daysGrid = document.getElementById('days-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const selectedDateDisplay = document.getElementById('selected-date-display');
const eventForm = document.getElementById('event-form');
const eventInput = document.getElementById('event-input');
const eventsList = document.getElementById('events-list');

const notifyBtn = document.getElementById('notify-btn');
const shareBtn = document.getElementById('share-btn');

const monthNames = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
];


// ==========================================================================
// FASE 1: RENDERIZADO DEL CALENDARIO Y NAVEGACIÓN (DATE + DOM)
// ==========================================================================

/**
 * Devuelve una fecha en formato YYYY-MM-DD con ceros a la izquierda si hace falta.
 */
function formatDateKey(year, month, day) {
  // TODO: Convierte el mes (+1) y el día, respectivamente, a String y rellena con ceros a la izquierda con .padStart(2, '0')
  const mesTexto = String(month + 1).padStart(2, '0');
  const diaTexto = String(day).padStart(2, '0');
  // TODO: Devuelve la fecha en formato YYYY-MM-DD
  return `${year}-${mesTexto}-${diaTexto}`;
}

/**
 * Genera y dibuja la cuadrícula de días del mes actual.
 */
function renderCalendar() {
  // TODO 1: Limpia el contenido actual de 'daysGrid'

  daysGrid.innerHTML = "";

  // TODO 2: Obtén el año y el mes de 'currentDate' y actualiza el texto de '#monthYearDisplay'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

  // TODO 3: Cálculo de casillas vacías iniciales (padding):
  //  - Obtén el primer día de la semana del mes: new Date(year, month, 1).getDay()

  const primerDia = new Date(year, month, 1).getDay();

  //  - Ajústalo para que la semana empiece en Lunes (Lunes = 0, Domingo = 6)

  const diasVacios = (primerDia + 6) % 7;

  //  - Crea las casillas vacías (<div class="day empty"></div>) y añádelas a 'daysGrid' (appendChild)

  for (let i = 0; i < diasVacios; i++) {
    const casillaVacia = document.createElement('div');
    casillaVacia.classList.add('day', 'empty');
    daysGrid.appendChild(casillaVacia);
  }

  // TODO 4: Cálculo de días totales del mes:
  //  - Usa el truco: new Date(year, month + 1, 0).getDate()

  const totalDays = new Date(year, month + 1, 0).getDate();

  // TODO 5: Bucle para dibujar cada día (1..totalDays):
  for (let day = 1; day <= totalDays; day++) {

    //  - Crea un div con la clase .day y el texto del número de día
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.textContent = day;

    //  - Genera la clave 'dateKey' usando formatDateKey()
    const dateKey = formatDateKey(year, month, day);

    //  - Añade la clase .today si el día, mes y año coinciden con la fecha actual de hoy (new Date())
    const hoy = new Date();
    if (day === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear()) {
      dayElement.classList.add('today');
    }

    //  - Añade la clase .has-events si existe events[dateKey] con elementos
    if (events[dateKey] && events[dateKey].length > 0) {
      dayElement.classList.add('has-events');
    }

    //  - Añade la clase .selected si dateKey === selectedDateKey
    if (dateKey === selectedDateKey) {
      dayElement.classList.add('selected');
    }

    //  - Asigna el evento click para llamar a selectDate(dateKey, dayElement)
    dayElement.addEventListener('click', () => selectDate(dateKey, dayElement));

    //  - Añade la casilla a 'daysGrid' (appendChild)
    daysGrid.appendChild(dayElement);
  }
}

// TODO: Escuchadores de eventos para los botones de navegación prevBtn y nextBtn
// (Sumar o restar 1 mes a 'currentDate' y volver a llamar a renderCalendar())
prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});


// ==========================================================================
// FASE 2: SELECCIÓN DE DÍA Y GESTIÓN DE EVENTOS EN MEMORIA
// ==========================================================================

/**
 * Selecciona un día del calendario y actualiza la interfaz.
 */
function selectDate(dateKey, element) {
  // TODO 1: Elimina la clase .selected de todos los días (.day)
  const casillas = document.querySelectorAll('.day');

  for (const dayElement of casillas) {
    dayElement.classList.remove('selected');
  }

  // TODO 2: Añade la clase .selected al día clicado y actualiza 'selectedDateKey'
  element.classList.add('selected');
  selectedDateKey = dateKey;

  // TODO 3: Actualiza el título 'selectedDateDisplay' y llama a renderEvents()
  const partesFecha = dateKey.split('-');
  const anioTexto = partesFecha[0];
  const mesTexto = partesFecha[1];
  const diaTexto = partesFecha[2];

  const numDia = Number(diaTexto);
  const indiceMes = Number(mesTexto) - 1;
  const nombreMes = monthNames[indiceMes];

  selectedDateDisplay.textContent = `${numDia} de ${nombreMes} de ${anioTexto}`;

  renderEvents();
}

/**
 * Renderiza la lista de eventos del día seleccionado.
 */
function renderEvents() {
  // TODO 1: Limpia 'eventsList'
  eventsList.innerHTML = '';

  // TODO 2: Si no hay 'selectedDateKey', sal de la función
  if (!selectedDateKey) {
    return;
  }

  // TODO 3: Obtén los eventos de 'selectedDateKey' o un array vacío
  let eventosDia = events[selectedDateKey];

  if (!eventosDia) {
    eventosDia = [];
  }

  // TODO 4: Recorre los eventos y crea los <li> con un <span> (✕) para eliminarlos
  for (let posicion = 0; posicion < eventosDia.length; posicion++) {
    const eventText = eventosDia[posicion];

    const itemEvento = document.createElement('li');
    itemEvento.textContent = eventText;

    const botonBorrar = document.createElement('span');
    botonBorrar.classList.add('delete-btn');
    botonBorrar.textContent = '✕';

    function borrarEvento() {
      removeEvent(posicion);
    }
    botonBorrar.addEventListener('click', borrarEvento);

    itemEvento.appendChild(botonBorrar);
    eventsList.appendChild(itemEvento);
  }
}

/**
 * Añadir un nuevo evento a la fecha seleccionada.
 */
function addEvent(e) {
  e.preventDefault();
  // TODO 1: Valida que haya un día seleccionado (selectedDateKey) y texto en el input
  const textoEscrito = eventInput.value;
  const textoLimpio = textoEscrito.trim();

  if (!selectedDateKey || !textoLimpio) {
    return;
  }

  // TODO 2: Si no existe events[selectedDateKey], inicialízalo como un array vacío []
  if (!events[selectedDateKey]) {
    events[selectedDateKey] = [];
  }

  // TODO 3: Añade el texto al array de eventos de la fecha
  const eventosDia = events[selectedDateKey];
  eventosDia.push(textoLimpio);
  saveEvents();

  // TODO 4: Limpia el input y vuelve a llamar a renderEvents() y renderCalendar()
  eventInput.value = '';
  renderEvents();
  renderCalendar();
}

/**
 * Elimina un evento por su posición (índice).
 */
function removeEvent(index) {
  // TODO 1: Elimina el elemento del array con splice(index, 1)
  const eventosDia = events[selectedDateKey];
  const cantidad = 1;
  eventosDia.splice(index, cantidad);

  // TODO 2: Si el array se queda vacío, elimina la clave del objeto 'events' con 'delete'
  const diaVacio = eventosDia.length === 0;

  if (diaVacio) {
    delete events[selectedDateKey];
  }

  saveEvents();

  // TODO 3: Vuelve a llamar a renderEvents() y renderCalendar()
  renderEvents();
  renderCalendar();
}

// TODO: Escuchador de evento para el formulario eventForm (submit -> addEvent)
eventForm.addEventListener('submit', addEvent);


// ==========================================================================
// FASE 3: PERSISTENCIA DE DATOS (LOCALSTORAGE Y JSON)
// ==========================================================================

/**
 * Guarda el objeto 'events' en LocalStorage convertido a texto JSON.
 */
function saveEvents() {
  // TODO: Usa JSON.stringify(events) y localStorage.setItem('calendar_events', ...)
  const eventosJson = JSON.stringify(events);
  localStorage.setItem('calendar_events', eventosJson);
}

/**
 * Carga los eventos de LocalStorage al iniciar la aplicación.
 */
function loadEvents() {
  // TODO: Usa localStorage.getItem('calendar_events') y JSON.parse()
  const jsonGuardado = localStorage.getItem('calendar_events');

  // Devuelve el objeto obtenido o un objeto vacío {} si no había nada guardado.
  if (!jsonGuardado) {
    return {};
  }

  const eventosGuardados = JSON.parse(jsonGuardado);
  return eventosGuardados;
}

// TODO: Modifica addEvent() y removeEvent() para que llamen a saveEvents() después de modificar datos.


// ==========================================================================
// FASE 4: RESTO DE APIS DEL NAVEGADOR (NOTIFICATION Y WEB SHARE)
// ==========================================================================

/**
 * Muestra una notificación del sistema si tenemos permiso concedido.
 */
function sendNotification(title, body) {
  // TODO: Comprueba si Notification.permission === 'granted' y crea una new Notification()
  // ¡Mira en la práctica AC2 cómo se hace!
  const hayPermiso = Notification.permission === 'granted';

  if (!hayPermiso) {
    return;
  }

  const opciones = {
    body: body
  };

  new Notification(title, opciones);
}

// TODO: Escuchador de evento para 'notifyBtn' (Solicitar permisos de notificación)
// ¡Mira en la práctica AC2 cómo se hace!
async function activarNotificaciones() {
  const admiteNotificaciones = 'Notification' in window;

  if (!admiteNotificaciones) {
    alert('Tu navegador no soporta notificaciones');
    return;
  }

  const respuesta = await Notification.requestPermission();

  if (respuesta === 'granted') {
    sendNotification('Notificaciones activadas', 'Ahora recibirás avisos del calendario');
  } else {
    alert('No has dado permiso para las notificaciones');
  }
}

notifyBtn.addEventListener('click', activarNotificaciones);


// TODO: Escuchador de evento para 'shareBtn' (Web Share API con fallback a clipboard)
// ¡Mira en la práctica AC2 cómo se hace!
async function compartirDia() {
  // 1. Sin día seleccionado no hay nada que compartir
  if (!selectedDateKey) {
    alert('Primero selecciona un día');
    return;
  }

  // 2. Obtener los eventos del día seleccionado
  let eventosDia = events[selectedDateKey];

  if (!eventosDia) {
    eventosDia = [];
  }

  // 3. Construir el texto que se va a compartir
  const tituloFecha = selectedDateDisplay.textContent;
  let textoCompartir = `Eventos del ${tituloFecha}:\n`;

  if (eventosDia.length === 0) {
    textoCompartir = textoCompartir + 'No hay eventos';
  }

  for (const eventText of eventosDia) {
    textoCompartir = textoCompartir + `- ${eventText}\n`;
  }

  // 4. Si el navegador tiene Web Share API, la usamos
  const puedeCompartir = navigator.share !== undefined;

  if (puedeCompartir) {
    const datosCompartir = {
      title: 'Mi calendario',
      text: textoCompartir
    };

    try {
      await navigator.share(datosCompartir);
    } catch (errorCompartir) {
      console.log('Compartir cancelado:', errorCompartir);
    }
    return;
  }

  // 5. Si no la tiene (fallback), copiamos el texto al portapapeles
  await navigator.clipboard.writeText(textoCompartir);
  alert('Eventos copiados al portapapeles');
}

shareBtn.addEventListener('click', compartirDia);


// ==========================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================================================

function initApp() {
  // TODO 1: Carga los eventos desde LocalStorage llamando a loadEvents()
  events = loadEvents();

  // TODO 2: Llamada inicial a renderCalendar() para dibujar la interfaz inicial
  renderCalendar();
}

initApp();
