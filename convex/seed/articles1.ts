import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubrique « Business & Lifestyle » et éditorial.
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_1: readonly SeedArticle[] = [
  {
    slug: "rachat-actifs-petroliers-ivindo-capital",
    title: "Rachat des actifs pétroliers d'Ozouri Petroleum : ce que change l'entrée de l'État au capital",
    dek: "Ivindo Capital, consortium public-privé, prend 40 % du capital d'Ozouri Petroleum et de ses champs matures. Recettes de l'État, sous-traitants locaux, gouvernance : ce que révèle ce rachat.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "big-deal",
    authorSlug: "serge-boussougou",
    heroMediaKey: "petrole-offshore",
    galleryMediaKeys: [
      "port-gentil",
    ],
    keyPoints: [
      "Un consortium associant l'État et des investisseurs privés régionaux prend pied dans l'amont pétrolier gabonais.",
      "L'opération doit apporter des recettes fiscales supplémentaires, sans certitude sur le rythme des versements.",
      "Les sous-traitants locaux réclament des engagements écrits sur les volumes de contrats à venir.",
    ],
    seo: {
      description: "Rachat des actifs d'Ozouri Petroleum par Ivindo Capital : effets attendus sur les recettes de l'État, les sous-traitants et la gouvernance.",
      keywords: [
        "pétrole Gabon",
        "Ivindo Capital",
        "Ozouri Petroleum",
        "rachat actifs pétroliers",
        "contenu local",
      ],
    },
    origin: "redaction",
    feature: "lead",
    tags: [
      "petrole",
      "gabon",
      "investissement",
      "energie",
      "secteur-public",
    ],
    daysAgo: 1,
    views: 2600,
    body: [
      {
        type: "paragraph",
        text: "Le gouvernement gabonais entre au capital d'Ozouri Petroleum. Un consortium public-privé baptisé Ivindo Capital a signé, mardi, un accord portant sur le rachat de 40 % des parts de cet opérateur pétrolier indépendant, présent au Gabon depuis 2015 sur plusieurs champs matures du bassin sédimentaire côtier, entre Port-Gentil et Gamba. L'accord met fin à plusieurs mois de négociations discrètes, entamées après l'annonce d'un projet de cession partielle par l'actionnaire historique de la société.",
      },
      {
        type: "paragraph",
        text: "L'opération valorise l'ensemble d'Ozouri Petroleum à environ 450 milliards de FCFA, dividendes courants inclus, et reste soumise à l'accord de l'Autorité de la concurrence ainsi qu'à celui de l'administration en charge des hydrocarbures. Le calendrier n'est pas neutre : la remontée des cours du baril depuis un an a redonné de l'attrait à des actifs pétroliers matures que certains investisseurs jugeaient, il y a encore deux ans, en fin de cycle.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un consortium inédit",
      },
      {
        type: "paragraph",
        text: "Ivindo Capital réunit l'État gabonais, actionnaire majoritaire du véhicule à hauteur de 60 %, et Ogooué Ressources, un fonds d'investissement régional déjà présent dans la logistique portuaire et le financement d'infrastructures. Les deux partenaires avaient déjà travaillé ensemble sur le financement d'un terminal à conteneurs, ce qui a facilité le montage juridique de cette opération plus complexe. Cette architecture doit permettre à l'État de peser sur les décisions stratégiques du futur ensemble sans en assumer seul la responsabilité opérationnelle, ni le risque financier intégral.",
      },
      {
        type: "stat",
        value: "180 milliards de FCFA",
        label: "Montant de la prise de participation de Ivindo Capital dans Ozouri Petroleum",
        source: "Ivindo Capital",
      },
      {
        type: "paragraph",
        text: "Ozouri Petroleum extrait aujourd'hui près de 25 000 barils par jour, soit environ un huitième de la production nationale. Ses champs, exploités depuis plus de vingt ans par différents opérateurs successifs, entrent dans une phase de déclin naturel que des techniques de récupération assistée, injection d'eau et forages complémentaires, pourraient prolonger de dix à quinze ans. L'entreprise emploie directement près de 400 salariés, auxquels s'ajoutent les effectifs des sous-traitants présents sur les plateformes et les bases arrière de Port-Gentil.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que cela change pour l'État",
      },
      {
        type: "paragraph",
        text: "Pour les finances publiques, l'entrée au capital ouvre droit à une part des dividendes, en plus des redevances déjà perçues sur chaque baril extrait, quel que soit l'actionnariat de l'opérateur. Le gain net reste toutefois difficile à chiffrer à ce stade : il dépendra du cours du baril, du rythme des versements décidés par le nouveau conseil d'administration, et des investissements que Ivindo Capital devra lui-même consentir pour prolonger la durée de vie des champs.",
      },
      {
        type: "quote",
        text: "Nous n'achetons pas seulement des barils, nous achetons une place à la table où se décident les investissements des dix prochaines années. C'est un changement de posture pour l'État, qui devient partie prenante plutôt que simple percepteur de redevances.",
        attribution: "Thierry Bouka, directeur général de Ivindo Capital",
      },
      {
        type: "paragraph",
        text: "Du côté des sous-traitants, l'annonce est accueillie avec un optimisme prudent. Une trentaine d'entreprises gabonaises, de la maintenance industrielle au transport de personnel offshore, dépendent directement des contrats d'Ozouri Petroleum, pour des montants cumulés estimés à plusieurs dizaines de milliards de FCFA par an. Beaucoup craignent qu'un changement d'actionnariat ne s'accompagne d'une renégociation à la baisse de leurs contrats en cours. Ivindo Capital leur a présenté quatre engagements, lors d'une réunion organisée la semaine dernière avec les fédérations professionnelles concernées :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Maintien des contrats de maintenance déjà attribués à des entreprises locales",
          "Renforcement de la clause de contenu local dans les prochains appels d'offres",
          "Ouverture d'un programme de formation pour les techniciens gabonais",
          "Publication annuelle de la liste des principaux contrats attribués à des entreprises gabonaises",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Un risque de gestion à surveiller",
      },
      {
        type: "paragraph",
        text: "Reste un risque que plusieurs analystes soulignent : la présence de l'État au capital d'un opérateur ne garantit pas, à elle seule, une meilleure gestion. Ailleurs sur le continent, des prises de participation publiques dans l'amont pétrolier ont parfois pesé sur la gouvernance des sociétés concernées plus qu'elles n'ont renforcé les recettes publiques, notamment lorsque les nominations aux postes de direction ont primé sur les compétences techniques. Ivindo Capital assure vouloir s'en tenir à un rôle d'actionnaire, sans intervenir dans la gestion opérationnelle quotidienne des champs.",
      },
      {
        type: "quote",
        text: "L'État doit se comporter en actionnaire, pas en gestionnaire. La tentation de peser sur les arbitrages opérationnels, les achats ou les recrutements, est le principal risque de ce type de montage. Elle se paie en général par une perte d'efficacité industrielle.",
        attribution: "Léa Nzoghe, économiste spécialiste des industries extractives",
      },
      {
        type: "paragraph",
        text: "Le dossier a été transmis à l'Autorité de la concurrence la semaine dernière, pour un examen dont la durée réglementaire ne peut excéder deux mois. Les deux parties visent une clôture de l'opération avant la fin de l'année civile, sous réserve du calendrier réglementaire et de l'obtention des financements complémentaires nécessaires au programme d'investissement annoncé.",
      },
      {
        type: "paragraph",
        text: "D'autres opérateurs indépendants, confrontés au même vieillissement de leurs champs, suivront de près l'issue de ce dossier : il pourrait servir de modèle, ou de repoussoir, aux prochaines discussions entre l'État et le secteur pétrolier privé. Dans un pays où le pétrole pèse encore près de 40 % du PIB, la manière dont l'État choisit d'intervenir dans le capital des opérateurs n'est jamais un sujet purement financier. D'autres dossiers du même type sont réunis dans notre rubrique [Big Deal](/rubrique/big-deal).",
      },
    ],
  },
  {
    slug: "manganese-capacite-evacuation-owendo",
    title: "Manganèse : 1 200 milliards de FCFA pour doubler la capacité d'évacuation",
    dek: "Un financement de 1 200 milliards de FCFA doit doubler, en trois ans, la capacité d'évacuation du manganèse gabonais entre les mines du Haut-Ogooué et le terminal d'Owendo, voie ferrée comprise.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "big-deal",
    authorSlug: "serge-boussougou",
    heroMediaKey: "manganese-mine",
    galleryMediaKeys: [
      "port-owendo",
      "transgabonais",
    ],
    keyPoints: [
      "Le financement, réparti entre un nouveau terminal à Owendo et le renforcement de la voie ferrée, doit doubler les volumes exportés.",
      "La voie ferrée, aujourd'hui saturée sur certains tronçons, conditionne la pleine utilisation du futur terminal minéralier.",
      "Les entreprises gabonaises de génie civil sont associées aux travaux, avec un volet formation aux métiers ferroviaires.",
    ],
    seo: {
      description: "Terminal minéralier et voie ferrée : comment un financement de 1 200 milliards de FCFA doit doubler les exportations gabonaises de manganèse.",
      keywords: [
        "manganèse Gabon",
        "port d'Owendo",
        "Transgabonais",
        "financement minier",
        "Haut-Ogooué",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "manganese",
      "gabon",
      "logistique",
      "infrastructure",
    ],
    daysAgo: 4,
    views: 900,
    body: [
      {
        type: "paragraph",
        text: "Un financement de 1 200 milliards de FCFA doit permettre de doubler la capacité d'évacuation du manganèse gabonais d'ici trois ans. L'enveloppe, bouclée cette semaine après plusieurs mois de discussions entre actionnaires, associe prêts bancaires régionaux, financements d'agences à l'export et apport en fonds propres, dans un contexte de cours du manganèse resté élevé sur les deux dernières années.",
      },
      {
        type: "paragraph",
        text: "Elle se répartit en deux volets : 700 milliards de FCFA pour un nouveau terminal minéralier au port d'Owendo, et 500 milliards de FCFA pour le renforcement de la voie ferrée qui relie les mines du Haut-Ogooué à la côte, sur près de 650 kilomètres. Les deux chantiers doivent avancer en parallèle, sous peine de voir l'un neutraliser les gains de capacité de l'autre.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un terminal flambant neuf",
      },
      {
        type: "paragraph",
        text: "Le futur terminal, confié à Estuaire Logistique, doublera la longueur de quai disponible et portera le tirant d'eau à 14 mètres, de quoi accueillir des vraquiers de plus grande taille et réduire le nombre de rotations nécessaires pour un même tonnage exporté. Les travaux doivent démarrer au premier trimestre et s'étaler sur environ trois ans, sans interruption de l'activité portuaire existante.",
      },
      {
        type: "stat",
        value: "12 millions de tonnes",
        label: "Capacité d'évacuation annuelle visée à Owendo, contre 6 millions de tonnes aujourd'hui",
        source: "Estuaire Logistique",
      },
      {
        type: "heading",
        level: 2,
        text: "La voie ferrée, maillon critique",
      },
      {
        type: "paragraph",
        text: "En amont, la voie ferrée reste le principal goulot d'étranglement du système : certaines sections à voie unique limitent le nombre de convois quotidiens, et le parc de wagons peine à suivre la cadence de production des mines, en particulier pendant la saison des pluies. Le renforcement prévoit de nouvelles voies d'évitement, la réhabilitation de plusieurs ponts et l'achat de wagons supplémentaires auprès de fournisseurs régionaux.",
      },
      {
        type: "quote",
        text: "Sans cette mise à niveau de la voie ferrée, le nouveau terminal tournerait à moitié de sa capacité. Les deux chantiers avancent volontairement de pair, pilotés par la même équipe de projet.",
        attribution: "Hervé Mabicka, directeur logistique d'Estuaire Logistique",
      },
      {
        type: "paragraph",
        text: "Haut-Ogooué Manganèse, qui exploite les principaux gisements concernés, met en avant les retombées locales du chantier : entreprises de génie civil gabonaises associées aux travaux de terrassement, sous-traitance du gardiennage et de la restauration de chantier, et ouverture de plusieurs postes à des ingénieurs formés localement. La société publie, pour la première fois, un calendrier détaillé de ces engagements :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Environ 900 emplois directs sur la durée des travaux, selon les entreprises concernées",
          "Un quota de sous-traitance réservé aux PME gabonaises pour le génie civil",
          "Un programme de formation aux métiers ferroviaires ouvert dans la province",
          "Un comité de suivi associant autorités locales et représentants des riverains",
        ],
      },
      {
        type: "paragraph",
        text: "La montée en puissance du terminal et de la voie ferrée est calée sur l'entrée en service de nouvelles mines dans le Haut-Ogooué. Pour l'État, l'enjeu est direct : les redevances minières sont assises sur les tonnages effectivement exportés, et non sur la seule production extraite. Tant que le goulot logistique persiste, une partie de la ressource reste, de fait, sans valeur fiscale immédiate. Les prochains rapports d'activité de Haut-Ogooué Manganèse seront donc suivis de près, au-delà des seuls chiffres de production.",
      },
    ],
  },
  {
    slug: "guichet-unique-creation-entreprise-72-heures",
    title: "Créer son entreprise à Libreville : le guichet unique ramène le délai à 72 heures",
    dek: "À Libreville, le guichet unique de création d'entreprise annonce un délai moyen de 72 heures, contre trois semaines auparavant. Reste à simplifier l'ouverture d'un compte bancaire et l'accès au foncier.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "entreprendre",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "administration-gabon",
    galleryMediaKeys: [
      "documents-bureau",
    ],
    keyPoints: [
      "Le guichet unique regroupe sept formalités en un seul dossier et ramène la création d'entreprise à 72 heures en moyenne.",
      "Compte bancaire professionnel et titre foncier restent les principaux points de blocage une fois l'entreprise immatriculée.",
      "Plus de 3 200 entreprises ont été enregistrées depuis l'ouverture du dispositif, avant son extension prévue à deux autres villes.",
    ],
    seo: {
      description: "Création d'entreprise à Libreville : le guichet unique promet 72 heures, mais compte bancaire et foncier restent des obstacles.",
      keywords: [
        "guichet unique Gabon",
        "créer une entreprise Libreville",
        "entrepreneuriat Gabon",
        "formalités administratives",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "entrepreneuriat",
      "gabon",
      "administration",
      "pme",
    ],
    daysAgo: 6,
    views: 1200,
    body: [
      {
        type: "paragraph",
        text: "Créer une entreprise à Libreville prenait, il y a un an encore, près de trois semaines et une dizaine de déplacements entre administrations différentes, souvent situées à l'autre bout de la ville. Certains créateurs renonçaient purement et simplement, ou reportaient leur projet de plusieurs mois. Le guichet unique de création d'entreprise annonce aujourd'hui un délai moyen de **72 heures** pour un dossier complet, pièces justificatives comprises.",
      },
      {
        type: "paragraph",
        text: "Le principe : un entrepreneur dépose un seul dossier, en un seul lieu, et le guichet se charge en interne de l'immatriculation au registre du commerce, de l'attribution de l'identifiant fiscal, de l'affiliation à la caisse de sécurité sociale et de la publication légale de la création. L'entrepreneur n'a plus à produire lui-même les attestations intermédiaires d'une administration à l'autre.",
      },
      {
        type: "heading",
        level: 2,
        text: "Sept démarches, un seul dossier",
      },
      {
        type: "paragraph",
        text: "Auparavant, ces formalités supposaient sept démarches distinctes, réparties entre plusieurs bâtiments administratifs, chacune avec ses horaires d'ouverture, ses guichets dédiés et ses pièces à fournir, parfois redondantes d'une administration à l'autre. Un dossier incomplet dans l'une d'elles pouvait allonger l'ensemble du parcours de plusieurs semaines, le temps de reprendre la file d'attente suivante.",
      },
      {
        type: "stat",
        value: "72 heures",
        label: "Délai moyen annoncé pour un dossier complet, contre trois semaines avant la réforme",
        source: "guichet unique de Libreville",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Avant : sept guichets, environ trois semaines, une dizaine de déplacements",
          "Après : un dossier unique, 72 heures en moyenne, un seul point de dépôt",
          "Toujours en dehors du dispositif : compte bancaire professionnel et titre foncier",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Ce qui reste à améliorer",
      },
      {
        type: "paragraph",
        text: "La création juridique de l'entreprise n'est qu'une étape parmi d'autres. L'ouverture d'un compte bancaire professionnel prend encore, selon plusieurs témoignages recueillis auprès de jeunes entrepreneurs, une à deux semaines supplémentaires, le temps que la banque instruise son propre dossier de connaissance client. L'obtention d'un titre foncier pour un local commercial reste, elle, le point noir le plus souvent cité, certains dossiers restant en instance plusieurs mois.",
      },
      {
        type: "quote",
        text: "En 72 heures, j'avais mon numéro d'immatriculation, ce qui m'a beaucoup surprise. Il m'a ensuite fallu attendre douze jours de plus pour ouvrir un compte au nom de l'entreprise, le temps que la banque vérifie mon dossier.",
        attribution: "Sandrine Okomo, fondatrice de Nzé Design",
      },
      {
        type: "paragraph",
        text: "Depuis l'ouverture du guichet unique en début d'année, plus de 3 200 entreprises y ont été enregistrées, contre un peu plus de 2 000 sur la même période l'an dernier, tous circuits confondus. Une partie de ces créations correspond à des activités déjà exercées de manière informelle, dont les gérants ont profité de la simplification pour se mettre en règle. Le guichet ne communique pas encore de détail sectoriel, mais le commerce et les services représentent, de l'aveu de ses agents, la majorité des dossiers traités.",
      },
      {
        type: "paragraph",
        text: "Le dispositif doit être étendu à Port-Gentil et Franceville d'ici la fin de l'année, avec un objectif affiché : ramener, à terme, l'ensemble des formalités à un dossier numérique unique, consultable en ligne. D'autres initiatives comparables sont recensées dans notre rubrique [Entreprendre](/rubrique/entreprendre), où plusieurs entrepreneurs racontent leur propre parcours administratif.",
      },
    ],
  },
  {
    slug: "manioc-amidon-industrialisation-gabon",
    title: "Une jeune pousse gabonaise industrialise la transformation du manioc en amidon",
    dek: "Dans la Ngounié, une usine transforme désormais le manioc en amidon industriel et vise à réduire les importations. Le financement du projet a mis quatre ans à se boucler, faute de garanties bancaires suffisantes.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "innovation",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "agriculture-plantation",
    galleryMediaKeys: [
      "marche-libreville",
    ],
    keyPoints: [
      "Une usine installée dans la Ngounié transforme le manioc en amidon industriel, un produit aujourd'hui largement importé.",
      "Le projet a mis quatre ans à réunir son financement, les banques jugeant le risque agro-industriel trop élevé.",
      "Une quarantaine de familles de producteurs bénéficient d'un prix garanti, une sécurité rare dans la filière manioc.",
    ],
    seo: {
      description: "Amidon de manioc : comment une usine gabonaise veut réduire les importations, malgré quatre ans de difficultés de financement.",
      keywords: [
        "amidon de manioc",
        "agro-industrie Gabon",
        "Ngounié",
        "substitution aux importations",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "agroalimentaire",
      "gabon",
      "agriculture",
      "innovation",
    ],
    daysAgo: 9,
    views: 1500,
    body: [
      {
        type: "paragraph",
        text: "Une unité installée dans la Ngounié, à quelques kilomètres de Mouila, transforme désormais le manioc en amidon industriel, un produit presque entièrement importé jusqu'ici pour couvrir les besoins de l'agroalimentaire et de la pharmacie locales. La première ligne de production a démarré en juillet, après plusieurs mois d'essais techniques.",
      },
      {
        type: "paragraph",
        text: "L'usine, portée par Ngounié Agro-Industries, doit atteindre 5 000 tonnes d'amidon par an à pleine capacité, en trois phases successives. Elle s'approvisionne auprès de coopératives de petits producteurs, sur environ 800 hectares de plantations sous contrat, un mode d'approvisionnement encore rare dans une filière manioc largement informelle. L'entreprise emploie déjà 45 personnes en usine, un chiffre qui doit doubler une fois la deuxième ligne installée.",
      },
      {
        type: "heading",
        level: 2,
        text: "Substituer aux importations",
      },
      {
        type: "paragraph",
        text: "L'amidon de manioc entre dans la fabrication de produits alimentaires, de cartons d'emballage, de colles industrielles et de certains médicaments. Une bonne partie de la demande gabonaise est aujourd'hui couverte par des importations en provenance d'Asie et d'Europe, faute de capacité de transformation locale suffisante, malgré une production nationale de manioc frais largement excédentaire pour la seule consommation domestique, notamment dans les provinces du Sud où la culture du manioc reste la plus répandue.",
      },
      {
        type: "stat",
        value: "8 000 tonnes",
        label: "Volume d'amidon importé chaque année par le Gabon, selon les estimations du secteur",
        source: "Ngounié Agro-Industries",
      },
      {
        type: "heading",
        level: 2,
        text: "Un financement difficile à boucler",
      },
      {
        type: "paragraph",
        text: "Le projet a mis près de quatre ans à trouver son financement complet. Les banques commerciales, peu familières du risque agro-industriel et échaudées par de précédents projets agricoles restés inachevés, ont d'abord refusé d'accompagner l'achat des équipements de transformation. Un fonds de garantie régional a fini par sécuriser une partie du crédit d'équipement, permettant de débloquer un premier prêt bancaire l'an dernier.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Absence d'historique financier pour une activité agro-industrielle nouvelle",
          "Valeur de revente incertaine des équipements de transformation en cas de défaut",
          "Cycle long entre l'investissement et les premières livraisons commerciales",
        ],
      },
      {
        type: "quote",
        text: "On nous demandait des garanties qu'une jeune entreprise agricole ne peut pas offrir en début d'activité. Sans le fonds de garantie, le projet restait sur le papier, malgré des années d'études de faisabilité déjà financées sur fonds propres.",
        attribution: "Odile Ntoutoume, ingénieure agronome, fondatrice de Ngounié Agro-Industries",
      },
      {
        type: "paragraph",
        text: "Les producteurs sous contrat reçoivent un prix fixé à l'avance pour leurs récoltes de manioc, une sécurité inhabituelle dans une filière où les prix fluctuent fortement au gré des marchés locaux et des récoltes concurrentes. Une quarantaine de familles sont aujourd'hui engagées dans le dispositif, avec un objectif d'une centaine d'ici deux ans.",
      },
      {
        type: "paragraph",
        text: "L'entreprise vise une deuxième ligne de production d'ici deux ans, avec l'ambition d'exporter vers d'autres pays de la zone CEMAC si la demande locale est absorbée en priorité. Ngounié Agro-Industries espère aussi convaincre d'autres coopératives de rejoindre le dispositif de contrat, à mesure que les premiers producteurs témoignent de la régularité des paiements. Un deuxième fonds de garantie régional a déjà été sollicité pour accompagner cette extension, sur le même modèle que le premier financement.",
      },
    ],
  },
  {
    slug: "premier-centre-donnees-tier-iii-gabon",
    title: "Le Gabon inaugure son premier centre de données de niveau Tier III",
    dek: "À Akanda, le premier centre de données certifié Tier III du Gabon promet des temps de réponse bien plus courts pour les entreprises locales, au prix d'une consommation électrique déjà surveillée par son exploitant.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "technologie",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "centre-donnees",
    keyPoints: [
      "Le pays dispose d'un centre de données certifié Tier III, une alternative à l'hébergement à l'étranger pour les grands comptes gabonais.",
      "Le rapatriement des données réduit fortement les temps de réponse, mais la consommation électrique reste un point de vigilance.",
      "Banques, opérateurs télécoms et administrations sont les premiers clients visés, portés par l'exigence de conservation locale des données.",
    ],
    seo: {
      description: "Centre de données Tier III à Akanda : latence réduite pour les entreprises gabonaises, mais la consommation électrique reste un défi.",
      keywords: [
        "centre de données Gabon",
        "Tier III",
        "souveraineté numérique",
        "hébergement Akanda",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "technologie",
      "gabon",
      "numerique",
      "infrastructure",
    ],
    daysAgo: 11,
    views: 1750,
    body: [
      {
        type: "paragraph",
        text: "Le Gabon dispose désormais d'un centre de données certifié Tier III, une première dans le pays. L'infrastructure, installée à Akanda, à la sortie de Libreville, a été mise en service ce mois-ci par l'opérateur Estuaire Numérique, après dix-huit mois de travaux menés en partie par des entreprises locales de génie électrique. Le site dispose également d'un accès direct à deux boucles de fibre optique distinctes, condition posée par plusieurs clients avant la signature de leur contrat.",
      },
      {
        type: "paragraph",
        text: "La certification Tier III, un standard international reconnu dans l'industrie, impose une redondance des équipements critiques : alimentation électrique, climatisation et connectivité peuvent tomber en panne isolément sans interrompre le service aux clients hébergés, avec une disponibilité annoncée proche de 99,98 % sur une année pleine.",
      },
      {
        type: "heading",
        level: 2,
        text: "La fin de l'hébergement à distance",
      },
      {
        type: "paragraph",
        text: "Jusqu'ici, une large part des données des entreprises et administrations gabonaises transitait par des serveurs situés en Europe, faute d'infrastructure locale répondant aux normes de sécurité exigées par les grands comptes bancaires et industriels. Ce choix a un coût direct, facturé en devises, et un temps de latence non négligeable pour l'utilisateur final connecté depuis Libreville ou l'intérieur du pays.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Applications bancaires nécessitant un temps de réponse très court",
          "Bases de données de santé soumises à des règles de confidentialité strictes",
          "Sites et services publics consultés majoritairement depuis le territoire national",
        ],
      },
      {
        type: "stat",
        value: "de 150 à moins de 10 millisecondes",
        label: "Temps de réponse pour un utilisateur connecté depuis Libreville, avant et après le rapatriement d'une application, selon l'exploitant",
        source: "Estuaire Numérique",
      },
      {
        type: "heading",
        level: 2,
        text: "Une facture électrique à surveiller",
      },
      {
        type: "paragraph",
        text: "Un centre de données de cette taille consomme en continu : la puissance installée atteint 8 mégawatts, avec un objectif de charge utile autour de 6 mégawatts une fois les premières salles remplies, soit la consommation d'un quartier d'environ 15 000 foyers. L'alimentation combine réseau public et groupes électrogènes de secours, dimensionnés pour tenir plusieurs jours en cas de coupure prolongée.",
      },
      {
        type: "quote",
        text: "La disponibilité électrique est notre premier sujet de vigilance, avant même la sécurité informatique. Un centre de données ne pardonne pas les coupures, et nos clients l'exigent contractuellement dans les niveaux de service que nous leur garantissons.",
        attribution: "Fabrice Ogandaga, directeur technique d'Estuaire Numérique",
      },
      {
        type: "paragraph",
        text: "L'opérateur cible en priorité les banques, les opérateurs de télécommunications et les administrations soumises à des obligations de conservation des données sur le territoire national. L'argument de la souveraineté numérique pèse de plus en plus dans les appels d'offres publics, à mesure que les incidents de sécurité informatique se multiplient à l'échelle régionale, y compris chez plusieurs voisins de la sous-région CEMAC.",
      },
      {
        type: "paragraph",
        text: "Une deuxième salle, deux fois plus grande, est déjà à l'étude. Elle dépendra en partie de la capacité du réseau électrique local à absorber une charge supplémentaire sans fragiliser les quartiers environnants, un arbitrage qui associera nécessairement le gestionnaire du réseau électrique national aux prochaines étapes du projet.",
      },
    ],
  },
  {
    slug: "fibre-optique-backbone-national-franceville",
    title: "Fibre optique : le réseau national atteint Franceville",
    dek: "En suivant le corridor du Transgabonais, la fibre optique relie désormais Franceville au reste du pays. Le prix de gros de la donnée chute, sans certitude sur son effet réel pour les abonnés.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "technologie",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "transgabonais",
    galleryMediaKeys: [
      "chantier-btp",
    ],
    keyPoints: [
      "La fibre optique suit désormais le corridor ferroviaire du Transgabonais jusqu'à Franceville, avec des raccordements intermédiaires.",
      "Le prix de gros du méga-octet chute fortement sur ce tronçon, sans garantie de répercussion intégrale sur les tarifs des abonnés.",
      "Administrations, hôpitaux et écoles de l'intérieur du pays sont les premiers bénéficiaires, avant un possible effet sur les prix de détail.",
    ],
    seo: {
      description: "Fibre optique jusqu'à Franceville : le prix de gros de la donnée baisse fortement, mais son effet sur la facture des abonnés reste incertain.",
      keywords: [
        "fibre optique Gabon",
        "Franceville",
        "Transgabonais",
        "prix de la donnée",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "telecommunications",
      "gabon",
      "fibre-optique",
      "numerique",
    ],
    daysAgo: 14,
    views: 2100,
    body: [
      {
        type: "paragraph",
        text: "Le réseau national de fibre optique atteint désormais Franceville. La liaison, posée par Ogooué Fibre, a été mise en service cette semaine après un peu plus d'un an de travaux, retardés à deux reprises par la saison des pluies dans la vallée de l'Ogooué. Les riverains consultés lors de l'enquête publique avaient surtout demandé des garanties sur la remise en état des abords de la voie après les travaux.",
      },
      {
        type: "paragraph",
        text: "Le tracé suit sur 648 kilomètres le corridor du Transgabonais, entre Owendo et Franceville, avec des points d'atterrissement intermédiaires à Ndjolé, Lastoursville et Moanda, où des armoires techniques permettent de raccorder les opérateurs locaux sans attendre l'arrivée du câble à son terminus.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un tracé calé sur le rail",
      },
      {
        type: "paragraph",
        text: "Suivre l'emprise de la voie ferrée a permis de limiter les expropriations et d'accélérer le chantier : un accord de passage a été négocié avec le gestionnaire de la voie ferrée, et les engins de pose ont pu circuler le long des rails plutôt que d'ouvrir de nouvelles pistes en forêt, une méthode déjà éprouvée ailleurs sur le continent pour ce type de liaison longue distance, notamment sur les grands axes ferroviaires d'Afrique australe et de l'Est.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Ndjolé et Lastoursville disposent désormais d'un point de raccordement direct au backbone national",
          "Moanda bénéficie d'une capacité renforcée, utile aux sites industriels de la région",
          "Franceville devient le nouveau terminus est du réseau, avant une extension vers Lékoni",
        ],
      },
      {
        type: "stat",
        value: "de 45 à 18 FCFA",
        label: "Prix de gros annoncé du méga-octet sur ce tronçon, contre le tarif pratiqué par liaison satellite jusqu'ici",
        source: "Ogooué Fibre",
      },
      {
        type: "heading",
        level: 2,
        text: "Quel effet sur la facture des ménages",
      },
      {
        type: "paragraph",
        text: "Reste à savoir si cette baisse du prix de gros se retrouvera dans la facture des abonnés. Les opérateurs de téléphonie mobile, qui louent la capacité du backbone plutôt que de poser leurs propres câbles, fixent librement leurs tarifs de détail en fonction de leurs propres coûts commerciaux et de leurs marges.",
      },
      {
        type: "quote",
        text: "Un prix de gros divisé par deux ne se traduit pas mécaniquement par une baisse équivalente pour l'abonné. Une partie de l'écart sert à financer le dernier kilomètre, souvent le plus coûteux, en particulier dans les zones peu denses.",
        attribution: "Sylvie Mintsa, consultante en télécommunications",
      },
      {
        type: "paragraph",
        text: "En attendant un éventuel effet sur les prix, l'arrivée de la fibre profite d'abord aux administrations, aux hôpitaux et aux établissements scolaires de Franceville et de Moanda, jusqu'ici dépendants de connexions satellitaires plus lentes, plus coûteuses et sensibles aux intempéries, en particulier pendant la saison des pluies, lorsque le signal satellite se dégrade fortement.",
      },
      {
        type: "paragraph",
        text: "Ogooué Fibre annonce une extension vers Lékoni et la frontière congolaise d'ici deux ans, avec l'ambition affichée de connecter l'ensemble des chefs-lieux de province. L'entreprise discute également avec des opérateurs voisins d'une interconnexion transfrontalière, qui permettrait de sécuriser le trafic national en cas de coupure sur les câbles sous-marins de la côte atlantique.",
      },
    ],
  },
  {
    slug: "editorial-diversifier-vraiment",
    title: "Diversifier, vraiment",
    dek: "Depuis quinze ans, chaque plan promet de diversifier l'économie gabonaise. Notre rédactrice en chef explique pourquoi seule la part des recettes non pétrolières permet de juger ces promesses.",
    categorySlug: "editorial",
    authorSlug: "nadia-ondo",
    heroMediaKey: "libreville-centre",
    keyPoints: [
      "La rédaction défend un seul indicateur crédible : la part des recettes de l'État qui ne provient ni du pétrole ni des mines.",
      "Cette part reste proche de 42 %, quasiment stable depuis dix ans, malgré la succession des plans de diversification.",
      "Le journal s'engage à publier chaque année quelques indicateurs simples plutôt que de relayer de nouvelles annonces.",
    ],
    seo: {
      description: "Éditorial : la diversification de l'économie gabonaise ne se mesure pas aux plans annoncés, mais à la part des recettes non pétrolières.",
      keywords: [
        "diversification économique Gabon",
        "éditorial",
        "recettes non pétrolières",
        "politique économique",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "diversification",
      "gabon",
      "economie",
      "recettes-publiques",
      "editorial",
    ],
    daysAgo: 2,
    views: 1900,
    body: [
      {
        type: "paragraph",
        text: "Diversifier l'économie. La formule revient dans tous les discours de politique économique depuis quinze ans, quel que soit le gouvernement en exercice, quel que soit le prix du baril ce jour-là. Elle a fini par perdre son sens à force d'être répétée sans être mesurée, au point de devenir une figure de style plutôt qu'un objectif vérifiable.",
      },
      {
        type: "paragraph",
        text: "Nous le disons sans détour, au risque de déplaire à qui préfère les formules aux chiffres : la diversification ne se décrète pas dans un plan quinquennal, ni dans un discours de rentrée solennel. Elle se mesure, chaque année, à une seule question simple. Quelle part des recettes de l'État provient d'autre chose que le pétrole et les mines ?",
      },
      {
        type: "heading",
        level: 2,
        text: "Le compteur ne bouge pas",
      },
      {
        type: "paragraph",
        text: "La réponse est connue, et elle est inconfortable. Les hydrocarbures et les mines fournissent encore un peu plus de 42 % des recettes totales de l'État, une proportion presque inchangée depuis dix ans, malgré trois cycles complets de hausse et de baisse du cours du baril. Les cycles font varier ce chiffre de quelques points d'une année sur l'autre, mais la tendance de fond, elle, ne bouge pas.",
      },
      {
        type: "paragraph",
        text: "Pendant ce temps, les plans de diversification se sont succédé, chacun avec son sigle et son « horizon 2030 », chacun listant, presque dans le même ordre, les mêmes secteurs prioritaires : agro-industrie, tourisme, économie numérique, bois transformé. Les intentions ne manquent pas, ni les études de cabinets internationaux commandées pour les étayer. Ce sont les résultats mesurés, année après année, qui font défaut.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que racontent nos propres pages",
      },
      {
        type: "paragraph",
        text: "Il suffit de lire les pages qui précèdent celle-ci. Un entrepreneur qui crée sa société en 72 heures mais patiente douze jours de plus pour ouvrir un compte bancaire. Une usine de transformation agricole qui met quatre ans à réunir un financement que les banques jugent trop risqué, alors même que le produit qu'elle fabrique est importé chaque année pour plusieurs milliards de FCFA. Ce sont ces détails, et non les grands discours, qui décident si un pays diversifie ou se contente d'en parler.",
      },
      {
        type: "paragraph",
        text: "Même le premier centre de données du pays, présenté comme une avancée pour la souveraineté numérique, bute sur une question triviale : la disponibilité de l'électricité. On ne construit pas une économie de services sur un réseau qui coupe, pas plus qu'on n'attire des investisseurs étrangers avec des promesses qu'aucun indicateur ne vient corroborer.",
      },
      {
        type: "quote",
        text: "On ne diversifie pas une économie par décret. On la diversifie foncier par foncier, crédit par crédit, kilowatt par kilowatt. Le reste n'est que communication.",
        attribution: "Nadia Ondo",
      },
      {
        type: "heading",
        level: 2,
        text: "Mesurer, pas annoncer",
      },
      {
        type: "paragraph",
        text: "Ce que nous proposons n'a rien d'original : traquer, année après année, une poignée d'indicateurs simples plutôt que le nombre de plans signés ou de forums organisés. L'évolution de la part non pétrolière dans les recettes de l'État. Le nombre d'entreprises formalisées qui survivent au-delà de trois ans d'existence. Le volume de crédit bancaire réellement accordé au secteur agro-industriel, et non les seules annonces de lignes de financement.",
      },
      {
        type: "paragraph",
        text: "Ce numéro n'est pas à charge, et ce n'est pas non plus un exercice de complaisance. Le guichet unique de Libreville, la première usine d'amidon de manioc, la fibre optique qui atteint Franceville : ce sont des progrès réels, obtenus par des gens qui ont fait le travail plutôt que le discours, souvent avec des moyens plus modestes que ceux annoncés dans les grands plans. Mais leur addition reste, pour l'instant, marginale à l'échelle du budget de l'État.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "La part des recettes non pétrolières dans le budget de l'État, suivie chaque année sans exception",
          "Le taux de survie à trois ans des entreprises nouvellement formalisées, secteur par secteur",
          "Le volume de crédit bancaire effectivement accordé aux filières agro-industrielles et manufacturières",
        ],
      },
      {
        type: "paragraph",
        text: "On objectera que le Gabon n'est pas seul à affronter ce dilemme, que la dépendance aux matières premières touche la plupart des économies de la sous-région, et que les cours mondiaux échappent à toute décision nationale. C'est vrai, et cela ne change rien à l'essentiel : les pays qui ont fait bouger leur part de recettes non pétrolières, ailleurs dans le monde, l'ont fait en corrigeant patiemment leurs propres obstacles internes, pas en attendant que les cours du baril leur rendent service.",
      },
      {
        type: "paragraph",
        text: "Rien de tout cela ne se règle en un exercice budgétaire, ni même en une législature. La diversification est affaire de dix ans, pas de dix-huit mois, et nous n'écrirons pas l'inverse pour faire plaisir à qui que ce soit, ni pour vendre plus de numéros.",
      },
      {
        type: "paragraph",
        text: "Mais dix ans, cela se compte, année par année, chiffre par chiffre. Nous prenons l'engagement de publier, chaque année, ces quelques indicateurs, qu'ils soient bons ou mauvais, plutôt que de nous contenter de relayer le prochain plan et son cortège de bonnes intentions.",
      },
      {
        type: "paragraph",
        text: "La diversification ne se proclame pas. Elle se lit dans une colonne de chiffres, et cette colonne, nous la tiendrons ouverte, numéro après numéro.",
      },
    ],
  },
];
