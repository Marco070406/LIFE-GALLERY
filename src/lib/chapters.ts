export interface GalleryImage {
  src: string;
  caption: string;
}

export interface Chapter {
  id: string;
  chapter: string;
  title: string;
  emoji: string;
  description: string;
  longDescription: string;
  cover: string;
  theme: 'light' | 'dark';
  gallery: GalleryImage[];
}

export const chapters: Chapter[] = [
  {
    id: 'baby',
    chapter: 'Chapitre 01',
    title: 'Bébé',
    emoji: '👶',
    description: 'Les tout premiers instants, les premiers sourires, les premières lumières.',
    longDescription: 'Les premières secondes de la vie, où chaque regard, chaque sourire, chaque geste naît de l\'émerveillement infini. Cette section célèbre l\'innocence absolue et la douceur des commencements, capturés dans la lumière la plus pure.',
    cover: '/images/Mika baby 1.jpeg',
    theme: 'light',
    gallery: [
      { src: '/images/baby-2.jpg', caption: 'Premiers éclats de rire à la lumière du matin' },
      { src: '/images/baby-3.jpg', caption: 'Mains qui se cherchent, un univers à découvrir' },
      { src: '/images/baby-4.jpg', caption: 'Sommeil paisible, rêves d\'étoiles' },
      { src: '/images/baby-5.jpg', caption: 'Éclat de lumière sur une peau encore transparente' },
    ],
  },
  {
    id: 'childhood',
    chapter: 'Chapitre 02',
    title: 'Enfance',
    emoji: '🧒',
    description: 'Mondes imaginaires, jeux sans fin, les yeux rivés sur l\'infini.',
    longDescription: 'Les années d\'or où le temps semble suspendu, où chaque journée est une aventure et chaque découverte un trésor. L\'enfance, dans toute sa splendeur éphémère.',
    cover: '/images/Mika enfance 1.jpeg',
    theme: 'dark',
    gallery: [
      { src: '/images/child-2.jpg', caption: 'Saut vers l\'avenir, les pieds nus dans l\'herbe' },
      { src: '/images/child-3.jpg', caption: 'Dessins et rêveries dans une chambre au soleil' },
      { src: '/images/child-4.jpg', caption: 'Cours d\'eau et rêves d\'été' },
      { src: '/images/child-5.jpg', caption: 'Fleurs ramassées, trésors de la fin d\'après-midi' },
    ],
  },
  {
    id: 'teen',
    chapter: 'Chapitre 03',
    title: 'Adolescence',
    emoji: '🧑',
    description: 'Quêtes identitaires, cœurs qui s\'emmêlent, l\'âge de la révolte douce.',
    longDescription: 'Entre l\'enfance qui s\'en va et l\'âge adulte qui arrive, l\'adolescence trace son chemin avec passion et intensité. Un mélange de mélancolie et d\'espoir.',
    cover: '/images/life-teen.svg',
    theme: 'light',
    gallery: [
      { src: '/images/teen-2.jpg', caption: 'Regard vers l\'horizon, l\'infini comme promesse' },
      { src: '/images/teen-3.jpg', caption: 'Notes volées dans une classe vide' },
      { src: '/images/teen-4.jpg', caption: 'Soirées d\'été, musique et lumière' },
      { src: '/images/teen-5.jpg', caption: 'Premiers pas dans la vie, les rêves intérieurs' },
    ],
  },
  {
    id: 'young-adult',
    chapter: 'Chapitre 04',
    title: 'Jeune adulte',
    emoji: '🎓',
    description: 'Premiers amours, rêves qui prennent forme, l\'exploration du monde.',
    longDescription: 'La découverte de soi à travers les autres, les premières grandes déceptions et les plus belles victoires. L\'âge où tout semble possible.',
    cover: '/images/life-young-adult.svg',
    theme: 'dark',
    gallery: [
      { src: '/images/young-2.jpg', caption: 'Villes endormies, rêveries au crépuscule' },
      { src: '/images/young-3.jpg', caption: 'Pages volées dans une librairie' },
      { src: '/images/young-4.jpg', caption: 'Conversations qui défont les certitudes' },
      { src: '/images/young-5.jpg', caption: 'Marche vers l\'inconnu, valise et espoir' },
    ],
  },
  {
    id: 'adult',
    chapter: 'Chapitre 05',
    title: 'Adulte',
    emoji: '🧓',
    description: 'Sagesse acquise, racines profondes, l\'art de la lumière intérieure.',
    longDescription: 'Les fruits d\'une vie vécue, la beauté des détails qui comptent, et la lumière qui émane de l\'intérieur. La maturité qui ne perd pas de son éclat.',
    cover: '/images/life-adult.svg',
    theme: 'light',
    gallery: [
      { src: '/images/adult-2.jpg', caption: 'Regards qui traversent les années' },
      { src: '/images/adult-3.jpg', caption: 'Mains qui se sont croisées, histoire de vie' },
      { src: '/images/adult-4.jpg', caption: 'Sourires qui ont traversé les saisons' },
      { src: '/images/adult-5.jpg', caption: 'Lumière douce sur les chemins parcourus' },
    ],
  },
];
