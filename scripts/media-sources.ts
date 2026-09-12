/**
 * Photographic sources of the demo dataset.
 *
 * Every picture is a real, freely-licensed photograph fetched from Wikimedia
 * Commons by `scripts/fetch-media.ts`, then re-encoded to AVIF and WebP at
 * four widths. Nothing here is a grey placeholder, and nothing is served from
 * a third-party domain at runtime: the encoded files live under
 * `public/medias/`, so `img-src 'self'` stays closed
 * (CAHIER-DES-CHARGES.md §5.3) and the weight is known at build time (§5.4).
 *
 * `alt` is the accessibility text (CDC §3.5: every image carries a meaningful
 * alt); `caption` is the visible French legend. Credit and licence come from
 * Commons and are written into the manifest automatically — a press outlet
 * does not publish a photograph without naming its author.
 */

export type MediaSource = {
  /** Manifest key, also the file stem under public/medias/. */
  readonly id: string;
  /** Commons full-text search, narrowed to bitmap files. */
  readonly query: string;
  /** Fallback searches, tried in order when the first returns nothing usable. */
  readonly fallbacks?: readonly string[];
  readonly alt: string;
  readonly caption: string;
  /** 16:9 for editorial pictures, 1:1 for portraits. */
  readonly ratio?: "16:9" | "1:1";
};

