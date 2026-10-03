import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — Économie, Environnement, Espace pro, Éditorial
 * et Idées.
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_4: readonly SeedArticle[] = [
  {
    slug: "rachat-actifs-petroliers-ivindo-capital",
    title:
      "Rachat des actifs pétroliers d'Ozouri Petroleum : ce que change l'entrée de l'État au capital",
    dek: "Ivindo Capital, consortium public-privé, prend 40 % du capital d'Ozouri Petroleum et de ses champs matures. Recettes de l'État, sous-traitants locaux, gouvernance : ce que révèle ce rachat.",
    categorySlug: "economie",
    subCategorySlug: "mines-energie",
    authorSlug: "serge-boussougou",
    heroMediaKey: "petrole-offshore",
    galleryMediaKeys: ["port-gentil"],
    keyPoints: [
      "Un consortium associant l'État et des investisseurs privés régionaux prend pied dans l'amont pétrolier gabonais.",
      "L'opération doit apporter des recettes fiscales supplémentaires, sans certitude sur le rythme des versements.",
      "Les sous-traitants locaux réclament des engagements écrits sur les volumes de contrats à venir.",
    ],
    seo: {
      description:
        "Rachat des actifs d'Ozouri Petroleum par Ivindo Capital : effets attendus sur les recettes de l'État, les sous-traitants et la gouvernance.",
      keywords: [
        "pétrole Gabon",
        "Ivindo Capital",
        "Ozouri Petroleum",
        "rachat actifs pétroliers",
        "contenu local",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: ["petrole", "gabon", "investissement", "energie", "secteur-public"],
    daysAgo: 2,
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
        label:
          "Montant de la prise de participation de Ivindo Capital dans Ozouri Petroleum",
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
        text: "Nous n'achetons pas seulement des barils, nous achetons *une place à la table* où se décident les investissements des dix prochaines années. C'est un changement de posture pour l'État, qui devient partie prenante plutôt que simple percepteur de redevances.",
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
        attribution:
          "Léa Nzoghe, économiste spécialiste des industries extractives",
      },
      {
        type: "paragraph",
        text: "Le dossier a été transmis à l'Autorité de la concurrence la semaine dernière, pour un examen dont la durée réglementaire ne peut excéder deux mois. Les deux parties visent une clôture de l'opération avant la fin de l'année civile, sous réserve du calendrier réglementaire et de l'obtention des financements complémentaires nécessaires au programme d'investissement annoncé.",
      },
      {
        type: "paragraph",
        text: "D'autres opérateurs indépendants, confrontés au même vieillissement de leurs champs, suivront de près l'issue de ce dossier : il pourrait servir de modèle, ou de repoussoir, aux prochaines discussions entre l'État et le secteur pétrolier privé. Dans un pays où le pétrole pèse encore près de 40 % du PIB, la manière dont l'État choisit d'intervenir dans le capital des opérateurs n'est jamais un sujet purement financier. D'autres dossiers du même type sont réunis dans notre rubrique [Mines & énergie](/rubrique/economie/mines-energie).",
      },
    ],
  },
  {
    slug: "dossier-apres-le-petrole-trois-piliers-diversification",
    title:
      "Après le pétrole : enquête sur les trois piliers de la diversification",
    dek: "Le pétrole finance encore un tiers du budget de l'État. Bois transformé, agro-industrie, services numériques : trois filières sont annoncées comme le relais de croissance. Enquête sur leurs limites réelles.",
    categorySlug: "economie",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "libreville-baie",
    galleryMediaKeys: [
      "libreville-boulevard",
      "agriculture-plantation",
      "energie-solaire",
    ],
    keyPoints: [
      "Le bois transformé se heurte à des coûts d'énergie et de transport encore mal maîtrisés.",
      "L'agro-industrie promet de réduire la facture alimentaire, mais bute sur le foncier et les volumes.",
      "Les services numériques dépendent d'une électricité fiable, disponible surtout autour de Libreville.",
    ],
    seo: {
      description:
        "Bois transformé, agro-industrie, services numériques : enquête sur les trois piliers censés relayer le pétrole dans l'économie gabonaise.",
      keywords: [
        "diversification économique",
        "Gabon",
        "bois transformé",
        "agro-industrie",
        "économie numérique",
      ],
    },
    origin: "redaction",
    feature: "dossier",
    tags: ["diversification", "petrole", "bois", "agro-industrie", "numerique"],
    daysAgo: 3,
    views: 3850,
    body: [
      {
        type: "paragraph",
        text: "Le pétrole finance encore près d'un tiers du budget de l'État gabonais. Cette dépendance, ancienne, redevient un sujet central à mesure que les champs matures produisent moins et que les cours mondiaux restent instables. Les pouvoirs publics répètent depuis des années l'objectif d'une économie diversifiée, capable d'encaisser un choc pétrolier sans que l'ensemble du budget vacille, dans un pays dont le produit intérieur brut avoisine 12 000 milliards de FCFA pour environ 2,4 millions d'habitants. Trois filières sont aujourd'hui présentées comme les relais les plus crédibles de cette transition : le bois transformé, l'agro-industrie et les services liés au numérique. Encore faut-il vérifier ce que ces trois piliers portent réellement, au-delà de l'intention affichée dans les discours officiels. Ce dossier examine, filière par filière, ce qui relève du plan solide et ce qui reste, pour l'instant, de l'ordre de la promesse.",
      },
      {
        type: "stat",
        value: "≈ 33 %",
        label:
          "Part estimée des recettes pétrolières dans les recettes publiques",
        source: "Ordre de grandeur, documents budgétaires",
      },
      {
        type: "paragraph",
        text: "Sur le papier, l'ambition ne date pas d'hier. Elle s'est traduite par étapes successives : interdiction d'exporter les grumes non transformées au début des années 2010, incitations fiscales pour l'agro-industrie au cours de la décennie suivante, puis, plus récemment, une politique volontariste pour les services numériques et les métiers du bureau. [Nos analyses des finances publiques](/rubrique/economie/finances-publiques) montrent par ailleurs à quel point la trésorerie des entreprises reste sensible aux cycles pétroliers, bien après que la matière première a quitté le pays. La diversification n'est donc pas un supplément d'âme réservé aux discours de fin d'année : elle conditionne directement la capacité du pays à amortir le prochain choc, quelle que soit sa date d'arrivée. Chacune de ces étapes a d'ailleurs suscité son lot de scepticisme, avant de porter ses fruits plus lentement que ne l'espéraient ses promoteurs.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Bois transformé : passer de la grume brute exportée au meuble et au contreplaqué finis sur place.",
          "Agro-industrie : réduire la facture d'importations alimentaires par la production locale de vivres et de rente.",
          "Services et numérique : construire une économie de bureau, de données et de compétences, indépendante du sous-sol.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Le pari du bois transformé",
      },
      {
        type: "paragraph",
        text: "La filière bois reste la plus ancienne des trois. Depuis l'interdiction d'exporter des grumes non transformées, les scieries et les unités de déroulage se sont multipliées en périphérie de Libreville et le long des axes qui mènent vers les ports. Okoumé Industries y exploite une unité de contreplaqué qui emploie plusieurs centaines de salariés et vise les marchés européen et nord-africain pour ses panneaux. L'entreprise affirme avoir doublé sa capacité de production en cinq ans, portée par une demande extérieure pour un bois tropical certifié. La concurrence reste vive face aux producteurs d'Asie du Sud-Est, dont le fret vers l'Europe coûte moins cher, ce qui pousse les transformateurs gabonais à se positionner sur des essences plus rares et mieux valorisées plutôt que sur les gros volumes standardisés.",
      },
      {
        type: "quote",
        text: "Nous ne sommes plus des exportateurs de grumes. Nous vendons *du panneau fini*, avec une marque et un service après-vente.",
        attribution: "Thierry Bouka, directeur général d'Okoumé Industries",
      },
      {
        type: "paragraph",
        text: "L'équation reste fragile. Le coût de l'énergie industrielle pèse sur la compétitivité des scieries, tout comme le transport routier vers les ports d'exportation. La main-d'œuvre qualifiée — opérateurs de machines, techniciens de maintenance — manque encore, et la filière importe une partie de son encadrement technique depuis l'étranger. Les industriels du secteur reconnaissent qu'un choc électrique ou une hausse du fret suffirait à rogner des marges déjà étroites. Plusieurs transformateurs évoquent aussi la difficulté d'obtenir des financements bancaires à long terme, les banques locales privilégiant des échéances plus courtes que celles qu'exige un outil industriel lourd.",
      },
      {
        type: "heading",
        level: 2,
        text: "L'agro-industrie cherche ses volumes",
      },
      {
        type: "paragraph",
        text: "Le Gabon importe l'essentiel de ce qu'il consomme au quotidien : riz, huile, volaille, une partie des légumes frais vendus dans les marchés urbains. L'agro-industrie est censée inverser cette tendance, année après année. Ivindo Agro-Industries a mis en culture plusieurs milliers d'hectares de palmier à huile et de manioc dans la province de l'Ogooué, avec l'ambition déclarée de réduire sensiblement les importations alimentaires du pays d'ici la fin de la décennie. L'entreprise emploie une main-d'œuvre saisonnière nombreuse, recrutée dans les villages voisins de ses plantations. D'autres exploitants, de taille plus modeste, misent plutôt sur le maraîchage périurbain pour approvisionner directement les marchés de Libreville, avec des cycles de production plus courts que ceux du palmier à huile.",
      },
      {
        type: "image",
        mediaKey: "agriculture-plantation",
        caption:
          "Une plantation vivrière en périphérie rurale. L'agro-industrie mise sur les cultures de rente et les vivres.",
      },
      {
        type: "stat",
        value: "≈ 60 %",
        label:
          "Part estimée des produits alimentaires consommés couverte par les importations",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Les volumes annoncés se heurtent à des obstacles connus : régime foncier peu lisible, concurrence pour l'eau et les routes rurales, coût du transport entre les zones de production et les marchés urbains. Les petits exploitants craignent aussi d'être marginalisés par l'arrivée de grandes concessions, faute d'un accompagnement suffisant pour intégrer les mêmes filières d'approvisionnement et les mêmes circuits de distribution. L'accès au crédit agricole reste, de leur point de vue, un frein comparable : la plupart des banques classent encore l'agro-industrie parmi les secteurs à risque élevé, faute d'un historique de remboursement suffisant.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le pari des services numériques",
      },
      {
        type: "paragraph",
        text: "Le troisième pilier ne se voit pas depuis la route : il s'agit de bureaux, de centres d'appels, de services financiers et de plateformes numériques. Estuaire Numérique, jeune entreprise de services informatiques installée à Libreville, forme des développeurs et exporte des prestations de programmation vers plusieurs pays de la sous-région. Le paiement mobile progresse également, porté par une clientèle jeune et de plus en plus connectée, au point de concurrencer les guichets bancaires classiques pour les opérations courantes. Plusieurs incubateurs privés accompagnent désormais de jeunes entreprises technologiques, avec un succès inégal : certaines peinent à trouver des clients au-delà d'un marché intérieur encore étroit.",
      },
      {
        type: "image",
        mediaKey: "energie-solaire",
        caption:
          "Une installation solaire d'appoint. L'essor du numérique dépend d'abord d'une électricité disponible en continu.",
      },
      {
        type: "paragraph",
        text: "Cette économie de services suppose une électricité fiable et une connexion stable, deux conditions encore inégalement remplies hors de la capitale. Akanda Energy, opérateur d'une centrale solaire d'appoint, alimente une partie des besoins des centres de données de la place, mais les délestages restent fréquents dans les villes secondaires. La filière numérique gagne aussi du terrain sur un vivier de compétences encore limité, ce qui alimente une concurrence salariale entre employeurs locaux et pousse certains jeunes diplômés à tenter leur chance à l'étranger.",
      },
      {
        type: "quote",
        text: "Trois filières ne remplaceront pas le pétrole en une décennie. Elles peuvent, si l'exécution suit, réduire la part du choc que l'économie encaisse à chaque baisse des cours.",
        attribution: "Léa Nzoghe, économiste",
      },
      {
        type: "paragraph",
        text: "Les trois piliers partagent un même point faible : ils demandent du temps et du capital patient, deux ressources rares dans un cycle budgétaire annuel. Ils partagent aussi un point commun plus encourageant, celui de ne pas dépendre d'un seul cours mondial pour exister. Ils partagent enfin un risque plus discret : celui d'être annoncés avec davantage d'emphase que de moyens budgétaires réellement engagés.",
      },
      {
        type: "paragraph",
        text: "Aucun des trois piliers ne suffira seul. Pris ensemble, sur une décennie plutôt qu'un mandat, ils dessinent une trajectoire plausible plutôt qu'une martingale. C'est aussi, plus prosaïquement, ce que mesureront les prochains budgets : la part du hors-pétrole dans les recettes de l'État.",
      },
    ],
  },
  {
    slug: "manganese-capacite-evacuation-owendo",
    title:
      "Manganèse : 1 200 milliards de FCFA pour doubler la capacité d'évacuation",
    dek: "Un financement de 1 200 milliards de FCFA doit doubler, en trois ans, la capacité d'évacuation du manganèse gabonais entre les mines du Haut-Ogooué et le terminal d'Owendo, voie ferrée comprise.",
    categorySlug: "economie",
    subCategorySlug: "mines-energie",
    authorSlug: "serge-boussougou",
    heroMediaKey: "manganese-mine",
    galleryMediaKeys: ["port-owendo", "transgabonais"],
    keyPoints: [
      "Le financement, réparti entre un nouveau terminal à Owendo et le renforcement de la voie ferrée, doit doubler les volumes exportés.",
      "La voie ferrée, aujourd'hui saturée sur certains tronçons, conditionne la pleine utilisation du futur terminal minéralier.",
      "Les entreprises gabonaises de génie civil sont associées aux travaux, avec un volet formation aux métiers ferroviaires.",
    ],
    seo: {
      description:
        "Terminal minéralier et voie ferrée : comment un financement de 1 200 milliards de FCFA doit doubler les exportations gabonaises de manganèse.",
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
    tags: ["manganese", "gabon", "logistique", "infrastructure"],
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
        label:
          "Capacité d'évacuation annuelle visée à Owendo, contre 6 millions de tonnes aujourd'hui",
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
        attribution:
          "Hervé Mabicka, directeur logistique d'Estuaire Logistique",
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
    title:
      "Créer son entreprise à Libreville : le guichet unique ramène le délai à 72 heures",
    dek: "À Libreville, le guichet unique de création d'entreprise annonce un délai moyen de 72 heures, contre trois semaines auparavant. Reste à simplifier l'ouverture d'un compte bancaire et l'accès au foncier.",
    categorySlug: "economie",
    subCategorySlug: "entreprises",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "administration-gabon",
    galleryMediaKeys: ["documents-bureau"],
    keyPoints: [
      "Le guichet unique regroupe sept formalités en un seul dossier et ramène la création d'entreprise à 72 heures en moyenne.",
      "Compte bancaire professionnel et titre foncier restent les principaux points de blocage une fois l'entreprise immatriculée.",
      "Plus de 3 200 entreprises ont été enregistrées depuis l'ouverture du dispositif, avant son extension prévue à deux autres villes.",
    ],
    seo: {
      description:
        "Création d'entreprise à Libreville : le guichet unique promet 72 heures, mais compte bancaire et foncier restent des obstacles.",
      keywords: [
        "guichet unique Gabon",
        "créer une entreprise Libreville",
        "entrepreneuriat Gabon",
        "formalités administratives",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["entrepreneuriat", "gabon", "administration", "pme"],
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
        label:
          "Délai moyen annoncé pour un dossier complet, contre trois semaines avant la réforme",
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
        text: "Le dispositif doit être étendu à Port-Gentil et Franceville d'ici la fin de l'année, avec un objectif affiché : ramener, à terme, l'ensemble des formalités à un dossier numérique unique, consultable en ligne. D'autres initiatives comparables sont recensées dans notre rubrique [Entreprises](/rubrique/economie/entreprises), où plusieurs entrepreneurs racontent leur propre parcours administratif.",
      },
    ],
  },
  {
    slug: "premier-centre-donnees-tier-iii-gabon",
    title: "Le Gabon inaugure son premier centre de données de niveau Tier III",
    dek: "À Akanda, le premier centre de données certifié Tier III du Gabon promet des temps de réponse bien plus courts pour les entreprises locales, au prix d'une consommation électrique déjà surveillée par son exploitant.",
    categorySlug: "economie",
    subCategorySlug: "numerique",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "centre-donnees",
    keyPoints: [
      "Le pays dispose d'un centre de données certifié Tier III, une alternative à l'hébergement à l'étranger pour les grands comptes gabonais.",
      "Le rapatriement des données réduit fortement les temps de réponse, mais la consommation électrique reste un point de vigilance.",
      "Banques, opérateurs télécoms et administrations sont les premiers clients visés, portés par l'exigence de conservation locale des données.",
    ],
    seo: {
      description:
        "Centre de données Tier III à Akanda : latence réduite pour les entreprises gabonaises, mais la consommation électrique reste un défi.",
      keywords: [
        "centre de données Gabon",
        "Tier III",
        "souveraineté numérique",
        "hébergement Akanda",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["technologie", "gabon", "numerique", "infrastructure"],
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
        label:
          "Temps de réponse pour un utilisateur connecté depuis Libreville, avant et après le rapatriement d'une application, selon l'exploitant",
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
        attribution:
          "Fabrice Ogandaga, directeur technique d'Estuaire Numérique",
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
    slug: "littoral-gabonais-facade-economique-sous-pression",
    title: "Le littoral gabonais, façade économique sous pression",
    dek: "Sur huit cents kilomètres de côte, le Gabon concentre son économie et ses tensions : érosion, pêche industrielle contre pêche artisanale, pression immobilière sur le front de mer, extension portuaire. Un littoral de plus en plus disputé.",
    categorySlug: "environnement",
    authorSlug: "serge-boussougou",
    heroMediaKey: "peche-artisanale",
    keyPoints: [
      "La pêche artisanale et la pêche industrielle se disputent des zones côtières mal contrôlées.",
      "La pression immobilière réduit l'accès public au bord de mer dans les quartiers urbains.",
      "L'extension du port modifie les courants et déplace certaines zones traditionnelles de pêche.",
    ],
    seo: {
      description:
        "Érosion, pêche artisanale contre pêche industrielle, pression foncière, extension portuaire : enquête sur les tensions du littoral gabonais.",
      keywords: [
        "littoral",
        "érosion côtière",
        "pêche artisanale",
        "port",
        "Gabon",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["littoral", "peche", "erosion-cotiere", "port", "amenagement"],
    daysAgo: 9,
    views: 1240,
    body: [
      {
        type: "paragraph",
        text: "Sur près de huit cents kilomètres, le littoral gabonais concentre l'essentiel de l'activité économique du pays : la capitale, le premier port pétrolier, les principales bases logistiques. Cette façade est aussi la plus exposée. Érosion, urbanisation du bord de mer et concurrence pour l'espace entre pêcheurs, promoteurs et autorités portuaires redessinent, année après année, un trait de côte que l'on croyait stable.",
      },
      {
        type: "stat",
        value: "≈ 800 km",
        label: "Longueur du littoral gabonais exposé à l'érosion côtière",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "heading",
        level: 2,
        text: "Deux pêches pour un même lagon",
      },
      {
        type: "paragraph",
        text: "La pêche artisanale, pratiquée depuis des pirogues à moteur, fait vivre plusieurs dizaines de milliers de familles le long du littoral. Elle cohabite, parfois mal, avec des navires industriels qui ciblent les mêmes espèces plus au large. Les pêcheurs artisanaux dénoncent des zones de pêche exclusives mal respectées ; les armateurs industriels rappellent qu'ils emploient des équipages locaux et alimentent l'essentiel des volumes exportés vers les marchés régionaux.",
      },
      {
        type: "quote",
        text: "Nos pirogues ne peuvent pas suivre les chalutiers au large. Quand ils pêchent trop près de la côte, ce sont *nos filets qui reviennent vides*.",
        attribution:
          "Étienne Mavoungou, président d'une coopérative de pêcheurs artisanaux",
      },
      {
        type: "paragraph",
        text: "Les industriels de la pêche renvoient à leur poids économique : Atlantique Pêche Gabon revendique plusieurs centaines d'emplois directs et une part significative des exportations halieutiques du pays. La coexistence des deux pêches suppose, selon les administrations concernées, un meilleur contrôle des zones réservées à la pêche artisanale, plus qu'un arbitrage brutal en faveur de l'une ou de l'autre.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le foncier du bord de mer",
      },
      {
        type: "paragraph",
        text: "En ville, le bord de mer attire les promoteurs hôteliers et résidentiels, qui achètent ou négocient des parcelles autrefois occupées par des quartiers de pêcheurs ou des terrains publics non aménagés. Cette pression foncière change progressivement le visage du littoral urbain : moins d'accès public direct à la plage, davantage d'enceintes privées et de résidences fermées.",
      },
      {
        type: "paragraph",
        text: "L'érosion complique encore l'équation. Plusieurs quartiers côtiers ont dû composer avec le recul du trait de côte, qui fragilise les fondations construites trop près de l'eau et pousse certains riverains à demander des digues ou des enrochements, financés tantôt par la puissance publique, tantôt par les riverains eux-mêmes.",
      },
      {
        type: "paragraph",
        text: "Le port, de son côté, poursuit son extension. Estuaire Logistique, qui exploite plusieurs terminaux, a dragué de nouveaux chenaux pour accueillir des navires plus profonds. Ces travaux modifient localement les courants et, selon des pêcheurs riverains, éloignent certains bancs de poissons des zones traditionnelles de pêche côtière.",
      },
      {
        type: "paragraph",
        text: "Aucun de ces dossiers — pêche, foncier, érosion, port — ne se traite isolément : ils se jouent sur le même trait de côte, avec des acteurs qui n'ont ni le même horizon de temps, ni le même rapport de force. Le littoral restera, pour l'économie gabonaise, un actif précieux et de plus en plus disputé.",
      },
    ],
  },
  {
    slug: "solaire-120-mw-owendo-port-gentil",
    title: "Solaire : 120 MW attribués à Owendo et Port-Gentil",
    dek: "Deux centrales photovoltaïques totalisant 120 MW doivent alimenter Owendo et Port-Gentil d'ici 2027. L'électricité solaire promet un mix plus diversifié, mais le raccordement au réseau reste un chantier à part entière.",
    categorySlug: "environnement",
    authorSlug: "serge-boussougou",
    heroMediaKey: "energie-solaire",
    keyPoints: [
      "Deux consortiums, Akanda Energy et Ogooué Solaire, ont remporté l'appel d'offres pour deux centrales solaires de 70 et 50 mégawatts.",
      "Le tarif d'achat négocié, environ 68 FCFA le kilowattheure, serait inférieur à celui des centrales thermiques d'appoint utilisées en pointe.",
      "Le raccordement des deux sites au réseau existant nécessite des renforcements dont le financement complet n'est pas encore bouclé.",
    ],
    seo: {
      description:
        "Deux centrales solaires de 120 mégawatts doivent alimenter Owendo et Port-Gentil, avec un effet attendu sur les coûts, mais un raccordement encore incertain.",
      keywords: [
        "énergie solaire",
        "électricité Gabon",
        "Owendo",
        "Port-Gentil",
        "mix énergétique",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["energie-solaire", "electricite", "innovation", "industrie"],
    daysAgo: 14,
    views: 2350,
    body: [
      {
        type: "paragraph",
        text: "Deux centrales photovoltaïques, totalisant 120 mégawatts, doivent voir le jour près d'Owendo et de Port-Gentil d'ici 2027. Les autorités gabonaises ont attribué les deux projets à l'issue d'un appel d'offres international lancé en 2022, auquel une dizaine de consortiums avaient répondu. Le calendrier initial prévoyait une attribution un an plus tôt, retardée par plusieurs recours administratifs.",
      },
      {
        type: "paragraph",
        text: "L'électricité gabonaise dépend aujourd'hui largement de l'hydroélectricité, complétée par des centrales thermiques mobilisées en période de pointe ou d'étiage, lorsque le débit des fleuves baisse. Le solaire reste, pour l'instant, marginal dans ce mix, avec une poignée d'installations de petite taille déjà en service. Quelques toitures d'administrations publiques accueillent déjà des panneaux, mais à une échelle sans commune mesure avec les deux projets annoncés.",
      },
      {
        type: "heading",
        level: 2,
        text: "Diversifier le mix électrique",
      },
      {
        type: "paragraph",
        text: "À Owendo, le consortium **Akanda Energy** doit construire une centrale de 70 mégawatts sur un terrain proche de la zone industrielle. À Port-Gentil, Ogooué Solaire est chargé d'une installation de 50 mégawatts, pensée pour appuyer le réseau local pendant les pics de consommation. La mise en service des deux sites est annoncée pour 2027. Les deux sites occuperont plusieurs dizaines d'hectares chacun, sur des terrains déjà identifiés par les autorités locales.",
      },
      {
        type: "quote",
        text: "« Ces deux centrales ne remplaceront pas l'hydroélectricité, elles la soulagent quand les rivières baissent. »",
        attribution: "Carine Obame, directrice générale d'Akanda Energy",
      },
      {
        type: "stat",
        value: "68 FCFA",
        label:
          "tarif d'achat négocié par kilowattheure solaire, contre plus de 90 FCFA pour l'appoint thermique",
        source: "Akanda Energy",
      },
      {
        type: "heading",
        level: 2,
        text: "Un effet attendu sur les coûts",
      },
      {
        type: "paragraph",
        text: "Les industriels installés autour d'Owendo, premiers consommateurs d'électricité du pays avec les zones portuaires, espèrent une facture allégée aux heures où le solaire tourne à plein régime. Certains évoquent une part du solaire pouvant atteindre 4 % du mix électrique national d'ici 2028. Rien n'est cependant garanti avant la mise en service effective des deux centrales. Les tarifs industriels actuels varient sensiblement selon les zones et les niveaux de consommation, ce qui complique toute promesse chiffrée uniforme.",
      },
      {
        type: "paragraph",
        text: "Les deux consortiums doivent encore finaliser le financement des équipements de stockage nécessaires pour lisser la production en cas de nuages persistants. Ce volet, moins médiatisé que la puissance annoncée, conditionne en partie la fiabilité réelle des deux centrales. Sans stockage suffisant, la production chute au coucher du soleil, au moment même où une partie de la demande industrielle reste élevée.",
      },
      {
        type: "paragraph",
        text: "Le raccordement des deux centrales au réseau existant reste le point le plus incertain du projet. Les lignes actuelles doivent être renforcées pour absorber une production intermittente, sans que le financement de ces travaux soit entièrement bouclé, selon les deux porteurs de projet. Aucun calendrier précis de renforcement du réseau n'a pour l'instant été rendu public.",
      },
      {
        type: "quote",
        text: "« On sait construire une centrale. Le plus dur, c'est souvent le dernier kilomètre de câble. »",
        attribution: "Carine Obame",
      },
      {
        type: "paragraph",
        text: "La mise en service reste conditionnée à l'avancement de ces travaux de raccordement. Les deux consortiums assurent qu'ils tiendront le calendrier de 2027, sans lever toutes les incertitudes qui pèsent sur les infrastructures existantes, ni sur le rythme des décaissements attendus des bailleurs. D'ici la mise en service, le mix électrique gabonais continuera de reposer, comme aujourd'hui, sur l'hydroélectricité et l'appoint thermique.",
      },
    ],
  },
  {
    slug: "nouveau-code-investissements-six-changements",
    title: "Nouveau code des investissements : les six changements à connaître",
    dek: "Seuils d’agrément relevés, avantages fiscaux resserrés, contenu local renforcé : le texte redessine les règles du jeu pour les investisseurs installés au Gabon, avec plusieurs points encore en suspens.",
    categorySlug: "espace-pro",
    subCategorySlug: "reglementations",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "documents-bureau",
    keyPoints: [
      "Le régime particulier n’est plus accessible aux petits projets : les seuils d’investissement minimal ont été relevés par secteur.",
      "Les exonérations fiscales sont désormais dégressives et limitées dans le temps, contre une durée fixe identique auparavant.",
      "Un guichet unique aux compétences élargies et un recours mieux balisé doivent raccourcir les délais d’instruction des dossiers.",
    ],
    seo: {
      title: "Code des investissements : les six changements",
      description:
        "Seuils d’agrément, fiscalité, contenu local, guichet unique, recours, clause de sauvegarde : ce que change le nouveau code des investissements.",
      keywords: [
        "code des investissements",
        "fiscalité",
        "contenu local",
        "Gabon",
        "réglementation",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "code-investissements",
      "fiscalite",
      "reglementation",
      "contenu-local",
      "gabon",
    ],
    daysAgo: 5,
    views: 3180,
    body: [
      {
        type: "paragraph",
        text: "Le nouveau code des investissements est entré en vigueur ce mois-ci, au terme de plusieurs années de discussions entre l’administration et les organisations patronales. Le texte remplace un dispositif jugé trop uniforme par un régime plus sélectif, pensé pour orienter les capitaux vers les secteurs jugés prioritaires et limiter les effets d’aubaine constatés sous l’ancien régime. Six évolutions concentrent l’essentiel des changements pratiques pour les entreprises déjà installées comme pour les porteurs de projets qui préparent un dossier d’agrément. Les professionnels du droit des affaires anticipent déjà une vague de demandes de renouvellement anticipé, le temps que les acteurs déjà installés arbitrent entre les deux régimes.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Des seuils d’agrément relevés pour accéder au régime particulier",
          "Une durée des avantages fiscaux raccourcie et rendue dégressive",
          "Une obligation de contenu local renforcée dans plusieurs secteurs",
          "Un guichet unique aux compétences élargies",
          "Un droit de recours mieux balisé en cas de refus",
          "Une clause de sauvegarde qui autorise une suspension temporaire des avantages",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Seuils d’agrément relevés",
      },
      {
        type: "paragraph",
        text: "Pour bénéficier du régime particulier, un projet devait jusqu’ici justifier d’un investissement minimal modeste, ce qui ouvrait le dispositif à un grand nombre de petites structures. Le nouveau texte relève ce plancher et l’indexe sur le secteur d’activité : le seuil passe à trois cents millions de FCFA pour les services, contre cent millions auparavant, et à sept cents millions de FCFA pour l’industrie et les mines. Les petites structures, notamment dans les services, se retrouvent de fait orientées vers le régime de droit commun, moins avantageux mais aussi moins contraignant en matière de justificatifs et de suivi administratif.",
      },
      {
        type: "heading",
        level: 2,
        text: "Avantages fiscaux resserrés",
      },
      {
        type: "paragraph",
        text: "L’exonération d’impôt sur les sociétés n’est plus accordée pour une durée fixe identique à tous les projets, quel que soit leur secteur ou leur rentabilité. Elle devient dégressive : taux plein les premières années, puis réduction progressive jusqu’à l’extinction complète de l’avantage. L’objectif affiché par l’administration est d’éviter les effets d’aubaine constatés sur des projets déjà rentables, qui continuaient de bénéficier d’une exonération totale plusieurs années après leur mise en exploitation, sans que l’avantage fiscal ne conditionne plus aucune décision d’investissement.",
      },
      {
        type: "heading",
        level: 3,
        text: "Contenu local renforcé",
      },
      {
        type: "paragraph",
        text: "La part des biens et des services que l’investisseur doit se procurer auprès de fournisseurs installés au Gabon devient une condition de maintien des avantages accordés, et non plus une simple recommandation figurant dans la convention d’établissement. Le taux exigé varie selon les filières, avec un traitement plus strict pour l’extraction et la construction que pour les services, où l’offre locale qualifiée reste plus limitée. Le non-respect de ce taux, constaté lors du contrôle annuel, peut désormais justifier à lui seul un retrait partiel des avantages.",
      },
      {
        type: "stat",
        value: "35 %",
        label:
          "Part minimale de sous-traitance locale exigée dans les projets d’extraction, selon le nouveau texte",
        source: "Projet de code des investissements",
      },
      {
        type: "heading",
        level: 3,
        text: "Guichet unique et recours",
      },
      {
        type: "paragraph",
        text: "Le guichet chargé de l’instruction des demandes voit ses compétences élargies : il centralise désormais l’octroi de l’agrément, le suivi annuel des engagements souscrits et l’examen des demandes de renouvellement, qui relevaient auparavant de plusieurs services distincts. En cas de refus ou de retrait d’agrément, l’investisseur dispose d’un recours administratif préalable, à exercer dans un délai fixé par le texte, puis d’un recours contentieux devant la juridiction compétente s’il n’obtient pas satisfaction. Cette double voie de recours, avec des délais désormais opposables à l’administration, remplace un régime où le silence gardé sur une demande valait souvent refus tacite, sans échéance claire.",
      },
      {
        type: "quote",
        text: "« Le texte est plus exigeant à l’entrée, mais plus prévisible à l’usage : on sait enfin dans quel délai une réponse doit arriver »",
        attribution: "Mme Léa Nzoghe, avocate d’affaires",
      },
      {
        type: "heading",
        level: 3,
        text: "Clause de sauvegarde, l’exception qui inquiète",
      },
      {
        type: "paragraph",
        text: "Le texte introduit également une clause de sauvegarde, qui permet à l’État de suspendre temporairement certains avantages fiscaux en cas de choc sérieux sur les finances publiques. Les organisations patronales consultées lors de l’élaboration du texte redoutent un usage extensif de cette faculté, qui romprait la prévisibilité par ailleurs recherchée par l’ensemble de la réforme. L’administration assure de son côté qu’elle ne serait activée qu’à titre exceptionnel, pour une durée limitée et après consultation des filières concernées, sans que ces garanties figurent explicitement dans le corps du texte. Un décret d’application est annoncé pour préciser les critères déclenchant cette clause, sans calendrier ferme à ce stade.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce qui reste flou",
      },
      {
        type: "paragraph",
        text: "Plusieurs décrets d’application, notamment sur le calcul précis du taux de contenu local par filière, n’étaient pas encore publiés au moment de la rédaction de cet article. Les cabinets de conseil recommandent aux porteurs de projets de déposer leur dossier en tenant compte des deux jeux de règles, ancien et nouveau, le temps que les textes secondaires soient stabilisés. Un premier bilan d’application est promis par l’administration dans les douze mois suivant l’entrée en vigueur. Ces mêmes porteurs de projets suivront avec intérêt les [appels d’offres publics](/rubrique/espace-pro/opportunites) actuellement ouverts, eux aussi concernés par la montée en puissance des exigences de contenu local.",
      },
    ],
  },
  {
    slug: "appel-offres-quatorze-lots-rehabilitation-routiere",
    title:
      "Appel d’offres : quatorze lots de réhabilitation routière ouverts jusqu’au 30 octobre",
    dek: "Un vaste programme de réhabilitation routière ouvre quatorze lots répartis dans six provinces. Les entreprises de travaux publics ont jusqu’au 30 octobre pour déposer un dossier de candidature complet.",
    categorySlug: "espace-pro",
    subCategorySlug: "opportunites",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "logistique-camion",
    keyPoints: [
      "Les quatorze lots couvrent des linéaires de dix à quarante kilomètres, répartis entre six provinces du pays.",
      "Le dossier de candidature exige une caution provisoire, des références de chantiers comparables et une attestation bancaire.",
      "Les montants indiqués par lot restent indicatifs ; le montant définitif dépendra de l’offre financière retenue après dépouillement.",
    ],
    seo: {
      title: "Appel d’offres : 14 lots de réhabilitation routière",
      description:
        "Quatorze lots de travaux routiers, six provinces, dépôt des dossiers jusqu’au 30 octobre : critères de recevabilité et calendrier de l’appel d’offres.",
      keywords: [
        "appel d’offres",
        "travaux routiers",
        "marché public",
        "BTP Gabon",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "appel-offres",
      "travaux-publics",
      "routes",
      "marches-publics",
      "btp",
    ],
    daysAgo: 7,
    views: 1240,
    body: [
      {
        type: "paragraph",
        text: "L’autorité contractante a publié un appel d’offres portant sur la réhabilitation de quatorze tronçons routiers, pour un linéaire cumulé proche de trois cents kilomètres. Le programme se veut prioritaire pour désenclaver des zones de production agricole et forestière, encore mal reliées aux principaux axes commerciaux. Les candidatures sont attendues jusqu’au 30 octobre, cachet de dépôt faisant foi, et seuls les dossiers complets à cette date seront examinés par la commission. Les visites de site, facultatives, sont organisées à la demande auprès du service technique.",
      },
      {
        type: "heading",
        level: 2,
        text: "Quatorze lots, six provinces",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Estuaire : trois lots, dont un tronçon péri-urbain de Libreville",
          "Woleu-Ntem : deux lots reliant des zones de production de cacao",
          "Ngounié : trois lots sur l’axe reliant Mouila aux localités voisines",
          "Ogooué-Maritime : deux lots autour de Port-Gentil",
          "Nyanga et Ogooué-Lolo : quatre lots répartis sur des axes secondaires",
        ],
      },
      {
        type: "paragraph",
        text: "Chaque lot fait l’objet d’un dossier distinct, avec un délai d’exécution compris entre huit et dix-huit mois selon le linéaire concerné. Les montants communiqués par l’autorité contractante restent indicatifs : ils reposent sur une estimation administrative et non sur l’offre financière, seule à fixer le prix définitif du marché. À titre indicatif, ils vont d’environ neuf cents millions de FCFA pour le plus petit lot à un peu plus de huit milliards de FCFA pour le plus important.",
      },
      {
        type: "heading",
        level: 2,
        text: "Conditions de recevabilité",
      },
      {
        type: "paragraph",
        text: "Le dossier de candidature doit comporter une caution provisoire équivalant à deux pour cent du montant estimé du lot, des références d’au moins deux chantiers routiers comparables réalisés au cours des cinq dernières années, ainsi qu’une attestation de capacité financière délivrée par un établissement bancaire. Les groupements d’entreprises sont admis, sous réserve d’un mandataire clairement désigné dans l’acte de candidature. L’évaluation technique porte notamment sur le matériel de terrassement disponible et sur l’expérience du personnel d’encadrement proposé pour chaque chantier.",
      },
      {
        type: "stat",
        value: "300 km",
        label: "Linéaire cumulé des quatorze lots mis en appel d’offres",
      },
      {
        type: "quote",
        text: "« Les délais sont tenables si le versement de l’avance de démarrage suit rapidement la notification : c’est souvent là que les chantiers prennent du retard, pas sur le terrain »",
        attribution:
          "M. Rodrigue Essono, gérant d’une entreprise de travaux publics",
      },
      {
        type: "heading",
        level: 2,
        text: "Calendrier de la procédure",
      },
      {
        type: "paragraph",
        text: "Le retrait des dossiers est ouvert dès la publication de l’avis. Le dépôt des offres est clos le 30 octobre à midi. La séance d’ouverture des plis est publique ; l’attribution provisoire est attendue dans les six semaines suivant le dépôt, sous réserve du délai d’examen des recours éventuels.",
      },
      {
        type: "paragraph",
        text: "Les candidats sont invités à vérifier la composition exacte de chaque lot auprès du service en charge du retrait des dossiers, les linéaires pouvant être ajustés à la marge avant la clôture. Les entreprises soumissionnaires ont aussi intérêt à anticiper les nouvelles règles de contenu local, présentées dans notre rubrique [Réglementations](/rubrique/espace-pro/reglementations). Un métré contradictoire est prévu en début de chantier pour ajuster, le cas échéant, le montant définitif du marché.",
      },
    ],
  },
  {
    slug: "formation-continue-dispositif-employeurs",
    title:
      "Formation continue : ce que le nouveau dispositif change pour les employeurs",
    dek: "La contribution formation évolue, tout comme les règles de prise en charge des plans de formation. Les employeurs, y compris les plus petites structures, doivent revoir leurs habitudes avant la fin de l’exercice.",
    categorySlug: "espace-pro",
    subCategorySlug: "formation",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "formation-universite",
    keyPoints: [
      "La contribution formation reste assise sur la masse salariale, mais son taux varie désormais selon l’effectif de l’entreprise.",
      "Le plan de formation annuel doit être déposé avant l’engagement des dépenses, et non plus présenté a posteriori.",
      "Les très petites entreprises bénéficient d’un taux de prise en charge majoré, en contrepartie d’un dossier simplifié.",
    ],
    seo: {
      title: "Formation continue : ce qui change pour les employeurs",
      description:
        "Contribution formation, plan annuel, prise en charge majorée pour les très petites entreprises : ce qui change pour les employeurs gabonais.",
      keywords: [
        "formation continue",
        "contribution formation",
        "employeurs",
        "ressources humaines",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "formation-professionnelle",
      "ressources-humaines",
      "employeurs",
      "fiscalite-sociale",
    ],
    daysAgo: 10,
    views: 860,
    body: [
      {
        type: "paragraph",
        text: "Le dispositif de formation continue change de logique. Jusqu’ici assise sur une obligation de dépense minimale, la contribution des employeurs devient un outil de financement mutualisé, avec un taux de prise en charge qui varie selon la taille de l’entreprise et la nature de l’action de formation engagée. Les services chargés de l’instruction des dossiers annoncent un traitement plus rapide pour les demandes conformes au nouveau formulaire type.",
      },
      {
        type: "heading",
        level: 2,
        text: "Une contribution modulée selon l’effectif",
      },
      {
        type: "paragraph",
        text: "Le taux de la contribution formation, calculé sur la masse salariale brute, reste globalement stable pour les entreprises de plus de cinquante salariés. Il diminue en revanche pour les structures de moins de dix salariés, qui bénéficient en contrepartie d’un accès simplifié au remboursement de leurs actions de formation, sans avoir à justifier d’un plan aussi détaillé que celui exigé des grandes entreprises. Ces dernières restent toutefois tenues de déclarer chaque action, même modeste, pour demeurer éligibles au taux réduit.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le plan de formation, désormais préalable",
      },
      {
        type: "paragraph",
        text: "Autre changement notable : le plan de formation annuel doit désormais être déposé avant l’engagement des dépenses, et non plus présenté a posteriori pour justifier une demande de remboursement. Les entreprises qui n’anticipent pas ce dépôt s’exposent à un refus de prise en charge, même pour une formation par ailleurs éligible et dispensée par un organisme agréé. Les services concernés recommandent un dépôt au moins un mois avant le début de la première action prévue dans le plan.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Dépôt du plan de formation annuel avant le 31 mars",
          "Conventions de formation signées avant le début de l’action",
          "Demande de prise en charge accompagnée des factures acquittées",
          "Attestation de présence des salariés formés",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Le cas des très petites entreprises",
      },
      {
        type: "paragraph",
        text: "Les entreprises de moins de dix salariés bénéficient d’un taux de prise en charge majoré, présenté par l’administration comme une mesure d’incitation à la formation continue dans les structures les plus fragiles. Le dossier à constituer est allégé : une seule convention type suffit pour plusieurs salariés d’une même entreprise, à condition que la formation soit dispensée par un organisme agréé et que les salariés concernés relèvent du régime général de la sécurité sociale.",
      },
      {
        type: "stat",
        value: "60 %",
        label:
          "Taux de prise en charge applicable aux très petites entreprises pour une formation éligible",
      },
      {
        type: "quote",
        text: "« Le dossier est plus simple, mais le remboursement met parfois quatre à cinq mois à arriver : pour une entreprise de huit salariés, c’est une trésorerie qu’on immobilise »",
        attribution: "Mme Sylvie Moussavou, directrice des ressources humaines",
      },
      {
        type: "paragraph",
        text: "Ce délai de remboursement reste la principale réserve exprimée par les employeurs consultés, en particulier dans les très petites entreprises où la trésorerie disponible est plus limitée. L’administration indique travailler à sa réduction, sans avoir communiqué d’échéance précise à ce stade. Les responsables formation trouveront un calendrier des prochaines sessions professionnelles dans notre rubrique [Formation](/rubrique/espace-pro/formation).",
      },
    ],
  },
  {
    slug: "rapport-annuel-banque-centrale-chiffres-a-retenir",
    title: "Rapport annuel de la banque centrale : les chiffres à retenir",
    dek: "Masse monétaire, crédit à l’économie, réserves de change, taux directeur : lecture des principaux indicateurs publiés par la banque centrale de la zone pour le dernier exercice.",
    categorySlug: "espace-pro",
    subCategorySlug: "docutheques",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "beac-banque",
    keyPoints: [
      "La masse monétaire progresse sur l’exercice, portée par la hausse des dépôts à vue des entreprises et des ménages urbains.",
      "Le crédit à l’économie reste concentré sur le commerce et les services, loin devant l’industrie et l’agriculture.",
      "Les réserves de change couvrent plusieurs mois d’importations, un niveau jugé confortable par les analystes consultés.",
    ],
    seo: {
      title: "Rapport annuel de la banque centrale : les chiffres",
      description:
        "Masse monétaire, crédit à l’économie, réserves de change, taux directeur : les chiffres du rapport annuel de la banque centrale de la zone, expliqués.",
      keywords: [
        "banque centrale",
        "masse monétaire",
        "crédit à l’économie",
        "réserves de change",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["banque-centrale", "politique-monetaire", "credit", "conjoncture"],
    daysAgo: 15,
    views: 1975,
    body: [
      {
        type: "paragraph",
        text: "La banque centrale de la zone a publié son rapport annuel. Le document dresse un état des lieux de la masse monétaire, du crédit à l’économie, des réserves de change et de l’orientation de la politique monétaire pour l’exercice écoulé. Quatre indicateurs retiennent particulièrement l’attention des trésoriers d’entreprise et des directions financières, qui y puisent des repères pour construire leurs propres prévisions de trésorerie.",
      },
      {
        type: "heading",
        level: 2,
        text: "Masse monétaire en hausse",
      },
      {
        type: "paragraph",
        text: "La masse monétaire progresse sur l’exercice, portée par la hausse des dépôts à vue des entreprises et par une collecte de l’épargne des ménages urbains plus dynamique qu’anticipé. Cette progression traduit aussi la bancarisation croissante des transactions, encouragée par le développement des paiements mobiles dans les principales villes du pays. Les banques de détail confirment cette tendance dans leurs propres statistiques d’ouverture de comptes.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Masse monétaire : progression sur l’exercice",
          "Crédit à l’économie : croissance modérée, concentrée sur le commerce",
          "Réserves de change : couverture de plusieurs mois d’importations",
          "Taux directeur : inchangé sur la période sous revue",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Crédit à l’économie, toujours concentré",
      },
      {
        type: "paragraph",
        text: "Le crédit à l’économie augmente à un rythme plus modéré que la masse monétaire. Il reste concentré sur le commerce et les services, loin devant l’industrie et l’agriculture, qui peinent à mobiliser des financements de moyen terme. Les banques justifient cette prudence par la difficulté à évaluer le risque sur des cycles de production longs, en l’absence de garanties suffisamment liquides pour les projets agro-industriels.",
      },
      {
        type: "stat",
        value: "48 %",
        label:
          "Part du crédit à l’économie orientée vers le commerce et les services sur l’exercice sous revue",
        source: "Rapport annuel de la banque centrale de la zone",
      },
      {
        type: "heading",
        level: 3,
        text: "Réserves de change et taux directeur",
      },
      {
        type: "paragraph",
        text: "Les réserves de change couvrent plusieurs mois d’importations de biens et de services, un niveau jugé confortable par les analystes consultés. Le taux directeur reste inchangé sur la période, l’institut d’émission privilégiant la stabilité tant que les tensions inflationnistes demeurent contenues dans l’ensemble de la zone. Plusieurs économistes de la place estiment néanmoins qu’une révision n’est pas à exclure si les prix de l’énergie repartent à la hausse.",
      },
      {
        type: "quote",
        text: "« Le niveau des réserves donne de la marge, mais il ne dispense pas les entreprises de couvrir leur risque de change sur les contrats en devises »",
        attribution:
          "Mme Chantal Ivinza, économiste dans une banque de la place",
      },
      {
        type: "paragraph",
        text: "Pour les directions financières, ce rapport annuel reste avant tout un outil de calibrage : il permet de resituer les conditions de financement de chaque entreprise par rapport à la tendance générale du crédit dans la zone. Les prochaines publications trimestrielles permettront de vérifier si ces tendances se confirment. Pour resituer ces montants à l’échelle nationale, le produit intérieur brut du Gabon avoisine 12 000 milliards de FCFA, et le budget de l’État un peu plus de 4 000 milliards de FCFA sur l’exercice en cours. Nos autres décryptages économiques sont réunis dans la rubrique [Espace pro](/rubrique/espace-pro).",
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
      description:
        "Éditorial : la diversification de l'économie gabonaise ne se mesure pas aux plans annoncés, mais à la part des recettes non pétrolières.",
      keywords: [
        "diversification économique Gabon",
        "éditorial",
        "recettes non pétrolières",
        "politique économique",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "diversification",
      "gabon",
      "economie",
      "recettes-publiques",
      "editorial",
    ],
    daysAgo: 4,
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
        text: "On ne diversifie pas une économie par décret. On la diversifie *foncier par foncier, crédit par crédit, kilowatt par kilowatt*. Le reste n'est que communication.",
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
  {
    slug: "tribune-foret-gabonaise-credit-carbone",
    title: "La forêt gabonaise vaut mieux qu’un crédit carbone",
    dek: "Vendre des crédits carbone valorise la forêt au prix du renoncement. La transformer en bois d’œuvre certifié et en emplois industriels la valorise au prix du travail. Le choix n’est pas neutre.",
    categorySlug: "idees",
    subCategorySlug: "tribune",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "foret-okoume",
    keyPoints: [
      "Un crédit carbone rémunère l’absence d’exploitation, quand la seconde transformation du bois rémunère le travail et forme une main-d’œuvre qualifiée.",
      "Le marché volontaire du carbone reste peu liquide et expose le vendeur à une forte volatilité des prix, contrairement à un contrat d’export.",
      "Les deux logiques ne s’excluent pas totalement, mais l’une crée des emplois durables quand l’autre en crée très peu.",
    ],
    seo: {
      title: "Tribune : la forêt gabonaise vaut mieux qu’un crédit carbone",
      description:
        "Tribune : la forêt gabonaise transformée en bois d’œuvre certifié et en emplois vaut davantage qu’une même surface vendue en crédits carbone.",
      keywords: [
        "forêt gabonaise",
        "crédit carbone",
        "bois d’œuvre",
        "tribune",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["tribune", "foret", "bois", "credit-carbone", "industrie"],
    daysAgo: 16,
    views: 3050,
    body: [
      {
        type: "paragraph",
        text: "Je comprends la tentation du crédit carbone. Un hectare de forêt intacte peut aujourd’hui générer un revenu sans qu’on y abatte un seul arbre, à un moment où l’État cherche des ressources non minières pour diversifier ses recettes. Sur le papier, l’équation est séduisante. Sur le terrain, une fois les contrats signés et les prix négociés, elle mérite d’être regardée de plus près.",
      },
      {
        type: "heading",
        level: 2,
        text: "L’argument du crédit carbone, sérieux",
      },
      {
        type: "paragraph",
        text: "Il faut lui reconnaître sa cohérence. La forêt gabonaise stocke un volume de carbone considérable ; la préserver a une valeur climatique réelle, que le marché volontaire cherche précisément à monétiser. Pour des massifs difficiles d’accès, où l’exploitation forestière serait de toute façon marginale, cette rémunération peut représenter un revenu net pour les communes concernées. Plusieurs projets pilotes ont ainsi permis de financer des postes de surveillance forestière autrement difficiles à budgétiser.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que le marché carbone ne dit pas",
      },
      {
        type: "paragraph",
        text: "Mais ce marché reste peu liquide et ses prix ont connu de fortes variations ces dernières années, au gré des scandales de vérification qui ont touché plusieurs projets sur le continent. Un revenu qui dépend d’un cours volatil, décidé loin du Gabon, expose les vendeurs à un risque qu’ils ne maîtrisent pas et qu’ils ne peuvent pas couvrir. Un contrat de gré à gré, mal négocié, peut ainsi valoir beaucoup moins que prévu au moment du renouvellement.",
      },
      {
        type: "quote",
        text: "« Nous avons signé un contrat de crédits carbone en pensant sécuriser un revenu régulier ; le prix a été divisé par trois l’année suivante, sans que nous ayons de recours »",
        attribution: "Mme Estelle Bivigou, chercheuse en économie forestière",
      },
      {
        type: "heading",
        level: 3,
        text: "La transformation, une autre échelle de valeur",
      },
      {
        type: "paragraph",
        text: "La seconde transformation du bois suit une autre logique. Une grume exportée brute vaut nettement moins que la même quantité de bois transformée en placage, en contreplaqué ou en mobilier. Chaque étape de transformation ajoute de la valeur et, surtout, de l’emploi : scieurs, opérateurs de séchoir, menuisiers, contrôleurs qualité. Une unité de seconde transformation installée près d’un massif exploité ancre aussi des emplois indirects, du transport à la maintenance industrielle.",
      },
      {
        type: "stat",
        value: "10 fois",
        label:
          "Ordre de grandeur de l’emploi généré par un mètre cube de bois transformé, comparé au même volume exporté en grume",
      },
      {
        type: "paragraph",
        text: "Je ne plaide pas pour l’abandon de toute compensation carbone : sur des parcelles réellement marginales pour l’exploitation, elle garde un sens, en particulier lorsqu’elle finance des projets communautaires vérifiables. Mais en faire l’horizon principal de la politique forestière reviendrait à choisir la rente contre l’industrie, au moment précis où la filière bois commence à structurer une offre certifiée et exportable.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que je retiens",
      },
      {
        type: "paragraph",
        text: "Un massif forestier transformé en bois d’œuvre certifié, en emplois de menuiserie et en compétences industrielles vaut, sur la durée, davantage qu’une même surface convertie en tonnes de carbone évitées. La forêt gabonaise mérite mieux qu’un revenu de renoncement. C’est ce choix industriel que la politique forestière devrait assumer davantage.",
      },
    ],
  },
  {
    slug: "interview-sans-transformation-locale-nous-exportons-nos-emplois",
    title: "« Sans transformation locale, nous exportons nos emplois »",
    dek: "Présidente du Cercle des entreprises du Gabon, Sylvie Ntsame plaide pour une politique industrielle tenue dans la durée. Elle explique pourquoi, selon elle, exporter la matière première revient à exporter les emplois qui vont avec.",
    categorySlug: "idees",
    subCategorySlug: "interview",
    authorSlug: "nadia-ondo",
    heroMediaKey: "reunion-affaires",
    keyPoints: [
      "Une politique industrielle se juge sur dix ans : la constance compte davantage que le montant des incitations.",
      "Exporter une matière première brute revient, selon elle, à exporter les emplois de sa transformation.",
      "Le coût et la fiabilité de l'énergie freinent l'industrie autant que le déficit de compétences techniques.",
    ],
    seo: {
      description:
        "Entretien avec la présidente du Cercle des entreprises du Gabon sur l'industrialisation, l'emploi et l'absence de transformation locale.",
      keywords: [
        "interview",
        "patronat",
        "emploi",
        "industrie",
        "transformation locale",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "interview",
      "patronat",
      "emploi",
      "transformation-locale",
      "industrie",
    ],
    daysAgo: 8,
    views: 3120,
    body: [
      {
        type: "paragraph",
        text: "Présidente du Cercle des entreprises du Gabon depuis deux ans, Sylvie Ntsame dirige par ailleurs une entreprise familiale de matériaux de construction à Libreville. Elle plaide pour une politique industrielle plus contraignante, quitte à déplaire à certains de ses propres adhérents importateurs. Entretien.",
      },
      {
        type: "video",
        title: "L'entretien en vidéo (12 min)",
        posterMediaKey: "reunion-affaires",
        src: "/medias/entretien-patronat.mp4",
        durationLabel: "12 min",
      },
      {
        type: "heading",
        level: 2,
        text: "Sur la compétitivité industrielle",
      },
      {
        type: "heading",
        level: 3,
        text: "Le patronat réclame depuis longtemps une politique industrielle plus volontariste. Qu'attendez-vous précisément des pouvoirs publics ?",
      },
      {
        type: "paragraph",
        text: "Nous attendons de la constance. Une entreprise qui investit dans une unité de transformation engage son capital sur dix ou quinze ans. Elle a besoin d'un cadre fiscal et douanier stable sur cette durée, pas d'un avantage accordé une année et remis en cause la suivante. C'est cette prévisibilité qui manque le plus, davantage encore que le montant des incitations elles-mêmes.",
      },
      {
        type: "heading",
        level: 3,
        text: "Vous employez la formule « nous exportons nos emplois ». Que voulez-vous dire par là ?",
      },
      {
        type: "paragraph",
        text: "Chaque fois qu'une matière première quitte le pays à l'état brut, l'essentiel de la valeur ajoutée — et donc des emplois qualifiés qui vont avec — se crée ailleurs, dans les usines de transformation. Le bois, [le manganèse](/rubrique/economie/mines-energie), une partie de nos productions agricoles : le mécanisme est le même à chaque fois. Nous exportons la matière et nous laissons partir, avec elle, les emplois d'ingénieurs, de techniciens et d'ouvriers spécialisés qui auraient pu exister ici.",
      },
      {
        type: "quote",
        text: "Une politique industrielle ne se décrète pas en un conseil des ministres. Elle se construit sur dix ans, *avec de la constance*, pas des annonces.",
        attribution:
          "Sylvie Ntsame, présidente du Cercle des entreprises du Gabon",
      },
      {
        type: "heading",
        level: 3,
        text: "Certains de vos adhérents vivent justement de l'importation. N'y a-t-il pas un conflit d'intérêts au sein même du patronat ?",
      },
      {
        type: "paragraph",
        text: "Il existe, et je ne le nie pas. Une partie de nos membres importe des produits finis et n'a, à court terme, aucun intérêt à voir émerger une production locale concurrente. Notre rôle est justement d'arbitrer entre ces intérêts de court terme et l'intérêt collectif de long terme, qui est d'avoir une économie plus diversifiée et moins dépendante des importations.",
      },
      {
        type: "heading",
        level: 2,
        text: "Sur l'emploi et la formation",
      },
      {
        type: "heading",
        level: 3,
        text: "La formation professionnelle est souvent citée comme le principal obstacle à l'industrialisation. Partagez-vous ce constat ?",
      },
      {
        type: "paragraph",
        text: "En partie seulement. Le déficit de compétences techniques est réel, mais il n'explique pas tout. J'ai vu des entreprises renoncer à un investissement industriel non pas faute de trouver des techniciens, mais faute d'électricité fiable ou de foncier aménagé. La formation est nécessaire, elle n'est pas suffisante.",
      },
      {
        type: "stat",
        value: "≈ 40 %",
        label:
          "Part des postes techniques que les industriels du secteur peinent à pourvoir localement, selon nos adhérents",
        source: "Enquête interne, exercice de démonstration",
      },
      {
        type: "heading",
        level: 3,
        text: "Concrètement, que propose le patronat sur la formation ?",
      },
      {
        type: "paragraph",
        text: "Nous poussons pour des filières d'apprentissage co-construites avec les entreprises, où l'élève passe la moitié de son temps en atelier plutôt que sur les seuls bancs de l'école. Plusieurs de nos adhérents ont déjà ouvert leurs lignes de production à des stagiaires de longue durée. C'est un début, pas encore une politique nationale cohérente.",
      },
      {
        type: "heading",
        level: 3,
        text: "Le coût de l'énergie revient souvent dans les discours patronaux. Est-ce vraiment le premier frein ?",
      },
      {
        type: "paragraph",
        text: "Pour l'industrie lourde, oui, sans hésitation. Une usine de transformation qui tourne vingt-quatre heures sur vingt-quatre ne peut pas composer avec des coupures régulières ni avec un tarif industriel plus élevé que celui de ses concurrents régionaux. Tant que cette équation ne sera pas réglée, certains projets resteront sur le papier.",
      },
      {
        type: "heading",
        level: 3,
        text: "Un mot pour conclure : le Gabon peut-il réellement se transformer en une décennie ?",
      },
      {
        type: "paragraph",
        text: "Une décennie, c'est court pour changer la structure d'une économie, mais c'est suffisant pour lancer des trajectoires crédibles si l'on s'y tient. Ce que je redoute le plus, ce n'est pas le manque d'ambition affichée, c'est l'impatience : vouloir des résultats en deux ans sur des investissements qui en demandent dix.",
      },
    ],
  },
];
