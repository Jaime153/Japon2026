export type SavedMapList = {
  id: string;
  title: string;
  city: string;
  url: string;
  places: string[];
};

export const TRIP = {
  title: 'Japón 2026',
  start: '2026-10-03',
  end: '2026-10-28',
  travellers: ['Jaime', 'Lorena', 'Vilma', 'Marga'],
  summary: 'Tokio → Nagoya → Osaka → Kyoto → Hiroshima → Osaka',
};

export const FIXED_INFO = [
  {
    title: 'Ida · 3/4 octubre',
    body: 'Madrid → Shanghái → Narita con China Eastern. Llegada a Narita el 4 de octubre a las 12:50.',
  },
  {
    title: '18 octubre · Vilma y Marga',
    body: 'Objetivo 14:20 en Kyoto Station Hachijo-dori, parada H2/KY2 junto a Kyoto Avanti. Airport Limousine Bus directo a KIX. Vuelo a las 19:00.',
    maps: 'https://www.google.com/maps?q=34.983902,135.760799',
  },
  {
    title: '28 octubre · Jaime y Lorena',
    body: 'Salida desde KIX. Llegada a Madrid el 29 de octubre a las 08:00. Consultar el billete para la hora exacta de salida.',
  },
  {
    title: 'Maletas',
    body: 'Yamato Transport / takkyubin sigue siendo la opción prevista para envío entre alojamientos. Ecbo Cloak y coin lockers como respaldo.',
  },
];

export const SHARED_MAP_LISTS: SavedMapList[] = [
  {
    id: 'tokyo',
    title: 'TOKYO 2026',
    city: 'Tokio',
    url: 'https://www.google.com/maps/@35.6817956,139.6928727,13z/data=!4m2!11m1!2srLxjMUAtrtmiFBI4LXvzUg?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D',
    places: [
      '阿吽 Aun Craft Antique','Ginza Itoya','Ueno Park','Gōtoku-ji','Tsujita Ginza','Roppongi Hills','Tokyo Tower',
      'Shibuya Nonbei Yokocho','Shibuya Sky','Hachiko Square','Shibuya Scramble Crossing','Omoide Yokocho Memory Lane',
      'Cross Shinjuku Vision','Kabukicho','Godzilla Head','Hanazono Shrine','Takeshita St','Meiji Jingu','Tokyo Skytree',
      'Kameido Tenjin Shrine','Nakamise Dori shopping street','Sensō-ji Denpoin Garden','Senso-ji Hozomon Gate','Sensō-ji','Kaminarimon Gate'
    ],
  },
  {
    id: 'fuji',
    title: 'MT FUJI 2026',
    city: 'Fuji / Kawaguchiko',
    url: 'https://www.google.com/maps/@35.3373856,138.5751087,11z/data=!4m2!11m1!2s0P7MCo9hTcPKlGXRkOFQ7Q?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D',
    places: ['Chureito Pagoda','Arakurayama Sengen Park','Oishi Park','Fujiyoshida Retro Shopping Street','Fujisan Yume No Ōhashi Bridge','LAWSON Kawaguchiko Station'],
  },
  {
    id: 'kyoto',
    title: 'KYOTO 2026',
    city: 'Kyoto',
    url: 'https://www.google.com/maps/@35.0035401,135.6819091,13z/data=!4m2!11m1!2sk-nbmM3THFZO-m4-gK0O-g?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D',
    places: ['Kiyamachi-dori','Yamamoto','Kura Sushi Plus Kyoto','Yasaka Shrine','Gion','Hōkan-ji Temple (Yasaka Pagoda)','Otagi Nenbutsuji','Fushimi Inari Taisha','Kinkaku-ji','Nishiki Market','Adashino Nenbutsuji Temple','The Bamboo Forest Trail','Arashiyama Nakaoshitacho','Gion Tanto','Kenninji Temple','Ramen Sen-no-Kaze Kyoto','Ninenzaka','Sannenzaka','Kiyomizu-dera'],
  },
  {
    id: 'osaka',
    title: 'OSAKA 2026',
    city: 'Osaka',
    url: 'https://www.google.com/maps/@34.739182,135.4253562,12z/data=!4m2!11m1!2sf9IQ4wBEUQZAAsP5MV4weQ?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D',
    places: ['Sumiyoshi Taisha','Umeda Sky Building','Osaka Castle','Dotonbori','Shinsekai','Namba Yasaka Jinja','Katsuoji'],
  },
];

export const TOKYO_MUSTS = [
  'Tsukiji Outer Market → Tsukishima Monja Street el mismo día',
  'Asakusa Shichifukujin Meguri + shikishi/goshuin',
  'Kappabashi Dougu Street durante el Dougu Matsuri (6–12 oct)',
  'Cattlea en Morishita para el kare-pan original',
  'Menya Musashi Takatora en Takadanobaba',
];
