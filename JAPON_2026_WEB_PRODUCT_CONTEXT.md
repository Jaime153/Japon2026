# JAPON_2026_WEB_PRODUCT_CONTEXT

## 1. Objetivo del proyecto

El proyecto **Japon2026** plantea explorar la creación de una **web interactiva alojada en GitHub Pages** que sirva como itinerario durante el viaje a Japón.

La idea es sustituir o complementar formatos más estáticos, como un PDF o un documento, por una interfaz que permita consultar de forma cómoda desde el móvil:

* qué actividades corresponden a cada día;
* dónde están los lugares;
* qué viene a continuación;
* información de transportes;
* reservas;
* horarios;
* notas;
* enlaces útiles;
* estado de actividades o reservas.

La web se plantea principalmente como una herramienta de consulta durante el viaje, especialmente desde el teléfono.

---

## 2. Funcionalidades propuestas

Las siguientes funcionalidades fueron propuestas durante la conversación. Salvo donde se indique expresamente lo contrario, **son ideas propuestas por el asistente y no decisiones confirmadas por el usuario**.

### Inicio

Pantalla principal del viaje, con información general como:

* nombre del viaje;
* día o fecha actual;
* posible contador;
* próxima actividad.

Ejemplo conceptual:

```text
🇯🇵 JAPAN
5 OCT · TOKYO

☀️ Día 3
```

### Timeline por días

Visualización del itinerario organizado cronológicamente por días.

Cada día tendría sus actividades ordenadas por hora.

Ejemplo:

```text
┌────────────────────────────┐
│ 🇯🇵 JAPAN                  │
│ 5 OCT · TOKYO             │
│                            │
│ ☀️ Día 3                  │
│                            │
│ 09:00  Meiji Jingu         │
│    │                       │
│ 11:00  Harajuku            │
│    │                       │
│ 13:30  Shibuya             │
│    │                       │
│ 20:00  Shibuya Sky         │
│                            │
│ ─────────────────────────  │
│ 🗺 Mapa   📅 Días   🏨 Info │
└────────────────────────────┘
```

### Mapa interactivo

Mapa con puntos correspondientes a elementos del viaje, como:

* hoteles;
* restaurantes;
* estaciones;
* templos;
* tiendas;
* otros lugares del itinerario.

Se propuso utilizar **MapLibre o Leaflet** para esta funcionalidad.

### Navegación por ciudades

Posibilidad de agrupar o consultar el itinerario por ciudad.

Como concepto de interfaz, podrían existir secciones independientes para las distintas ciudades del viaje.

### Actividades

Cada actividad podría almacenar y mostrar información como:

* hora;
* nombre;
* duración estimada;
* precio;
* estado;
* ubicación;
* reserva asociada;
* enlace a Google Maps.

### Transportes

Se propuso incluir información específica para desplazamientos, por ejemplo:

* estación de origen;
* estación de destino;
* línea;
* Shinkansen;
* asiento o reserva.

### Reservas

Zona o información asociada a reservas relacionadas con:

* hoteles;
* actividades;
* restaurantes;
* tours;
* vuelos;
* otros elementos del itinerario.

### Notas

Posibilidad de añadir notas rápidas vinculadas al viaje o a un día.

Ejemplos mencionados:

```text
mandar maletas a Kioto
comprar Suica
último tren 23:xx
```

### Estados

Se propuso que actividades o elementos del viaje pudieran tener estados como:

```text
Pendiente
Reservado
Pagado
Hecho
```

### Google Maps

Las actividades podrían incluir un botón para abrir directamente su ubicación en Google Maps.

Ejemplo conceptual:

```text
Abrir en Google Maps
```

### PWA y funcionamiento offline

Se propuso convertir la web en una **Progressive Web App (PWA)**.

El objetivo sería poder:

* añadirla a la pantalla de inicio del móvil;
* abrirla en una experiencia similar a una aplicación;
* usarla a pantalla completa;
* disponer de caché;
* consultar al menos parte del itinerario sin cobertura.

Ejemplo de uso planteado:

```text
Chrome → Añadir a pantalla de inicio
```

### Modo "Hoy"

Se propuso una pantalla específica que detecte la fecha actual y muestre directamente las actividades relevantes del día, evitando tener que buscar manualmente el día correspondiente.

Ejemplo:

```text
HOY · TOKIO

Ahora
14:30 Akihabara

Siguiente
17:00 Hotel
19:30 Shinjuku

🚇 23 min hasta Shinjuku
```

