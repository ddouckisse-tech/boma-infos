/**
 * Photographic library of the demo dataset — GENERATED FILE.
 *
 * Produced by `bun run scripts/fetch-media.ts`. Do not edit by hand: change
 * `scripts/media-sources.ts` and run the script again.
 *
 * Every byte count below is the real size on disk of the encoded file under
 * `public/medias/`, which is what `scripts/check-budget.ts` adds up to
 * decide whether the build passes the budget of CAHIER-DES-CHARGES.md §5.4.
 */

export type MediaVariant = {
  /** Rendition width in pixels, as written in the srcset descriptor. */
  readonly w: number;
  readonly h: number;
  /** Exact size on disk, in bytes. */
  readonly bytes: number;
};

export type MediaAsset = {
  readonly id: string;
  readonly alt: string;
  readonly caption: string;
  /** Photographer, as published by Wikimedia Commons. */
  readonly credit: string;
  readonly license: string;
  readonly source: string;
  /** Dominant colour, painted under the picture while it loads (no CLS). */
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly avif: readonly MediaVariant[];
  readonly webp: readonly MediaVariant[];
};

export const MEDIA: Record<string, MediaAsset> = {
  "libreville-baie": {
    "id": "libreville-baie",
    "alt": "Le bord de mer de Libreville sous un ciel couvert, palmiers et immeubles en retrait.",
    "caption": "Le front de mer de Libreville, cœur administratif et financier du pays.",
    "credit": "Delrick Williams",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Libreville_bord_de_mer_.jpg",
    "color": "#8898b8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 3199
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 5982
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 9210
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 19530
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 31928
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4138
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 7846
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 13026
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 27510
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 45376
      }
    ]
  },
  "libreville-centre": {
    "id": "libreville-centre",
    "alt": "Rue du centre-ville de Libreville, façades d'immeubles de bureaux et circulation.",
    "caption": "Centre-ville de Libreville. La capitale concentre l'essentiel de l'activité tertiaire.",
    "credit": "Delrick Trevor",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gabon_Mining_Logistics_au_Centre-ville_de_Libreville-2020.jpg",
    "color": "#e8e8e8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5751
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 12422
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 21426
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 48168
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 85918
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9868
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 20206
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 36680
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 90018
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 167180
      }
    ]
  },
  "libreville-boulevard": {
    "id": "libreville-boulevard",
    "alt": "Libreville vue du ciel, le front de mer et la ville en enfilade.",
    "caption": "Libreville, vue aérienne du front de mer.",
    "credit": "Shirmy25",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Libreville_bord_de_mer.jpg",
    "color": "#f8e8e8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5112
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 10707
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 17136
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 36159
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 57318
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8108
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17036
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 28216
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 59788
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 95674
      }
    ]
  },
  "port-gentil": {
    "id": "port-gentil",
    "alt": "Vue aérienne de Port-Gentil, quartiers d'habitation et végétation.",
    "caption": "Port-Gentil, capitale pétrolière du pays.",
    "credit": "Brian Ecton /",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:POG-From_The_Air.jpg",
    "color": "#c8d8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9384
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 20343
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 33178
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 69346
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 102804
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 17236
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 38336
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 62750
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 127414
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 184386
      }
    ]
  },
  "petrole-offshore": {
    "id": "petrole-offshore",
    "alt": "Plateforme pétrolière offshore en mer, torchère et superstructures métalliques.",
    "caption": "Production offshore. Le pétrole pèse encore près de 40 % du PIB gabonais.",
    "credit": "Genghiskhanviet",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:An_oil_rig_offshore_Vungtau.jpg",
    "color": "#886878",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 2790
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 5135
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 8107
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 17247
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 26697
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 3150
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 6700
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 11546
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 25532
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 48244
      }
    ]
  },
  "manganese-mine": {
    "id": "manganese-mine",
    "alt": "Ancienne exploitation minière à ciel ouvert, vaste cratère aux parois rocheuses.",
    "caption": "Exploitation à ciel ouvert. Le Gabon est le deuxième producteur mondial de manganèse.",
    "credit": "Rudolph Botha",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Big_Hole_Kimberley.jpg",
    "color": "#283848",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7263
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 16703
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 28928
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 71317
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 131316
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12434
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 29428
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 52452
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 130070
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 247196
      }
    ]
  },
  "foret-okoume": {
    "id": "foret-okoume",
    "alt": "Sous-bois de forêt équatoriale gabonaise, troncs hauts et végétation dense.",
    "caption": "La forêt couvre 88 % du territoire gabonais.",
    "credit": "Axel Rouvin [2]",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Rainforest_Gabon.jpg",
    "color": "#282808",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 11792
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 27173
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 47050
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 94188
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 124913
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 20994
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 48804
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 84512
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 173640
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 236086
      }
    ]
  },
  "port-owendo": {
    "id": "port-owendo",
    "alt": "Terminal à conteneurs vu du ciel, quais, portiques et navires à quai.",
    "caption": "Terminal à conteneurs. Le fret maritime est le premier poste logistique du pays.",
    "credit": "Delgoff. from Paris, France",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cape_Town_container_port_(view_from_above)_2008-02-10.jpg",
    "color": "#f8f8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8250
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17601
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 29999
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 69968
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 119114
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 13648
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 30276
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 53050
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 124516
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 213118
      }
    ]
  },
  "beac-banque": {
    "id": "beac-banque",
    "alt": "Tour de béton abritant un siège bancaire, vue en contre-plongée.",
    "caption": "Siège bancaire. La politique monétaire de la zone CEMAC est conduite depuis Yaoundé.",
    "credit": "Bdx",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bank_of_Central_African_States_2014_side.JPG",
    "color": "#a8b8c8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 3096
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 5814
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 9599
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 19792
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 31337
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4566
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8944
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 14722
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 31068
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 52624
      }
    ]
  },
  "transgabonais": {
    "id": "transgabonais",
    "alt": "La gare d'Owendo, bâtiment aux bardages colorés, voyageurs sur le parvis.",
    "caption": "La gare d'Owendo, tête de ligne du Transgabonais — 648 kilomètres jusqu'à Franceville.",
    "credit": "David Stanley from Nanaimo, Canada",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gare_d%27Owendo.jpg",
    "color": "#989888",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6005
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11215
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 17702
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 33490
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 45884
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9508
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 18152
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 29206
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 56180
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 71984
      }
    ]
  },
  "marche-libreville": {
    "id": "marche-libreville",
    "alt": "Étals couverts d'un marché urbain, produits frais alignés au sol.",
    "caption": "Commerce de détail. L'informel représente une large part de l'emploi urbain.",
    "credit": "Barada-nikto",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lbv-march%C3%A9-NKembo3.jpg",
    "color": "#181818",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7090
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 14431
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 23034
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 49858
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 83466
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 11176
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 22500
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 36478
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 81462
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 146872
      }
    ]
  },
  "agriculture-plantation": {
    "id": "agriculture-plantation",
    "alt": "Parcelle agricole bordée par une piste de latérite, forêt en arrière-plan.",
    "caption": "Agro-industrie. La filière palmier est l'un des paris de la diversification.",
    "credit": "Highconservationvalues",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gabon-IMG_3064.jpg",
    "color": "#d8d8e8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4450
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8677
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 14182
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 32375
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 54248
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6324
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 13304
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 23130
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 53904
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 92066
      }
    ]
  },
  "reunion-affaires": {
    "id": "reunion-affaires",
    "alt": "Table ronde institutionnelle, participants installés devant leurs dossiers.",
    "caption": "Réunion de direction.",
    "credit": "EU2017EE Estonian Presidency",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Informal_meeting_of_environment_ministers._Round_table_Informal_meeting_of_environment_ministers_(35073247774).jpg",
    "color": "#080808",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7600
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 13269
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 19127
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 35054
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 56634
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12102
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 21788
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 32480
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 60950
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 105176
      }
    ]
  },
  "femme-dirigeante": {
    "id": "femme-dirigeante",
    "alt": "Deux femmes travaillant côte à côte dans une unité de transformation artisanale.",
    "caption": "Entrepreneuriat féminin. Les coopératives de transformation emploient surtout des femmes.",
    "credit": "Oxfam East Africa",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Supporting_local_entrepreneurs_(7534910000).jpg",
    "color": "#f8f8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6140
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11317
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 17276
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 33017
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 51518
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9484
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17200
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 26570
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 50736
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 78482
      }
    ]
  },
  "startup-bureau": {
    "id": "startup-bureau",
    "alt": "Deux personnes travaillant sur un ordinateur portable et des documents posés sur une table.",
    "caption": "Séance de travail dans un espace partagé.",
    "credit": "helloquence",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Helloquence-61189.jpg",
    "color": "#b8c8c8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4649
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 7788
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 11204
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 19920
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 30185
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7368
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 12240
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 17678
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 31602
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 55150
      }
    ]
  },
  "mobile-money": {
    "id": "mobile-money",
    "alt": "Un commerçant derrière le comptoir d'une boutique de téléphonie mobile.",
    "caption": "Paiement mobile. Airtel Money et Moov Money couvrent l'essentiel des transactions.",
    "credit": "Oxfam East Africa",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mobile_phone_shop_(7550611126).jpg",
    "color": "#080808",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6649
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 12919
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 20506
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 39790
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 67776
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 10748
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 21576
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 35314
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 72302
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 132296
      }
    ]
  },
  "energie-solaire": {
    "id": "energie-solaire",
    "alt": "Champ de panneaux photovoltaïques s'étendant jusqu'à l'horizon.",
    "caption": "Centrale photovoltaïque.",
    "credit": "DavidSmat",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:RTR_solar_energy_field_installation.jpg",
    "color": "#98b8d8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5036
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11703
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 21429
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 55926
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 104571
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8310
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 19942
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 38938
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 99480
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 185016
      }
    ]
  },
  "formation-universite": {
    "id": "formation-universite",
    "alt": "Un étudiant attentif au premier rang d'une salle de cours.",
    "caption": "Salle de cours. La formation continue reste le premier frein cité par les employeurs.",
    "credit": "AMISOM Public Information",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:2014_10_23_Somali_National_University_Re-opens_(15428349899).jpg",
    "color": "#e8e8e8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4076
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8544
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 14662
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 35689
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 62998
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6412
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 14312
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 26020
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 64738
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 113706
      }
    ]
  },
  "administration-gabon": {
    "id": "administration-gabon",
    "alt": "Bâtiment administratif gabonais aux murs clairs, entouré de pelouse et de palmiers.",
    "caption": "Administration territoriale gabonaise.",
    "credit": "EVIVI",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mairie_de_Cocobeach_au_Gabon.jpg",
    "color": "#f8f8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7432
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 16112
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 27827
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 65561
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 108399
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12314
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 27052
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 47932
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 113244
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 194950
      }
    ]
  },
  "peche-artisanale": {
    "id": "peche-artisanale",
    "alt": "Barques de pêche artisanale échouées sur une plage de sable.",
    "caption": "Pêche artisanale sur le littoral.",
    "credit": "Mike Lomax",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Fishing_boats_on_the_Paternoster_beach_in_South_Africa_Nov_2009.jpg",
    "color": "#e8e8d8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5591
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 10982
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 17619
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 39728
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 64831
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8418
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17434
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 28832
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 62238
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 101376
      }
    ]
  },
  "chantier-btp": {
    "id": "chantier-btp",
    "alt": "Ouvrier en gilet de chantier aux commandes d'un engin de travaux publics.",
    "caption": "Chantier de bâtiment et travaux publics.",
    "credit": "Edwin Seda",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:South_African_Construction_Site_Progress_in_Rosebank_Johannesburg.jpg",
    "color": "#383838",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5598
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 9583
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 13395
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 23143
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 32259
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8788
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 15382
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 22170
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 38070
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 52312
      }
    ]
  },
  "aeroport-libreville": {
    "id": "aeroport-libreville",
    "alt": "Avion de ligne aux couleurs de Gabon Airlines sur le tarmac.",
    "caption": "Aéroport international de Libreville.",
    "credit": "FRED",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Gabon_Airlines._Boeing_767-200._CDG.2010.JPG",
    "color": "#7898b8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 3073
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 5384
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 8009
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 15271
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 24310
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4370
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8348
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 12844
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 24578
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 38498
      }
    ]
  },
  "centre-donnees": {
    "id": "centre-donnees",
    "alt": "Allée de baies informatiques dans un centre de données.",
    "caption": "Centre de données. La souveraineté numérique devient un sujet de politique publique.",
    "credit": "123net",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:123Net_Data_Center_(DC2).jpg",
    "color": "#080808",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4753
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8746
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 13341
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 26445
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 42386
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7314
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 13904
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 22312
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 49542
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 63612
      }
    ]
  },
  "seminaire-salle": {
    "id": "seminaire-salle",
    "alt": "Public assis en rangs dans une salle de conférence, écran de projection au fond.",
    "caption": "Séminaire professionnel.",
    "credit": "US Army Africa from Vicenza, Italy",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:U.S._Army_Africa_commander_addresses_security_conference_(7159391219).jpg",
    "color": "#080808",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4393
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 7181
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 10532
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 17300
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 25478
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6896
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11212
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 16146
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 27004
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 45340
      }
    ]
  },
  "documents-bureau": {
    "id": "documents-bureau",
    "alt": "Un contrat imprimé et un stylo posés sur un bureau.",
    "caption": "Dossiers réglementaires.",
    "credit": "Blogtrepreneur",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Legal_Contract_%26_Signature_-_Warm_Tones.jpg",
    "color": "#485858",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4066
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8675
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 14303
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 27082
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 40452
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5800
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11790
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 19788
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 37182
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 54838
      }
    ]
  },
  "logistique-camion": {
    "id": "logistique-camion",
    "alt": "Camion chargé roulant sur une route gabonaise, panneau de distances au bord de la chaussée.",
    "caption": "Transport routier. La route reste le maillon coûteux de la chaîne logistique.",
    "credit": "David Stanley from Nanaimo, Canada",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Crossing_the_Equator_(46217438471).jpg",
    "color": "#f8f8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6759
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 14019
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 22377
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 41581
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 55773
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 10556
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 22004
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 35784
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 66232
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 85884
      }
    ]
  },
  "franc-cfa": {
    "id": "franc-cfa",
    "alt": "Un billet de mille francs CFA posé à plat.",
    "caption": "Le franc CFA, arrimé à l'euro par une parité fixe.",
    "credit": "Nicholas Gemini",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mille_francs_CFA.jpg",
    "color": "#f8f8f8",
    "width": 1280,
    "height": 720,
    "avif": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7529
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17707
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 33280
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 89199
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 160283
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 13542
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 32076
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 60472
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 175772
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 329734
      }
    ]
  }
};

export const getMedia = (id: string): MediaAsset | undefined => MEDIA[id];
