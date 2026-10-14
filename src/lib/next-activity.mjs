/**
 * Selección de «Siguiente» en la página Hoy.
 * Todo se interpreta en hora de Japón, también si el móvil sigue con huso español.
 * Horas que no sean explícitamente HH:MM o HH:MM–HH:MM no se inventan.
 */
export function japanClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({type, value}) => [type, value]));
  return {
    date: value.year + '-' + value.month + '-' + value.day,
    minutes: Number(value.hour) * 60 + Number(value.minute)
  };
}

function minutes(h, m) {
  const hh = Number(h), mm = Number(m);
  return hh <= 23 && hh >= 0 && mm <= 59 && mm >= 0 ? hh * 60 + mm : null;
}

export function parseTimeWindow(value) {
  const match = String(value ?? '').trim()
    .match(/^~?\s*(\d{1,2}):(\d{2})(?:\s*[–—-]\s*(\d{1,2}):(\d{2}))?$/);
  if (!match) return null;
  const start = minutes(match[1], match[2]);
  const end = match[3] === undefined ? null : minutes(match[3], match[4]);
  if (start === null || (match[3] !== undefined && (end === null || end <= start))) return null;
  return { start, end, approximate: String(value).trim().startsWith('~') };
}

/**
 * En cada llamada lee el estado actual de la actividad: las completadas y
 * omitidas no deberían aparecer otra vez. No promueve opcionales.
 * @param {{time?: string,status?:string,skipped?:boolean,completed?:boolean}[]} activities
 * @param {number} currentMinutes
 * @returns {{kind:string, activity?:object, timeWindow?:object}}
 */
export function selectNextActivity(activities, currentMinutes) {
  const relevant = activities.filter(a => !a.completed && !a.skipped &&
    a.status !== 'opcional' && a.status !== 'pendiente');
  if (!relevant.length) return { kind: 'empty' };
  const timed = relevant.map((activity, index) => ({
    activity, index, timeWindow: parseTimeWindow(activity.time)
  })).filter(x => x.timeWindow);

  // Rango en curso: no saltar de Eikan-dō a las 12:34 a Gion Tanto de las 19:00.
  const active = timed.filter(x => x.timeWindow.end !== null &&
    x.timeWindow.start <= currentMinutes && currentMinutes < x.timeWindow.end)
    .sort((a, b) => b.timeWindow.start - a.timeWindow.start || a.index - b.index)[0];
  if (active) return { kind: 'active', activity: active.activity, timeWindow: active.timeWindow };

  const upcoming = timed.filter(x => x.timeWindow.start >= currentMinutes)
    .sort((a, b) => a.timeWindow.start - b.timeWindow.start || a.index - b.index)[0];
  if (upcoming) return { kind: 'upcoming', activity: upcoming.activity, timeWindow: upcoming.timeWindow };

  const untimed = relevant.find(x => !parseTimeWindow(x.time));
  if (untimed) return { kind: 'untimed', activity: untimed };
  return { kind: 'finished' };
}