### Geolocalización

Se propuso un botón del tipo:

```text
Estoy aquí
```

Su función sería utilizar la posición del dispositivo para centrar el mapa en la ubicación actual.

La propuesta original contempla hacerlo sin necesidad de almacenar la ubicación en un servidor.

### Posible diario posterior al viaje

La misma web podría evolucionar después del viaje y convertirse en una especie de diario.

Se planteó que pudiera incorporar:

* lugares realmente visitados;
* fotografías;
* información del recorrido realizado;
* posible integración con una cronología GPS.

---

## 3. Arquitectura de datos propuesta

Se propuso separar los **datos del viaje** de la **interfaz visual**.

La intención es evitar que todo el itinerario quede escrito directamente dentro de componentes HTML o de la propia interfaz.

De esta forma, modificar el viaje podría consistir principalmente en editar archivos de datos.

### Estructura de carpetas propuesta

```text
japan-trip/
├── src/
│   ├── components/
│   ├── pages/
│   └── data/
│       ├── itinerary.json
│       ├── places.json
│       └── bookings.json
├── public/
│   └── images/
└── package.json
```

### Ejemplo JSON propuesto

```json
{
  "date": "2026-10-05",
  "city": "Tokyo",
  "activities": [
    {
      "time": "09:00",
      "name": "Meiji Jingu",
      "lat": 35.6764,
      "lng": 139.6993,
      "duration": 90,
      "maps": "https://maps.google.com/...",
      "status": "planned"
    }
  ]
}
```

También se mencionó que los datos podrían gestionarse mediante **JSON o YAML**.

La motivación de esta separación sería poder realizar cambios sobre el itinerario sin tener que modificar directamente la interfaz.

Como ejemplo de flujo futuro se planteó poder pedir a una IA de desarrollo algo como:

```text
añade esto al día 7 después de Fushimi Inari
```

y que el cambio afectase fundamentalmente a los datos del itinerario.

---

## 4. Stack tecnológico propuesto

Todo el stack de esta sección fue **propuesto por el asistente y todavía no ha sido confirmado por el usuario**.

### Astro

Propuesto como framework principal.

La razón indicada fue que el proyecto contiene principalmente contenido estático y no necesitaría inicialmente una arquitectura compleja del lado del servidor.

### TypeScript

Propuesto como lenguaje para el código de la aplicación y sus componentes.

### Tailwind

Propuesto para construir y gestionar los estilos de la interfaz.

### MapLibre / Leaflet

Propuestos como alternativas para implementar el mapa interactivo y representar lugares del itinerario.

Todavía no se ha decidido cuál utilizar.

### GitHub Pages

Propuesto como plataforma de hosting de la web estática.

Es también la plataforma que el usuario mencionó explícitamente al plantear la idea inicial del proyecto.

### GitHub Actions

Propuesto para automatizar el proceso de construcción y despliegue desde el repositorio hasta GitHub Pages.

Flujo conceptual planteado:

```text
GitHub
   │
   ▼
GitHub Actions
   │
   ▼
GitHub Pages
https://usuario.github.io/japan
```

### PWA

Propuesto para mejorar la experiencia móvil y permitir:

* instalación desde el navegador;
* acceso desde un icono en la pantalla de inicio;
* experiencia a pantalla completa;
* caché;
* cierto funcionamiento offline.

---

## 5. Hosting y despliegue

La propuesta inicial es utilizar **GitHub Pages**.

La aplicación sería principalmente estática.

En esta fase no se considera necesario disponer de:

* servidor propio;
* backend;
* base de datos;
* infraestructura cloud adicional.

El flujo propuesto sería:

```text
Repositorio GitHub
        │
        ▼
   GitHub Actions
        │
        ▼
    GitHub Pages
```

Coste planteado para esta arquitectura:

```text
0 €
```

---

## 6. UX móvil propuesta

La interfaz se propuso siguiendo un enfoque **mobile-first**, ya que la web probablemente se consultaría principalmente desde el teléfono durante el viaje.

El objetivo sería minimizar la cantidad de navegación necesaria para saber:

* qué toca hacer;
* dónde está;
* a qué hora;
* qué viene después.

### Ejemplo de timeline móvil

