# AGENTS.md — Contexto operativo y reglas de trabajo · Japon2026

**Actualizado: miércoles 14 de octubre de 2026 (hora de Japón).** Archivo para Codex y cualquier asistente o conversación que trabaje sobre este repositorio. Antes de proponer cambios, leer este documento y la fuente de verdad actual: `src/content/segments/*.json`.

## Flujo de trabajo obligatorio

- **NUNCA hacer commits ni push directos a `main`.** `main` despliega GitHub Pages automáticamente.
- Abrir **rama nueva desde el `main` actualizado**, modificar ahí, revisar el diff y abrir **pull request** con descripción verificable. **No fusionar ni activar auto-merge**: Jaime revisa y decide cuándo fusionar.
- Si existe una PR de otra conversación, comprobar **estado y diff** antes de editar: no pisar trabajo en curso ni reutilizar ramas desactualizadas. PR #63 (ruta Ginkaku del 14) ya se fusionó: los ajustes posteriores deben ir en otra PR.
- Ejecutar `npm ci`, `npm run check:content` y `npm run build` cuando sea posible; CI es obligatoria antes de recomendar merge. Ajustar tests al cambiar datos, NO simplemente desactivarlos.
- El repositorio es **público**: no registrar localizadores/PNR, documentos, datos personales, pasaportes ni información privada.
- Recomendaciones y horas: distinguir **HECHO REAL**, **ETA**, **estimación**, **opcional** y **pendiente/reserva no realizada**. No marcar visitas como hechas sin confirmación.
- Verificar cierres, horarios, distancias, cola, meteorología y desplazamientos antes de construir un día. Optimizar por barrios y trayectos a pie, mantener comida/descansos y un plan recortable. No heredar instrucciones de otro día.

## Miércoles 14/10/2026 — datos confirmados en directo

- Ayer martes 13 fue un día **tranquilo**. Se visitaron Yasaka Kōshin-dō, Ryōzen Kannon y Kōdai-ji; **NO Kiyomizu-dera**, que se aplazó. No convertir otras paradas sugeridas del 13 en visitas hechas.
- Hoy miércoles 14: **08:30 salida REAL** desde RESI STAY Yasaka; **09:15 subida REAL al autobús** camino de Ginkaku-ji. La pantalla del bus prevé **09:44 llegada (ETA; no confirmada)**. La parada real, la línea y la hora de acceso al templo no están confirmadas.
- Después de bajar, contemplar ~10–15 min a pie desde Ginkakuji-michi si ésa es la parada. Por eso **entrada estimada al Ginkaku-ji ~10:00**, NO 08:45.
- Ruta del 14 norte → sur: **Ginkaku-ji (~10:00–10:50) → Hōnen-in (~11:00–11:25) → Camino del Filósofo (~11:25–12:20) → Eikan-dō (~12:25–13:20) → COMER (~13:20–14:20) → Nanzen-ji (~14:30–15:30)**. **Heian Jingū (~16:00–16:40) opcional**, según cansancio/clima; Chion-in no puede prometer visita interior tarde y sería alternativa a Heian, no otra obligación. Fin orientativo 17:15–18:00.
- El 14 **NO** toca Fushimi Inari, Tōfuku-ji, Sanjūsangendō ni compras en Nishiki por simple acumulación de destinos. Evitar viajes de ida y vuelta entre zonas. No hay salida al aeropuerto hoy (error detectado y corregido en la ficha antigua).

## Otras decisiones del viaje (NO perdibles)

- **Fushimi Inari**: aplazado expresamente para **otro día, al COMIENZO de la jornada y con buen tiempo** para ver los torii tranquilos. Actualmente propuesto al amanecer del viernes **16/10 antes de Nara**; sigue siendo **plan**, no visita hecha ni garantía meteorológica. Si hace mal tiempo, reconsiderar y ajustar Nara sin romper horarios esenciales ni quitar tiempo de comida.
- **Kiyomizu-dera**: pendiente desde el 13. Las amigas **quieren ponerse kimono ese mismo día y realizar ceremonia del té**. Esto es una prioridad de grupo, NO un extra que se elimina sin consultar. Las tres amigas son Lorena, Vilma y Marga; no hay kimono, salón ni franja reservada.
- La visita Kiyomizu fue colocada anteriormente el **domingo 18/10 a las 06:30** para evitar gente, pero eso **NO encaja automáticamente con alquiler de kimono**, que normalmente empieza hacia las 09:00. **Día y horarios por cerrar**, aunque el itinerario conserve un recordatorio provisional el 18: buscar combo bien ubicado Higashiyama/Gion, peinado, ceremonia, tiempo de fotos, devolución del kimono y caminatas. Una posible alternativa local para verificar es **KIMONO TEA CEREMONY MAIKOYA GION KIYOMIZU (100-1 Rokurocho, 09:00–18:30 publicado, sin reserva confirmada)**.
- **18/10** Vilma y Marga vuelan desde KIX a las **19:00**. La parada para despedirlas es **Kyoto Station Hachijo-guchi H2/KY2 (Kyoto Avanti)**; `34.983902,135.760799`. **14:20 es una hora objetivo de bus que hay que verificar con el billete**, NO una reserva confirmada. Si fuese bus 14:20, estar allí **13:50–14:00**, con tiempo previo para devolver kimonos, ir al apartamento, maletas y taxi/transporte. Si Kiyomizu + kimono + té no encajan el 18 con margen holgado, **mover la visita completa a otro día con las cuatro antes del vuelo**, reorganizando las otras actividades; no forzar ni arriesgar el vuelo.
- Jueves **15/10** Arashiyama con Fufu no Yu prioritario (baños separados, prohibición de tatuajes). Viernes **16/10** Nara con Yoshoku Haru + propuesta Fushimi temprano. Sábado **17/10** Kinkaku-ji, Ryōan-ji y tatuajes de las chicas **sin cita confirmada**. Estos días tienen compromisos que hay que revisar antes de mover Kiyomizu, no suponer huecos gratis.
- No confundir deseos/plan/actividades realizadas: tras cada comunicación desde la calle, actualizar horas **reales** y ETA separadamente. La web se usa como navegador operativo diario, no como histórico inventado.

## Fuentes de referencia

- Ruta y horas reales: `src/content/segments/kyoto.json` días 13–19.
- Reglas de calidad/CI: `scripts/validate-itinerary.mjs`, `scripts/validate-map-planner.mjs`.
- Arquitectura: `README.md`, `planning/00-proyecto.md` y `JAPON_2026_WEB_PRODUCT_CONTEXT.md` (este último es histórico y algunas propuestas allí ya están implementadas).
- Horarios oficiales: https://www.shokoku-ji.jp/ginkakuji/ ; https://www.eikando.or.jp/mobile_en/mb_haikan_en.html ; https://nanzenji.or.jp/about_rinzaishu/visit ; kimono/té candidato: https://ja.kyoto.travel/tourism/single01.php?category_id=3&tourism_id=3036 .
