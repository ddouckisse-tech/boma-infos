import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — « Dossier spécial », « Intelligence économique »
 * et « Interview ». Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_4: readonly SeedArticle[] = [
  {
    slug: "dossier-apres-le-petrole-trois-piliers-diversification",
    title: "Après le pétrole : enquête sur les trois piliers de la diversification",
    dek: "Le pétrole finance encore un tiers du budget de l'État. Bois transformé, agro-industrie, services numériques : trois filières sont annoncées comme le relais de croissance. Enquête sur leurs limites réelles.",
    categorySlug: "dossier-special",
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
      description: "Bois transformé, agro-industrie, services numériques : enquête sur les trois piliers censés relayer le pétrole dans l'économie gabonaise.",
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
    tags: [
      "diversification",
      "petrole",
      "bois",
      "agro-industrie",
      "numerique",
    ],
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
        label: "Part estimée des recettes pétrolières dans les recettes publiques",
        source: "Ordre de grandeur, documents budgétaires",
      },
      {
        type: "paragraph",
        text: "Sur le papier, l'ambition ne date pas d'hier. Elle s'est traduite par étapes successives : interdiction d'exporter les grumes non transformées au début des années 2010, incitations fiscales pour l'agro-industrie au cours de la décennie suivante, puis, plus récemment, une politique volontariste pour les services numériques et les métiers du bureau. [Nos analyses de politique monétaire](/rubrique/intelligence-economique) montrent par ailleurs à quel point la trésorerie des entreprises reste sensible aux cycles pétroliers, bien après que la matière première a quitté le pays. La diversification n'est donc pas un supplément d'âme réservé aux discours de fin d'année : elle conditionne directement la capacité du pays à amortir le prochain choc, quelle que soit sa date d'arrivée. Chacune de ces étapes a d'ailleurs suscité son lot de scepticisme, avant de porter ses fruits plus lentement que ne l'espéraient ses promoteurs.",
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
        text: "Nous ne sommes plus des exportateurs de grumes. Nous vendons du panneau fini, avec une marque et un service après-vente.",
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
        caption: "Une plantation vivrière en périphérie rurale. L'agro-industrie mise sur les cultures de rente et les vivres.",
      },
      {
        type: "stat",
        value: "≈ 60 %",
        label: "Part estimée des produits alimentaires consommés couverte par les importations",
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
        caption: "Une installation solaire d'appoint. L'essor du numérique dépend d'abord d'une électricité disponible en continu.",
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
    slug: "littoral-gabonais-facade-economique-sous-pression",
    title: "Le littoral gabonais, façade économique sous pression",
    dek: "Sur huit cents kilomètres de côte, le Gabon concentre son économie et ses tensions : érosion, pêche industrielle contre pêche artisanale, pression immobilière sur le front de mer, extension portuaire. Un littoral de plus en plus disputé.",
    categorySlug: "dossier-special",
    authorSlug: "serge-boussougou",
    heroMediaKey: "peche-artisanale",
    keyPoints: [
      "La pêche artisanale et la pêche industrielle se disputent des zones côtières mal contrôlées.",
      "La pression immobilière réduit l'accès public au bord de mer dans les quartiers urbains.",
      "L'extension du port modifie les courants et déplace certaines zones traditionnelles de pêche.",
    ],
    seo: {
      description: "Érosion, pêche artisanale contre pêche industrielle, pression foncière, extension portuaire : enquête sur les tensions du littoral gabonais.",
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
    tags: [
      "littoral",
      "peche",
      "erosion-cotiere",
      "port",
      "amenagement",
    ],
    daysAgo: 20,
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
        text: "Nos pirogues ne peuvent pas suivre les chalutiers au large. Quand ils pêchent trop près de la côte, ce sont nos filets qui reviennent vides.",
        attribution: "Étienne Mavoungou, président d'une coopérative de pêcheurs artisanaux",
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
    slug: "masse-monetaire-cemac-contraction-troisieme-trimestre",
    title: "Masse monétaire en zone CEMAC : ce que révèle la contraction du troisième trimestre",
    dek: "Les agrégats monétaires de la zone CEMAC ont reculé au troisième trimestre. Explication du mécanisme — crédit à l'économie, avoirs extérieurs — et de ses effets, avec retard, sur la trésorerie des entreprises gabonaises.",
    categorySlug: "intelligence-economique",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "franc-cfa",
    keyPoints: [
      "Une masse monétaire se contracte soit par ralentissement du crédit, soit par recul des avoirs extérieurs.",
      "Le resserrement bancaire se traduit d'abord par des lignes de trésorerie renouvelées plus prudemment.",
      "Un seul trimestre de contraction ne suffit pas à établir une tendance monétaire durable.",
    ],
    seo: {
      description: "Pourquoi la masse monétaire de la zone CEMAC a reculé au troisième trimestre, et comment ce repli affecte la trésorerie des entreprises gabonaises.",
      keywords: [
        "CEMAC",
        "masse monétaire",
        "crédit entreprises",
        "franc CFA",
        "trésorerie",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "cemac",
      "masse-monetaire",
      "credit",
      "franc-cfa",
      "tresorerie",
    ],
    daysAgo: 2,
    views: 2380,
    body: [
      {
        type: "paragraph",
        text: "Les derniers agrégats monétaires de la zone CEMAC font apparaître un ralentissement net de la masse monétaire au troisième trimestre. Un tel repli n'est pas anodin : il touche, avec un décalage de quelques mois, la capacité des banques à prêter et, en bout de chaîne, la trésorerie des entreprises de la sous-région, y compris au Gabon.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que mesure la masse monétaire",
      },
      {
        type: "paragraph",
        text: "La masse monétaire additionne la monnaie en circulation et les dépôts détenus dans les banques de la zone. Elle progresse quand le crédit à l'économie augmente ou quand les avoirs extérieurs des banques et de la banque centrale de la zone s'étoffent. Elle se contracte, à l'inverse, quand le crédit ralentit ou quand ces avoirs extérieurs reculent. Un repli du troisième trimestre peut donc avoir plusieurs origines, qu'il faut distinguer avant d'en tirer une conclusion.",
      },
      {
        type: "stat",
        value: "≈ -2 %",
        label: "Contraction trimestrielle de la masse monétaire retenue pour cet exercice",
        source: "Ordre de grandeur, exercice de démonstration, non officiel",
      },
      {
        type: "heading",
        level: 2,
        text: "Le canal du crédit à l'économie",
      },
      {
        type: "paragraph",
        text: "Premier canal possible : le crédit à l'économie. Quand les banques resserrent leurs conditions d'octroi — davantage de garanties exigées, durées raccourcies, taux plus prudents — parce qu'elles anticipent une hausse des créances douteuses, le crédit nouveau ralentit. Moins de crédit nouveau signifie moins de dépôts créés au moment du décaissement des prêts, donc une masse monétaire qui progresse plus lentement, voire recule.",
      },
      {
        type: "paragraph",
        text: "Second canal : les avoirs extérieurs. Dans un régime de change fixe adossé à une monnaie pivot, la banque centrale de la zone et les banques commerciales détiennent des réserves en devises qui servent de contrepartie à une partie de la monnaie émise. Si ces avoirs extérieurs reculent — parce que les recettes d'exportation ralentissent ou que les sorties de capitaux s'accélèrent —, la masse monétaire peut se contracter même si le crédit intérieur, lui, continue de progresser.",
      },
      {
        type: "quote",
        text: "Il faut toujours se demander si une contraction monétaire vient du crédit ou des réserves extérieures. Le remède n'est pas le même selon la réponse.",
        attribution: "Serge Ntoutoume, économiste au sein d'une banque commerciale de la place",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que cela change pour l'entreprise",
      },
      {
        type: "paragraph",
        text: "Pour une entreprise, la traduction concrète arrive par la trésorerie. Une ligne de découvert renouvelée plus difficilement, un crédit de campagne accordé pour un montant inférieur à celui de l'an dernier, des délais de paiement fournisseurs qui s'allongent : ce sont les signaux les plus courants d'un resserrement monétaire, bien avant qu'il n'apparaisse dans les statistiques officielles.",
      },
      {
        type: "paragraph",
        text: "Une entreprise de négoce comme Ogooué Négoce, qui importe des biens de consommation courante, illustre le mécanisme : ses fournisseurs étrangers réclament des paiements plus rapides, tandis que sa banque locale se montre plus prudente sur le renouvellement de ses lignes de trésorerie. Le décalage entre les deux se comble par un besoin de fonds de roulement plus élevé, financé à un coût plus élevé qu'il y a un an.",
      },
      {
        type: "stat",
        value: "≈ +1,5 pt",
        label: "Écart de taux moyen sur les nouveaux crédits de trésorerie retenu pour cet exercice",
        source: "Ordre de grandeur, exercice de démonstration, non officiel",
      },
      {
        type: "paragraph",
        text: "Un repli trimestriel ne dessine pas à lui seul une tendance. Les agrégats monétaires connaissent des effets de base — un trimestre de comparaison exceptionnellement haut suffit à faire paraître le suivant plus faible — et des mouvements saisonniers liés aux campagnes d'exportation. Un seul trimestre de contraction appelle donc la prudence, plus qu'un diagnostic définitif.",
      },
      {
        type: "paragraph",
        text: "Les indicateurs à surveiller dans les prochains mois sont connus : rythme du crédit nouveau accordé aux entreprises, évolution des avoirs extérieurs nets, et niveau des créances en souffrance déclarées par les banques. Leur lecture croisée, trimestre après trimestre, dira si le repli du troisième trimestre était un accident de parcours ou le début d'un resserrement plus durable.",
      },
      {
        type: "paragraph",
        text: "Pour une économie comme celle du Gabon, adossée à une monnaie commune et à des recettes d'exportation cycliques, la vigilance sur ces agrégats n'est pas un exercice réservé aux salles de marché : elle conditionne, avec retard, le coût auquel les entreprises locales financent leur activité courante, y compris celles engagées dans [les filières de diversification](/rubrique/dossier-special).",
      },
    ],
  },
  {
    slug: "qui-possede-quoi-manganese-afrique-centrale",
    title: "Qui possède quoi dans le manganèse d'Afrique centrale",
    dek: "Cinq groupes, quatre continents : cartographie de l'actionnariat minier du manganèse gabonais. Le minerai part en concentré, la transformation en alliages reste presque toujours hors du pays.",
    categorySlug: "intelligence-economique",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "marche-libreville",
    keyPoints: [
      "Les concessions actives se répartissent entre capitaux australiens, chinois, gabonais, français et sud-africains.",
      "La transformation en alliages de manganèse, la plus rémunératrice, s'effectue presque toujours à l'étranger.",
      "Un projet local de ferroalliages reste à l'étude, freiné par le coût et la disponibilité de l'énergie.",
    ],
    seo: {
      description: "Cartographie de l'actionnariat minier du manganèse gabonais : qui détient quoi, et pourquoi la transformation en alliages reste hors du pays.",
      keywords: [
        "manganèse",
        "actionnariat minier",
        "Gabon",
        "industries extractives",
        "transformation locale",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "manganese",
      "actionnariat",
      "mines",
      "afrique-centrale",
      "investissement",
    ],
    daysAgo: 23,
    views: 890,
    body: [
      {
        type: "paragraph",
        text: "Le Gabon compte parmi les grands producteurs mondiaux de manganèse. Le minerai part presque intégralement à l'état brut ou faiblement enrichi : la valeur ajoutée de la transformation en alliages se loge, elle, en dehors du pays. Cartographie, forcément partielle, de qui possède quoi dans cette filière stratégique.",
      },
      {
        type: "stat",
        value: "5",
        label: "Groupes retenus dans la cartographie d'actionnariat de cet exercice",
        source: "Cartographie, exercice de démonstration, non exhaustif",
      },
      {
        type: "heading",
        level: 2,
        text: "Cinq groupes, quatre continents",
      },
      {
        type: "paragraph",
        text: "Les permis d'exploitation actifs sont répartis entre un petit nombre de groupes, dont l'origine géographique dessine déjà une partie de l'histoire : capitaux australiens et chinois pour les plus grosses concessions, participation publique-privée gabonaise sur les gisements plus récents, capitaux français historiquement présents sur la logistique d'exportation, capitaux sud-africains positionnés sur un projet de transformation encore à l'étude.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Meridian Metals Group (Australie) : actionnaire de référence du plus ancien consortium d'extraction du pays.",
          "Hanshan Mining Corporation (Chine) : concessions plus récentes, montées en production rapide depuis dix ans.",
          "Ogooué Ressources (Gabon) : participation publique-privée sur des gisements de taille intermédiaire.",
          "Compagnie Continentale des Mines (France) : position historique sur la logistique ferroviaire et portuaire d'exportation.",
          "Austral Ferroalliages (Afrique du Sud) : participation minoritaire dans un projet de transformation en alliages, non encore opérationnel.",
        ],
      },
      {
        type: "paragraph",
        text: "Cette répartition dit peu, en soi, de la valeur captée par chaque acteur. Le minerai extrait est vendu essentiellement sous forme de concentré, parfois légèrement enrichi sur place. La transformation en alliages de manganèse — l'étape la plus rémunératrice de la chaîne — s'effectue presque toujours dans des usines situées ailleurs, plus proches des marchés sidérurgiques ou des sources d'énergie bon marché.",
      },
      {
        type: "heading",
        level: 2,
        text: "La transformation reste ailleurs",
      },
      {
        type: "paragraph",
        text: "Construire une usine de ferroalliages suppose une électricité abondante et peu chère, un accès portuaire profond et un marché final déjà organisé. Ces conditions se trouvent plus facilement là où les fours existent déjà. Le projet porté par Austral Ferroalliages, encore à l'étude, illustre la difficulté : son plan de financement dépend d'un accès à une énergie compétitive que le réseau électrique national ne garantit pas partout.",
      },
      {
        type: "quote",
        text: "Exporter du concentré, c'est exporter une matière première et les emplois qui vont avec sa transformation. Le minerai part, la valeur ajoutée reste ailleurs.",
        attribution: "Odette Mihindou, économiste spécialisée dans les industries extractives",
      },
      {
        type: "paragraph",
        text: "Des installations plus modestes de lavage et d'enrichissement existent déjà sur site, mais elles ne créent qu'une fraction des emplois industriels qu'une véritable usine de transformation générerait. Les discussions autour d'un projet local de ferroalliages reviennent régulièrement, sans qu'aucun calendrier ferme n'ait, à ce jour, été rendu public par les groupes concernés.",
      },
      {
        type: "paragraph",
        text: "Pour les finances publiques, la différence se lit dans la nature des recettes perçues : redevances minières et taxes à l'exportation sur le concentré, plutôt que fiscalité sur une activité industrielle à plus forte valeur ajoutée. C'est tout l'enjeu, pour les autorités gabonaises, de faire évoluer ces contrats vers davantage de transformation locale.",
      },
      {
        type: "paragraph",
        text: "La cartographie de l'actionnariat ne suffit pas à expliquer pourquoi la transformation reste hors du pays. Elle montre, en creux, que la décision ne dépend pas d'un seul acteur : elle suppose un alignement, encore incomplet, entre disponibilité énergétique, financement industriel et stratégie commerciale des groupes en présence.",
      },
    ],
  },
  {
    slug: "interview-sans-transformation-locale-nous-exportons-nos-emplois",
    title: "« Sans transformation locale, nous exportons nos emplois »",
    dek: "Présidente du Cercle des entreprises du Gabon, Sylvie Ntsame plaide pour une politique industrielle tenue dans la durée. Elle explique pourquoi, selon elle, exporter la matière première revient à exporter les emplois qui vont avec.",
    categorySlug: "interview",
    authorSlug: "nadia-ondo",
    heroMediaKey: "reunion-affaires",
    keyPoints: [
      "Une politique industrielle se juge sur dix ans : la constance compte davantage que le montant des incitations.",
      "Exporter une matière première brute revient, selon elle, à exporter les emplois de sa transformation.",
      "Le coût et la fiabilité de l'énergie freinent l'industrie autant que le déficit de compétences techniques.",
    ],
    seo: {
      description: "Entretien avec la présidente du Cercle des entreprises du Gabon sur l'industrialisation, l'emploi et l'absence de transformation locale.",
      keywords: [
        "interview",
        "patronat",
        "emploi",
        "industrie",
        "transformation locale",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "interview",
      "patronat",
      "emploi",
      "transformation-locale",
      "industrie",
    ],
    daysAgo: 4,
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
        text: "Chaque fois qu'une matière première quitte le pays à l'état brut, l'essentiel de la valeur ajoutée — et donc des emplois qualifiés qui vont avec — se crée ailleurs, dans les usines de transformation. Le bois, [le manganèse](/rubrique/intelligence-economique), une partie de nos productions agricoles : le mécanisme est le même à chaque fois. Nous exportons la matière et nous laissons partir, avec elle, les emplois d'ingénieurs, de techniciens et d'ouvriers spécialisés qui auraient pu exister ici.",
      },
      {
        type: "quote",
        text: "Une politique industrielle ne se décrète pas en un conseil des ministres. Elle se construit sur dix ans, avec de la constance, pas des annonces.",
        attribution: "Sylvie Ntsame, présidente du Cercle des entreprises du Gabon",
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
        label: "Part des postes techniques que les industriels du secteur peinent à pourvoir localement, selon nos adhérents",
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
  {
    slug: "interview-fret-aerien-coute-trois-fois-trop-cher",
    title: "« Le fret aérien coûte trois fois trop cher »",
    dek: "Directrice générale d'une compagnie de fret aérien gabonaise, Carine Mabika décrypte un poste de coût mal connu : redevances, retour à vide, chaîne du froid. Elle explique pourquoi le kilo transporté coûte trois fois trop cher.",
    categorySlug: "interview",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "aeroport-libreville",
    keyPoints: [
      "Le fret aérien gabonais coûte trois fois plus cher qu'une route comparable au départ d'un grand hub régional.",
      "Les vols retour vers Libreville affichent un taux de remplissage nettement inférieur à celui des vols aller.",
      "Une tarification aéroportuaire dégressive, liée au volume transporté, réduirait le coût au kilo sans investissement lourd.",
    ],
    seo: {
      description: "Entretien avec la directrice générale d'une compagnie de fret aérien gabonaise sur le coût du transport et les redevances aéroportuaires.",
      keywords: [
        "fret aérien",
        "Gabon",
        "logistique",
        "aéroport",
        "exportation",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "interview",
      "fret-aerien",
      "logistique",
      "aeroport",
      "exportation",
    ],
    daysAgo: 14,
    views: 1560,
    body: [
      {
        type: "paragraph",
        text: "Directrice générale d'Okoumé Air Cargo, Carine Mabika exploite deux appareils cargo entre Libreville et l'Europe. Elle détaille le calcul, souvent mal compris, du prix d'un billet de fret et les raisons pour lesquelles un vol retour vide coûte aussi cher qu'un vol plein.",
      },
      {
        type: "heading",
        level: 2,
        text: "Sur le coût du fret",
      },
      {
        type: "heading",
        level: 3,
        text: "Vous dites que le fret aérien coûte trois fois trop cher au départ du Gabon. Trois fois plus cher que quoi ?",
      },
      {
        type: "paragraph",
        text: "Trois fois plus cher que sur une route comparable au départ d'un grand hub régional, à distance équivalente. Le calcul se fait au kilo, et ce kilo intègre le carburant, les redevances aéroportuaires, l'assurance et, surtout, le taux de remplissage réel de l'avion. Sur nos lignes, ce taux reste inférieur à ce qu'il faudrait pour amortir correctement le vol.",
      },
      {
        type: "heading",
        level: 3,
        text: "Le carburant n'est-il pas le premier poste de coût, comme partout ailleurs dans l'aérien ?",
      },
      {
        type: "paragraph",
        text: "Il pèse lourd, mais ce n'est pas ce qui nous distingue des autres compagnies de la sous-région. Ce qui nous distingue, ce sont les redevances aéroportuaires et de navigation, plus élevées ici que sur des aéroports comparables, et l'absence quasi totale de fret à l'aller pour compenser un retour souvent vide.",
      },
      {
        type: "quote",
        text: "Un avion qui décolle à moitié vide au retour, c'est un coût fixe payé pour un service à moitié rendu. Ce déséquilibre, à lui seul, explique une bonne partie de nos tarifs.",
        attribution: "Carine Mabika, directrice générale d'Okoumé Air Cargo",
      },
      {
        type: "heading",
        level: 2,
        text: "Sur les liaisons et les retours",
      },
      {
        type: "heading",
        level: 3,
        text: "Concrètement, qu'est-ce qui remplit l'avion à l'aller, et qu'est-ce qui manque au retour ?",
      },
      {
        type: "paragraph",
        text: "À l'aller vers l'Europe, nous transportons des produits périssables à forte valeur : poissons frais, certains fruits, des envois urgents pour l'industrie pétrolière. Au retour vers Libreville, le fret se limite trop souvent à des pièces détachées et à du courrier express, des volumes qui ne remplissent qu'une fraction de la soute.",
      },
      {
        type: "stat",
        value: "≈ 35 %",
        label: "Taux de remplissage moyen retenu pour les vols retour vers Libreville, pour cet exercice",
        source: "Estimation de la compagnie, exercice de démonstration",
      },
      {
        type: "heading",
        level: 3,
        text: "Les produits périssables justement : quelle est la contrainte la plus lourde pour vous ?",
      },
      {
        type: "paragraph",
        text: "Le délai. Un poisson ou un fruit qui attend trop longtemps au sol perd de sa valeur avant même d'embarquer. Nous avons besoin d'une chaîne du froid continue entre le producteur et la soute de l'avion, ce qui suppose des investissements que peu d'exportateurs peuvent porter seuls.",
      },
      {
        type: "heading",
        level: 3,
        text: "Vous évoquiez les redevances aéroportuaires. Que faudrait-il changer ?",
      },
      {
        type: "paragraph",
        text: "Une tarification qui tienne compte du volume réel transporté, plutôt qu'un forfait identique quel que soit le taux de remplissage. Certaines plateformes régionales ont déjà adopté ce type de grille dégressive, ce qui allège mécaniquement le coût au kilo pour les compagnies qui, comme nous, opèrent sur des routes encore peu denses.",
      },
      {
        type: "heading",
        level: 3,
        text: "Un mot pour conclure : la situation peut-elle s'améliorer sans nouvel investissement public ?",
      },
      {
        type: "paragraph",
        text: "Difficilement, à elle seule, notre activité ne financera pas une chaîne du froid nationale. Mais une partie du chemin ne coûte rien : simplifier les procédures au sol, publier des grilles tarifaires prévisibles, coordonner les créneaux entre compagnies. Cela ne remplace pas l'investissement, mais cela réduirait déjà une partie du surcoût que nous répercutons aujourd'hui sur nos clients.",
      },
    ],
  },
];