export const MEDIA_SOURCES: readonly MediaSource[] = [
  {
    id: "libreville-baie",
    query: "Libreville Baie des Rois",
    fallbacks: ["Libreville bord de mer", "Libreville"],
    alt: "Le bord de mer de Libreville sous un ciel couvert, palmiers et immeubles en retrait.",
    caption: "Le front de mer de Libreville, cœur administratif et financier du pays.",
  },
  {
    id: "libreville-centre",
    query:
      "File:Gabon Mining Logistics au Centre-ville de Libreville-2020.jpg",
    alt: "Rue du centre-ville de Libreville, façades d'immeubles de bureaux et circulation.",
    caption:
      "Centre-ville de Libreville. La capitale concentre l'essentiel de l'activité tertiaire.",
  },
  {
    id: "libreville-boulevard",
    query: "Boulevard de l'indépendance Libreville",
    fallbacks: ["Libreville street", "Libreville"],
    alt: "Libreville vue du ciel, le front de mer et la ville en enfilade.",
    caption: "Libreville, vue aérienne du front de mer.",
  },
  {
    id: "port-gentil",
    query: "Port-Gentil Gabon",
    fallbacks: ["Port Gentil", "Ogooué-Maritime"],
    alt: "Vue aérienne de Port-Gentil, quartiers d'habitation et végétation.",
    caption: "Port-Gentil, capitale pétrolière du pays.",
  },
  {
    id: "petrole-offshore",
    query: "offshore oil platform",
    fallbacks: ["oil platform", "oil rig sea"],
    alt: "Plateforme pétrolière offshore en mer, torchère et superstructures métalliques.",
    caption: "Production offshore. Le pétrole pèse encore près de 40 % du PIB gabonais.",
  },
  {
    id: "manganese-mine",
    query: "Comilog Moanda manganese",
    fallbacks: ["open pit mine Africa", "quarry mining excavator", "mining truck quarry"],
    alt: "Ancienne exploitation minière à ciel ouvert, vaste cratère aux parois rocheuses.",
    caption: "Exploitation à ciel ouvert. Le Gabon est le deuxième producteur mondial de manganèse.",
  },
  {
    id: "foret-okoume",
    query: "Gabon rainforest logging",
    fallbacks: ["Gabon forest", "okoume timber", "rainforest Gabon"],
    alt: "Sous-bois de forêt équatoriale gabonaise, troncs hauts et végétation dense.",
    caption: "La forêt couvre 88 % du territoire gabonais.",
  },
  {
    id: "port-owendo",
    query: "Owendo port Gabon",
    fallbacks: ["container port Africa", "port container terminal"],
    alt: "Terminal à conteneurs vu du ciel, quais, portiques et navires à quai.",
    caption: "Terminal à conteneurs. Le fret maritime est le premier poste logistique du pays.",
  },
  {
    id: "beac-banque",
    query: "Banque des États de l'Afrique centrale",
    fallbacks: ["BEAC", "central bank building Africa", "bank building"],
    alt: "Tour de béton abritant un siège bancaire, vue en contre-plongée.",
    caption: "Siège bancaire. La politique monétaire de la zone CEMAC est conduite depuis Yaoundé.",
  },
  {
    id: "transgabonais",
    query: "Transgabonais railway",
    fallbacks: ["Gabon railway", "railway Africa train"],
    alt: "La gare d'Owendo, bâtiment aux bardages colorés, voyageurs sur le parvis.",
    caption:
      "La gare d'Owendo, tête de ligne du Transgabonais — 648 kilomètres jusqu'à Franceville.",
  },
  {
    id: "marche-libreville",
    query: "market Libreville Gabon",
    fallbacks: ["Gabon market", "African market stall"],
    alt: "Étals couverts d'un marché urbain, produits frais alignés au sol.",
    caption: "Commerce de détail. L'informel représente une large part de l'emploi urbain.",
  },
  {
    id: "agriculture-plantation",
    query: "oil palm plantation Gabon",
    fallbacks: ["palm oil plantation", "plantation agriculture Africa"],
    alt: "Parcelle agricole bordée par une piste de latérite, forêt en arrière-plan.",
    caption: "Agro-industrie. La filière palmier est l'un des paris de la diversification.",
  },
  {
    id: "reunion-affaires",
    query:
      "File:Informal meeting of environment ministers. Round table Informal meeting of environment ministers (35073247774).jpg",
    alt: "Table ronde institutionnelle, participants installés devant leurs dossiers.",
    caption: "Réunion de direction.",
  },
  {
    id: "femme-dirigeante",
    query: "women entrepreneurs Africa business",
    fallbacks: ["woman working office Africa", "women cooperative Africa work"],
    alt: "Deux femmes travaillant côte à côte dans une unité de transformation artisanale.",
    caption: "Entrepreneuriat féminin. Les coopératives de transformation emploient surtout des femmes.",
  },
  {
    id: "startup-bureau",
    query: "coworking space people laptops",
    fallbacks: ["open space office laptops", "startup hub Africa", "office workers computers"],
    alt: "Deux personnes travaillant sur un ordinateur portable et des documents posés sur une table.",
    caption: "Séance de travail dans un espace partagé.",
  },
  {
    id: "mobile-money",
    query: "mobile money Africa phone payment",
    fallbacks: ["mobile phone Africa", "smartphone payment"],
    alt: "Un commerçant derrière le comptoir d'une boutique de téléphonie mobile.",
    caption: "Paiement mobile. Airtel Money et Moov Money couvrent l'essentiel des transactions.",
  },
  {
    id: "energie-solaire",
    query: "File:RTR solar energy field installation.jpg",
    alt: "Champ de panneaux photovoltaïques s'étendant jusqu'à l'horizon.",
    caption: "Centrale photovoltaïque.",
  },
  {
    id: "formation-universite",
    query:
      "File:2014 10 23 Somali National University Re-opens (15428349899).jpg",
    alt: "Un étudiant attentif au premier rang d'une salle de cours.",
    caption: "Salle de cours. La formation continue reste le premier frein cité par les employeurs.",
  },
  {
    id: "administration-gabon",
    query: "File:Mairie de Cocobeach au Gabon.jpg",
    alt: "Bâtiment administratif gabonais aux murs clairs, entouré de pelouse et de palmiers.",
    caption: "Administration territoriale gabonaise.",
  },
  {
    id: "peche-artisanale",
    query: "artisanal fishing Gabon",
    fallbacks: ["fishing boats Africa beach", "fishing pirogue"],
    alt: "Barques de pêche artisanale échouées sur une plage de sable.",
    caption: "Pêche artisanale sur le littoral.",
  },
  {
    id: "chantier-btp",
    query: "construction site building Africa",
    fallbacks: ["construction crane building site", "construction site"],
    alt: "Ouvrier en gilet de chantier aux commandes d'un engin de travaux publics.",
    caption: "Chantier de bâtiment et travaux publics.",
  },
  {
    id: "aeroport-libreville",
    query: "File:Gabon Airlines. Boeing 767-200. CDG.2010.JPG",
    alt: "Avion de ligne aux couleurs de Gabon Airlines sur le tarmac.",
    caption: "Aéroport international de Libreville.",
  },
  {
    id: "centre-donnees",
    query: "data center server room",
    fallbacks: ["server room", "datacenter"],
    alt: "Allée de baies informatiques dans un centre de données.",
    caption: "Centre de données. La souveraineté numérique devient un sujet de politique publique.",
  },
  {
    id: "seminaire-salle",
    query: "conference audience seminar Africa",
    fallbacks: ["audience conference hall", "seminar participants room"],
    alt: "Public assis en rangs dans une salle de conférence, écran de projection au fond.",
    caption: "Séminaire professionnel.",
  },
  {
    id: "documents-bureau",
    query: "office desk paperwork documents",
    fallbacks: ["archive folders documents", "paper files office"],
    alt: "Un contrat imprimé et un stylo posés sur un bureau.",
    caption: "Dossiers réglementaires.",
  },
  {
    id: "logistique-camion",
    query: "truck road Gabon Africa",
    fallbacks: ["freight truck highway", "lorry transport road"],
    alt: "Camion chargé roulant sur une route gabonaise, panneau de distances au bord de la chaussée.",
    caption: "Transport routier. La route reste le maillon coûteux de la chaîne logistique.",
  },
  {
    id: "franc-cfa",
    query: "File:Mille francs CFA.jpg",
    alt: "Un billet de mille francs CFA posé à plat.",
    caption: "Le franc CFA, arrimé à l'euro par une parité fixe.",
  },
];
