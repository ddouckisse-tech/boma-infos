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
        "bytes": 7139
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 10037
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 14910
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 23909
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4260
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8086
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 12082
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 17170
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 25602
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 41716
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
        "bytes": 16793
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 23546
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 37987
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 68154
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9996
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 20704
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 34410
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 48496
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 84942
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 158886
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
        "bytes": 13460
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 19217
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 28528
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 45268
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8252
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17404
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 26638
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 37706
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 56442
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 90030
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
        "bytes": 26221
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 37770
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 54582
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 81773
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 17606
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 39018
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 58440
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 83634
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 118066
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 171058
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
        "bytes": 5979
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 8952
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 12186
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 18633
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 3232
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 6906
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 10404
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 14780
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 22868
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 41438
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
        "bytes": 21409
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 33481
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 53521
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 96820
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12760
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 29918
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 49264
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 75178
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 123212
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 231630
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
        "bytes": 37375
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 51411
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 74710
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 100255
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 21380
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 49768
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 79054
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 111550
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 164184
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 219348
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
        "bytes": 23023
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 34320
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 54429
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 94458
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 13838
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 31198
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 50430
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 74754
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 117098
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 200242
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
        "bytes": 7589
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 10628
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 15451
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 24435
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4622
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 9164
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 13940
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 19438
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 28862
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 48240
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
        "bytes": 13819
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 18512
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 25914
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 36136
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9644
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 18606
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 27096
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 36600
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 51248
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 65890
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
        "bytes": 17649
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 25300
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 36849
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 60491
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 11350
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 23134
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 33718
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 48778
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 74460
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 132556
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
        "bytes": 10460
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 15468
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 23889
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 40145
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6456
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 13698
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 21482
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 31934
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 49860
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 84866
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
        "bytes": 15594
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 20573
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 27766
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 42660
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12302
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 22004
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 30306
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 39902
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 56016
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 95278
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
        "bytes": 14139
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 18713
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 26237
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 40621
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 9684
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17596
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 24692
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 33360
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 46964
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 72794
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
        "bytes": 9039
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 11668
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 15896
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 23131
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7568
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 12604
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 16362
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 21394
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 29088
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 46666
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
        "bytes": 16067
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 20883
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 30812
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 50823
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 10950
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 22040
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 32678
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 43880
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 66420
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 121746
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
        "bytes": 15389
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 24445
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 41768
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 79883
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8534
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 20570
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 36412
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 56304
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 94184
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 175508
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
        "bytes": 10511
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 15702
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 25301
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 45742
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 6532
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 14664
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 24158
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 37306
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 60698
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 106800
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
        "bytes": 21569
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 31959
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 51098
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 84039
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 12606
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 27636
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 45082
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 66662
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 107116
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 183030
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
        "bytes": 13861
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 20352
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 31336
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 51090
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8580
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 17826
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 27014
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 38078
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 58132
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 93730
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
        "bytes": 11047
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 14326
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 18884
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 26390
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 8940
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 15744
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 20834
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 26688
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 35614
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 48640
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
        "bytes": 6580
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 8648
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 12231
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 18475
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 4448
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 8584
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 11926
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 16040
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 22416
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 35242
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
        "bytes": 10566
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 13879
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 18754
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 28228
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7496
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 14360
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 20400
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 27338
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 42674
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 56752
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
        "bytes": 8911
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 10711
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 14186
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 19732
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 7104
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 11482
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 15150
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 18604
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 25102
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 39088
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
        "bytes": 11525
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 16110
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 22144
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 33253
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 5976
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 12014
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 18292
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 25342
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 35118
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 51704
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
        "bytes": 17776
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 23180
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 32658
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 44399
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 10716
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 22490
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 33636
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 44274
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 61894
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 78588
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
        "bytes": 23849
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 37039
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 66570
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 122392
      }
    ],
    "webp": [
      {
        "w": 320,
        "h": 180,
        "bytes": 13786
      },
      {
        "w": 480,
        "h": 270,
        "bytes": 32842
      },
      {
        "w": 640,
        "h": 360,
        "bytes": 56818
      },
      {
        "w": 768,
        "h": 432,
        "bytes": 91430
      },
      {
        "w": 960,
        "h": 540,
        "bytes": 167364
      },
      {
        "w": 1280,
        "h": 720,
        "bytes": 315144
      }
    ]
  }
};

export const getMedia = (id: string): MediaAsset | undefined => MEDIA[id];
