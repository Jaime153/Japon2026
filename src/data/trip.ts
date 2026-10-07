export const TRIP = {
  title: 'Japón 2026',
  start: '2026-10-03',
  end: '2026-10-28',
  travellers: ['Jaime', 'Lorena', 'Vilma', 'Marga'],
  summary: 'Tokio → Nagoya → Osaka → Kyoto → Hiroshima → Osaka',
};

export const MANUAL_TASKS = [
  {
    id: 'tricount-fuji-car',
    title: 'Añadir coche Fuji a Tricount',
    detail: 'Añadir 53,82 € del alquiler Honda Fit o similar del 9 de octubre.',
    context: 'Fuji · coche',
  },
  {
    id: 'etc-card-fuji',
    title: 'Pedir ETC card al recoger el coche',
    detail: 'Solicitarla durante el papeleo en Tokyo Station Yaesu South Exit; no aparece como extra en Booking y depende de disponibilidad.',
    context: '9 octubre · 07:00',
  },
];

export const FIXED_INFO = [
  {
    title: 'Ida · 3/4 octubre',
    body: 'MU710: MAD T1 11:05 → PVG T1 05:50. Escala 3 h 15 min en la misma T1. MU523: PVG T1 09:05 → NRT T2 12:50.',
  },
  {
    title: '18 octubre · Vilma y Marga',
    body: 'Objetivo 14:20 en Kyoto Station Hachijo-dori, H2/KY2. KIX T1 19:00 → PVG T1 21:15 (MU8650 / operado por FM822). Escala 3 h 30 min. MU709: PVG T1 00:45 → MAD T1 08:40.',
    maps: 'https://www.google.com/maps?q=34.983902,135.760799',
  },
  {
    title: '28 octubre · Jaime y Lorena',
    body: 'FM822: KIX T1 19:00 → PVG T1 20:25. Escala 4 h 25 min en la misma T1. MU709: PVG T1 00:50 → MAD T1 08:00 el 29 de octubre.',
  },
  {
    title: '9 octubre · coche Fuji',
    body: 'Honda Fit o similar confirmado: Tokyo Station Yaesu South Exit, 07:00 → 21:00. Total 53,82 €. Recogida en Yaesu-nishi Parking, 2-1 Yaesu, Chuo-ku. Pedir ETC card durante el papeleo.',
    maps: 'https://www.google.com/maps/search/?api=1&query=Yaesu-nishi%20Parking%202-1%20Yaesu%20Chuo-ku%20Tokyo%20104-0028',
  },
  {
    title: 'Maletas',
    body: 'Yamato Transport / takkyubin sigue siendo la opción prevista para envío entre alojamientos. Ecbo Cloak y coin lockers como respaldo.',
  },
];


export const PERSONAL_SHOPPING_INFO = [
  {
    title: 'Versa Gripps · compra personal de Jaime',
    body: 'Opción verificada: FITNESS SHOP Suidobashi. La tienda oficial japonesa vende Versa Gripps PRO V3710 y Fit Pro V3720 por ¥14.300; el stock de talla/color puede variar. Horario del miércoles: 11:00–20:00. Es un desvío solo para Jaime, así que NO se mete en la ruta del grupo.',
    maps: 'https://www.google.com/maps/search/?api=1&query=FITNESS%20SHOP%20Suidobashi%20Tokyo',
    website: 'https://fitnessshop.jp/en/',
  },
  {
    title: 'Gym / ropa / montaña · Shinjuku sin desvío',
    body: 'Si apetece mirar material estando ya en Shinjuku: ASICS FLAGSHIP SHINJUKU abre 11:00–20:00; L-Breath abre hasta las 22:00 para montaña/outdoor; Alpen TOKYO abre hasta las 22:00 y reúne Sports Depo (fitness/ropa) + Alpen Outdoors en el mismo edificio.',
    maps: 'https://www.google.com/maps/search/?api=1&query=Alpen%20TOKYO%20Shinjuku',
    website: 'https://store.alpen-group.jp/Form/RealShop/ShopDetail.aspx?rsid=5201',
  },
];