```text
┌────────────────────────────┐
│ 🇯🇵 JAPAN                  │
│ 5 OCT · TOKYO             │
│                            │
│ ☀️ Día 3                  │
│                            │
│ 09:00  Meiji Jingu         │
│    │                       │
│ 11:00  Harajuku            │
│    │                       │
│ 13:30  Shibuya             │
│    │                       │
│ 20:00  Shibuya Sky         │
│                            │
│ ─────────────────────────  │
│ 🗺 Mapa   📅 Días   🏨 Info │
└────────────────────────────┘
```

La navegación conceptual inferior sería:

```text
Mapa | Días | Info
```

### Ejemplo de modo Hoy

```text
HOY · TOKIO

Ahora
14:30 Akihabara

Siguiente
17:00 Hotel
19:30 Shinjuku

🚇 23 min hasta Shinjuku
```

La finalidad del modo Hoy sería reducir aún más la navegación durante el viaje y mostrar inmediatamente la información correspondiente al momento actual.

---

## 7. Evolución futura

Se planteó que el proyecto pudiera continuar siendo útil una vez terminado el viaje.

### Diario de viaje

La web podría evolucionar desde un itinerario planificado hacia un registro del viaje realizado.

### Fotografías

Podrían incorporarse fotografías tomadas durante el viaje.

### Lugares visitados

Se podría registrar qué lugares fueron finalmente visitados.

### Cronología GPS

Se mencionó como posible evolución cruzar la información del itinerario con una cronología GPS del viaje.

Esto permitiría utilizar posteriormente la web como una representación del recorrido realizado y no únicamente del recorrido inicialmente planificado.

---

## 8. Estado real de las decisiones

Es importante separar las decisiones reales del usuario de las propuestas realizadas durante la conversación.

### CONFIRMADO POR EL USUARIO

El usuario quiere explorar la posibilidad de crear:

> una web interactiva en GitHub Pages como itinerario para su viaje a Japón.

Eso es lo único que debe considerarse actualmente como decisión de producto confirmada.

### PROPUESTO POR EL ASISTENTE, TODAVÍA NO CONFIRMADO

Todavía son propuestas y **no deben interpretarse como requisitos definitivos del usuario**:

* Astro;
* TypeScript;
* Tailwind;
* MapLibre;
* Leaflet;
* PWA;
* funcionamiento offline;
* modo Hoy;
* geolocalización;
* estructura de datos mediante JSON/YAML;
* separación entre datos e interfaz;
* diseño mobile-first;
* pantalla de inicio;
* timeline diario;
* mapa interactivo;
* navegación o agrupación por ciudades;
* tarjetas o información detallada de actividades;
* sección de transportes;
* gestión o visualización de reservas;
* notas;
* estados de actividades o reservas;
* enlaces directos a Google Maps;
* uso de GitHub Actions;
* posible evolución hacia un diario;
* incorporación de fotografías;
* registro de lugares visitados;
* integración futura con una cronología GPS.

Ninguno de estos elementos debe tratarse todavía como una decisión tomada por el usuario.

---

## 9. Preguntas todavía abiertas

Antes de considerar cerrado el diseño del producto habría que decidir, entre otras cosas:

* si finalmente se desarrollará la web o únicamente se está explorando la idea;
* si GitHub Pages será definitivamente el sistema de hosting;
* si se utilizará Astro;
* si se utilizará TypeScript;
* si se utilizará Tailwind;
* si el mapa se implementará con MapLibre o con Leaflet;
* si el proyecto será una PWA;
* si se necesita funcionamiento offline;
* qué contenido deberá estar disponible offline;
* si existirá el modo Hoy;
* si la web podrá utilizar la geolocalización del dispositivo;
* si se implementará el botón "Estoy aquí";
* si el diseño será estrictamente mobile-first;
* qué navegación principal tendrá la aplicación;
* qué funcionalidades entrarán en la primera versión;
* si las ciudades tendrán secciones propias;
* qué información exacta tendrá cada actividad;
* cómo se representarán los transportes;
* cómo se representarán las reservas;
* si existirán estados como Pendiente, Reservado, Pagado y Hecho;
* si existirán notas dentro del itinerario;
* si las ubicaciones tendrán enlaces directos a Google Maps;
* si los datos se almacenarán en JSON, YAML u otro formato;
* qué estructura definitiva tendrán los archivos de datos;
* si GitHub Actions gestionará automáticamente el despliegue;
* si el proyecto evolucionará después del viaje hacia un diario;
* si se añadirán fotografías;
* si se registrarán los lugares realmente visitados;
* si se integrará en el futuro alguna cronología GPS.
