import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubriques « Tourisme » et « Culture ».
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_3: readonly SeedArticle[] = [
  {
    slug: "ecotourisme-parcs-nationaux-pari-gabonais",
    title: "Écotourisme : le pari gabonais des parcs nationaux",
    dek: "Treize parcs, une forêt qui couvre environ 88 % du pays, des éléphants que l'on croise jusque sur la plage de Loango : l'atout est rare. Reste à le rendre accessible, abordable et utile aux villages riverains.",
    categorySlug: "tourisme",
    subCategorySlug: "parcs-nationaux",
    authorSlug: "yannick-moussavou",
    heroMediaKey: "littoral-pongara",
    galleryMediaKeys: ["parc-loango", "parc-lope", "elephants-foret"],
    keyPoints: [
      "Le Gabon compte treize parcs nationaux, créés en 2002, qui couvrent près de 11 % du territoire et offrent une faune visible, notamment à Loango.",
      "L'accès difficile, le coût des transports intérieurs, le petit nombre de lits et la formation inégale des guides freinent la fréquentation.",
      "Les opérateurs demandent un cadre lisible et des liaisons régulières, tandis que les villages riverains attendent des retombées plus stables.",
    ],
    seo: {
      description:
        "Treize parcs nationaux, une faune visible, mais peu de lits et des transports coûteux : enquête sur le pari écotouristique du Gabon.",
      keywords: [
        "écotourisme",
        "Gabon",
        "parcs nationaux",
        "Loango",
        "Lopé-Okanda",
        "tourisme de nature",
      ],
    },
    origin: "redaction",
    feature: "lead",
    tags: [
      "ecotourisme",
      "parcs-nationaux",
      "loango",
      "lope-okanda",
      "faune",
      "villages-riverains",
    ],
    daysAgo: 1,
    views: 3400,
    body: [
      {
        type: "paragraph",
        text: "À Loango, la plage sert de route aux éléphants. En fin de journée, un adulte sort de la lisière, traverse le sable à pas lents, s'arrête devant l'écume, puis repart vers les arbres. Plus loin, deux buffles observent la scène. Dans la lagune, un hippopotame laisse affleurer les yeux et les narines. Sur la terrasse d'un lodge voisin, les visiteurs retiennent leur souffle : personne ne veut faire de bruit. La scène n'a rien d'artificiel. Elle résume le pari du Gabon depuis la création de ses parcs, en 2002 : faire de la forêt et de sa faune une ressource durable, sans les abîmer. Le décor est là. Reste à bâtir l'économie qui va avec.",
      },
      {
        type: "image",
        mediaKey: "parc-loango",
        caption:
          "Éléphants de forêt en lisière de savane, dans le parc national de Loango.",
      },
      {
        type: "paragraph",
        text: "L'atout se mesure en chiffres. Le Gabon compte treize parcs nationaux, créés en 2002, qui couvrent près de 11 % du territoire. La forêt recouvre environ 88 % du pays. Deux espaces protégés sont inscrits au patrimoine mondial de l'UNESCO : la Lopé-Okanda depuis 2007, l'Ivindo depuis 2021. Sur la côte, Loango offre ses éléphants, ses buffles et ses hippopotames, visibles jusque sur le sable. Face à Libreville, le littoral du parc de Pongara, où la forêt rejoint l'océan, accueille de novembre à mars environ la ponte des tortues luth. Ce capital naturel est un argument de voyage évident. Il ne suffit pourtant pas à faire une filière. La faune vit en liberté : une rencontre ne se programme pas, ce qui oblige les opérateurs à vendre du temps et de la patience plutôt qu'un spectacle. Les professionnels interrogés pour cette enquête dressent la même liste d'obstacles.",
      },
      {
        type: "image",
        mediaKey: "parc-lope",
        caption:
          "Savanes et forêts de la Lopé, espace inscrit au patrimoine mondial de l'UNESCO depuis 2007.",
      },
      {
        type: "stat",
        value: "13",
        label:
          "Parcs nationaux créés en 2002, qui couvrent près de 11 % du territoire",
        source: "Données publiques",
      },
      {
        type: "heading",
        level: 2,
        text: "Accès, coût, lits, guides : les freins du secteur",
      },
      {
        type: "paragraph",
        text: "Le premier frein est la distance. Depuis Libreville, les parcs les plus éloignés demandent de combiner vol, route et pirogue, parfois pendant une journée entière. Quelques destinations échappent à cette règle : la presqu'île de la Pointe-Denis, à une vingtaine de minutes de bateau de Libreville, se visite en un week-end, mais elle ne montre qu'une partie de ce que les parcs ont à offrir. Pour les autres sites, le prix suit : selon les opérateurs interrogés, le transport intérieur pèse souvent autant que le séjour lui-même, et cinq jours dans un parc peuvent dépasser un million de FCFA par personne. Le deuxième frein tient à la capacité d'accueil. On estime à 400 lits environ l'offre cumulée des lodges et des campements proches des parcs, répartis entre une trentaine d'établissements. Un seul groupe suffit à remplir un site. Les structures sont petites, souvent isolées, et certaines ferment hors saison faute de clients réguliers. Cette taille réduite ménage les sites, mais elle plafonne aussi les recettes.",
      },
      {
        type: "stat",
        value: "≈ 400 lits",
        label:
          "Capacité cumulée estimée des lodges et campements proches des parcs",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "quote",
        text: "*Un client paie deux fois* : le séjour, puis le trajet. Le second poste dépasse parfois le premier. Nous ne pouvons pas baisser nos prix sans baisser la qualité, et nous ne contrôlons pas le prix du trajet.",
        attribution: "Hortense Mboumba, gérante du lodge Passe-aux-Hérons",
      },
      {
        type: "paragraph",
        text: "Le troisième frein est plus discret : la formation des guides. L'écoguide est le visage du parc. Il lit les traces, anticipe les rencontres, protège le visiteur autant que l'animal. Le métier s'apprend en grande partie sur le terrain, au fil de formations courtes et inégales selon les sites. « On nous apprend à reconnaître les espèces, explique Landry Mabika, écoguide depuis neuf ans. On nous apprend moins à raconter la forêt, à gérer un groupe fatigué ou à parler anglais après trois jours de pluie. » Plusieurs opérateurs réclament un cursus reconnu, par niveaux, qui permettrait à un jeune de bâtir une carrière plutôt que d'enchaîner les saisons. Selon eux, trop de guides formés quittent le métier après quelques années, faute de perspective de revenu stable.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que demandent les opérateurs, ce que gagnent les villages",
      },
      {
        type: "paragraph",
        text: "Les demandes des opérateurs convergent. Ils souhaitent des liaisons plus régulières vers les zones d'accueil, qu'elles soient aériennes, fluviales ou routières. Ils veulent connaître les règles de visite et le calendrier d'accès assez tôt pour vendre leurs séjours un an à l'avance. Ils demandent enfin des guides formés selon un référentiel commun, et des investissements concertés dans les pistes et les pontons. Plusieurs suggèrent aussi de mutualiser la promotion des parcs à l'étranger, aujourd'hui dispersée entre chaque établissement. « Nous ne cherchons pas le tourisme de masse, résume Sidonie Ayingone, directrice d'une agence réceptive de Libreville. Nous voulons pouvoir promettre une date et un prix, et les tenir. » Pour les professionnels, la prévisibilité compte autant que le tarif : un voyageur étranger réserve de loin, et renonce au moindre doute.",
      },
      {
        type: "quote",
        text: "Avant, la lagune ne nous donnait que du poisson. Maintenant, une sortie en pirogue avec des visiteurs paie une journée de travail. Mais sans clients, il n'y a rien. Il faudrait que cela dure toute l'année.",
        attribution:
          "Félicien Mapangou, piroguier dans un village riverain d'un parc",
      },
      {
        type: "paragraph",
        text: "Pour les villages riverains, les retombées existent, mais elles restent modestes et saisonnières. Piroguiers, cuisinières, artisans et quelques guides y trouvent un revenu d'appoint. Selon nos interlocuteurs, certains lodges achètent poisson fumé et légumes sur place et reversent une redevance à un fonds villageois. Dans un village proche d'un parc, un comité réunit désormais artisans et piroguiers pour répartir les visiteurs entre les familles, afin que les mêmes ne soient pas toujours sollicités. La cohabitation n'a rien d'automatique : les éléphants que les visiteurs viennent admirer piétinent aussi, à l'occasion, les plantations de manioc et de banane. Pour que le pari tienne, le voisinage d'un parc devra enrichir ceux qui vivent à ses portes autant qu'il attire ceux qui passent. Nous poursuivrons ces reportages dans la rubrique [Parcs nationaux](/rubrique/tourisme/parcs-nationaux).",
      },
    ],
  },
  {
    slug: "pointe-denis-week-end-plage-tortues-luth",
    title:
      "Pointe-Denis : à vingt minutes de Libreville, un week-end entre plage et tortues luth",
    dek: "Une traversée en bateau, une plage de sable clair, des nuits de veille pour voir pondre les tortues luth : guide pratique d'un week-end sur la presqu'île, avec les règles à respecter et un budget indicatif.",
    categorySlug: "tourisme",
    subCategorySlug: "destinations",
    authorSlug: "yannick-moussavou",
    heroMediaKey: "pointe-denis",
    galleryMediaKeys: ["littoral-pongara"],
    keyPoints: [
      "La Pointe-Denis se rejoint en bateau depuis Libreville en une vingtaine de minutes, ce qui permet un week-end sans long trajet.",
      "De novembre à mars environ, des écoguides encadrent des sorties nocturnes pour assister à la ponte des tortues luth, sans garantie de rencontre.",
      "Les règles sont strictes (pas de lumière, pas de contact, une distance à tenir) et un week-end coûte de 60 000 à 95 000 FCFA par personne, selon nos estimations.",
    ],
    seo: {
      description:
        "Traversée, hébergements, sorties nocturnes pour voir les tortues luth, règles et budget : le guide d'un week-end à la Pointe-Denis.",
      keywords: [
        "Pointe-Denis",
        "tortues luth",
        "Pongara",
        "week-end Libreville",
        "écotourisme",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "pointe-denis",
      "tortues-luth",
      "pongara",
      "week-end",
      "plage",
      "libreville",
    ],
    daysAgo: 6,
    views: 1760,
    body: [
      {
        type: "paragraph",
        text: "Samedi, huit heures. Sur le quai de Libreville, les derniers sacs passent de main en main et le bateau s'écarte du bord. La ville recule : tours, grues, façade de béton. En face, une ligne verte, basse et continue. Vingt minutes plus tard, le bateau accoste devant la plage de la Pointe-Denis. Les passagers descendent, sac à l'épaule, et lèvent les yeux vers les arbres. Pas d'embouteillage, pas de klaxons, seulement le bruit des vagues. Pour les habitants de la capitale, c'est un dépaysement rapide, et simple à organiser.",
      },
      {
        type: "paragraph",
        text: "La traversée est le premier atout de la destination. Plusieurs opérateurs relient Libreville à la Pointe-Denis en une vingtaine de minutes, selon la mer. Les horaires dépendent de la marée et de la météo : mieux vaut réserver la veille, surtout le week-end, et confirmer l'heure du retour avant de partir. Comptez environ 20 000 FCFA l'aller-retour par personne, selon nos estimations, davantage pour une embarcation privée. Prévoyez un vêtement contre les embruns, et protégez vos appareils. Au retour, gardez une marge avant un vol ou un rendez-vous : la mer ne suit pas toujours l'horaire.",
      },
      {
        type: "heading",
        level: 2,
        text: "Où dormir, où manger",
      },
      {
        type: "paragraph",
        text: "Sur la presqu'île, l'hébergement reste simple : bungalows en bois, auberges familiales, campements au bord de la plage. Comptez de 30 000 à 70 000 FCFA la nuit en chambre double, selon le confort. Les repas se commandent le plus souvent à l'avance, et mieux vaut prévenir de son arrivée. La carte tient en quelques plats : poisson grillé, manioc, bananes plantain. Les places sont comptées. De novembre à mars, quand la ponte attire les visiteurs, les week-ends se remplissent vite. Emportez de l'eau, un répulsif contre les moustiques et une protection solaire.",
      },
      {
        type: "quote",
        text: "Les gens croient que nous sommes à côté de la ville, donc qu'il y aura toujours de la place. De novembre à mars, ce n'est pas vrai. Il faut réserver, et nous le répétons au téléphone.",
        attribution: "Mireille Ngomo, gérante d'une auberge familiale",
      },
      {
        type: "heading",
        level: 2,
        text: "La saison des tortues luth",
      },
      {
        type: "paragraph",
        text: "Autour de la Pointe-Denis, le parc national de Pongara accueille, de novembre à mars environ, la ponte des tortues luth, la plus grande espèce de tortue marine. Les femelles sortent de l'eau la nuit, creusent un nid dans le sable, y déposent leurs œufs puis regagnent la mer. Des sorties nocturnes, encadrées par des écoguides, permettent d'y assister en petits groupes. Elles durent plusieurs heures et ne garantissent rien : certains soirs, aucune femelle ne vient. Quand une tortue apparaît, la scène est lente et silencieuse : on entend le ressac, le souffle de l'animal, le sable qui retombe. Le rendez-vous se fixe en fin de soirée, auprès du guide, qui choisit la plage selon les observations de la veille.",
      },
      {
        type: "quote",
        text: "On marche dans le noir, sans lampe, sur le sable. Quand une femelle sort de l'eau, on s'arrête, on attend, on la laisse faire. *La tortue n'est pas là pour nous.* Si l'on a la chance de la voir, il ne faut pas lui donner une raison de repartir sans avoir pondu.",
        attribution: "Judicaël Ovono, écoguide",
      },
      {
        type: "paragraph",
        text: "Les écoguides rappellent quelques règles avant chaque départ, et elles ne se négocient pas :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Aucune lumière : ni lampe, ni flash, ni écran allumé.",
          "Rester derrière le guide et garder la distance qu'il indique.",
          "Ne jamais toucher une tortue, ni gêner son passage vers la mer.",
          "Parler à voix basse, sans courir ni se placer face à l'animal.",
          "Ne rien laisser sur la plage : emporter ses déchets.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Le budget d'un week-end, par personne",
      },
      {
        type: "paragraph",
        text: "Le week-end tient en quatre postes. La traversée aller-retour revient à environ 20 000 FCFA par personne. La chambre double coûte de 30 000 à 70 000 FCFA la nuit, soit 15 000 à 35 000 FCFA chacun. Les repas du week-end représentent de 15 000 à 25 000 FCFA, et la sortie nocturne encadrée de 10 000 à 15 000 FCFA. Ces fourchettes varient selon la saison et le confort, et excluent les boissons et les dépenses personnelles.",
      },
      {
        type: "stat",
        value: "60 000 à 95 000 FCFA",
        label:
          "Budget indicatif d'un week-end à la Pointe-Denis, par personne, à deux dans la chambre",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Ce week-end ne remplace pas un séjour dans un grand parc, mais il en donne un avant-goût accessible : un trajet court, une plage, une nuit dehors pour regarder un animal venir pondre. La nature ne suit aucun horaire. Mieux vaut partir sans exiger de rencontre : le week-end vaut déjà pour la plage, le calme et la traversée. D'autres idées d'escapade sont réunies dans notre rubrique [Destinations](/rubrique/tourisme/destinations).",
      },
    ],
  },
  {
    slug: "hebergement-liaisons-interieures-voyager-au-gabon",
    title:
      "Voyager au Gabon : des lodges trop rares, des liaisons intérieures trop chères",
    dek: "Peu de lits autour des parcs, des vols intérieurs onéreux, des pistes parfois impraticables : l'infrastructure reste le premier frein du tourisme gabonais. Une agence et une école hôtelière disent ce qu'elles attendent.",
    categorySlug: "tourisme",
    subCategorySlug: "hotellerie-transport",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "lodge-loango",
    galleryMediaKeys: ["aeroport-libreville"],
    keyPoints: [
      "Les lodges et campements proches des parcs offrent, selon nos estimations, environ 400 lits, ce qui limite la taille des groupes et la fréquentation.",
      "Les vols intérieurs, peu nombreux et chers, et des pistes parfois impraticables en saison des pluies renchérissent chaque déplacement.",
      "Agences et écoles hôtelières demandent des rotations régulières, des tarifs lisibles et des formations adaptées au travail en lodge.",
    ],
    seo: {
      description:
        "Capacité d'hébergement réduite, vols intérieurs chers, pistes difficiles : les freins du tourisme au Gabon et ce que demandent les professionnels.",
      keywords: [
        "tourisme Gabon",
        "lodges",
        "vols intérieurs",
        "hébergement",
        "Transgabonais",
        "formation hôtelière",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "hebergement",
      "lodges",
      "vols-interieurs",
      "transgabonais",
      "formation-hoteliere",
    ],
    daysAgo: 11,
    views: 1240,
    body: [
      {
        type: "paragraph",
        text: "Cédric Ekogha a refait le calcul trois fois. Pour envoyer six voyageurs de Libreville vers un lodge de la côte puis les ramener, il faut additionner billets d'avion, transfert en bateau, deux nuits en pension complète et un guide. Le total fait hésiter ses clients avant même qu'ils aient regardé une photo du site. Directeur d'une agence réceptive de Libreville, il connaît la scène par cœur : l'enthousiasme du premier appel, le silence après le devis. Le problème n'est pas l'attrait des parcs. C'est ce qu'il faut traverser pour les atteindre : un hébergement compté, des liaisons rares, des pistes à la merci de la pluie.",
      },
      {
        type: "heading",
        level: 2,
        text: "Des lits trop peu nombreux",
      },
      {
        type: "paragraph",
        text: "Le premier verrou est la capacité d'hébergement. Autour des parcs, on estime à 400 lits environ l'offre des lodges et des campements, répartis entre une trentaine d'établissements. La plupart comptent entre huit et vingt lits. Un groupe d'une quinzaine de personnes occupe donc un site entier, et l'agence doit parfois le scinder entre deux lodges éloignés. Plusieurs établissements ferment hors saison, faute de clients réguliers. Les hôtels des grandes villes, pensés pour les voyages d'affaires, ne répondent pas à la demande des voyageurs de nature, qui veulent dormir à la lisière de la forêt.",
      },
      {
        type: "stat",
        value: "≈ 400 lits",
        label:
          "Capacité cumulée estimée des lodges et campements proches des parcs",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "quote",
        text: "Je ne peux pas vendre un circuit de quinze personnes. Il faudrait deux lodges, deux transferts, deux guides. À ce stade, il est plus simple de proposer une autre destination.",
        attribution:
          "Cédric Ekogha, directeur d'une agence réceptive de Libreville",
      },
      {
        type: "heading",
        level: 2,
        text: "Des liaisons intérieures trop chères",
      },
      {
        type: "paragraph",
        text: "Le second verrou tient au transport. Les rotations aériennes intérieures sont peu nombreuses, et leurs prix reflètent cette étroitesse : peu de passagers à répartir sur des coûts d'exploitation élevés. Un aller-retour sur une liaison intérieure tourne souvent autour de 150 000 FCFA, selon les agences consultées, hors bagages et transferts. Pour une famille de quatre personnes, le transport peut peser plus lourd que le séjour. Ces explications sont en partie structurelles ; elles n'en pèsent pas moins sur la décision d'achat. Un horaire modifié suffit en outre à bouleverser un programme réglé à la nuitée près.",
      },
      {
        type: "stat",
        value: "≈ 150 000 FCFA",
        label:
          "Prix indicatif d'un aller-retour sur une liaison aérienne intérieure, hors bagages et transferts",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Reste le sol. Les pistes routières comme les pistes d'atterrissage sont inégalement entretenues, et la saison des pluies rend certains tronçons impraticables, ce qui oblige à reporter ou à annuler. Le train pourrait soulager une partie de la demande. Le Transgabonais relie Owendo à Franceville : il offre un axe précieux pour traverser le pays, mais il ne dessert pas le littoral, où se trouvent plusieurs parcs. Pour combiner rail, route et pirogue, les agences assemblent elles-mêmes des maillons qui ne se parlent pas. L'organisation reste artisanale, et chaque maillon ajoute son aléa. Pour se prémunir, les agences ajoutent une nuit de marge avant les vols internationaux de retour, ce qui renchérit encore le séjour.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que demandent les professionnels",
      },
      {
        type: "paragraph",
        text: "Interrogées séparément, une agence réceptive et une école hôtelière formulent des demandes proches. La première réclame des rotations aériennes à jours fixes vers les zones d'accueil, des tarifs connus longtemps à l'avance et un entretien régulier des pistes les plus empruntées. La seconde plaide pour des stages en lodge intégrés au cursus, et pour des formations qui ne se limitent pas à l'hôtellerie de ville. Les deux dressent le même constat : sans accueil de qualité, un bon prix de transport ne suffit pas ; sans transport accessible, un bon accueil reste invisible.",
      },
      {
        type: "quote",
        text: "Nous formons des réceptionnistes pour les hôtels de ville. Un lodge demande autre chose : savoir cuisiner, conduire un bateau, parler anglais, raconter le lieu. Ces métiers s'apprennent *en immersion*, pas seulement en classe.",
        attribution:
          "Armelle Koumba, directrice des études d'une école hôtelière de Libreville",
      },
      {
        type: "paragraph",
        text: "L'école accueille environ cinquante élèves par promotion, selon elle, dont une minorité seulement vise les lodges, faute de débouchés identifiés. Les stages seraient possibles si les établissements pouvaient encadrer des stagiaires toute l'année. C'est le cercle que décrivent les professionnels : peu de lits, donc peu de visiteurs ; peu de visiteurs, donc peu d'emplois formés. Le tourisme de nature gabonais attend moins un projet spectaculaire qu'une suite de maillons fiables. Pour voir ce que ces sites offrent une fois sur place, rendez-vous dans notre rubrique [Parcs nationaux](/rubrique/tourisme/parcs-nationaux).",
      },
    ],
  },
  {
    slug: "mvet-epopee-fang-nouvelle-generation",
    title: "Mvet : une nouvelle génération reprend le chant des épopées",
    dek: "Dans des ateliers de Libreville et du Woleu-Ntem, des élèves apprennent auprès des anciens la cithare des épopées fang. Certains la mêlent aux musiques actuelles. Reste à décider comment enregistrer des récits qui se transmettent à l'oral.",
    categorySlug: "culture",
    subCategorySlug: "musique",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "mvet-instrument",
    keyPoints: [
      "Le mvet, cithare sur tige à calebasses de résonance, accompagne les épopées fang, une tradition partagée avec le Cameroun et la Guinée équatoriale.",
      "Des ateliers à Libreville et à Oyem, dans le Woleu-Ntem, organisent la transmission de maître à élève auprès d'un public jeune.",
      "Certains musiciens mêlent le mvet aux musiques actuelles, tandis que l'enregistrement des récits reste un chantier ouvert.",
    ],
    seo: {
      description:
        "Ateliers à Libreville et dans le Woleu-Ntem, jeunes joueurs, métissages avec les musiques actuelles : la relève du mvet, instrument des épopées fang.",
      keywords: [
        "mvet",
        "épopée fang",
        "mbom-mvet",
        "musique traditionnelle gabonaise",
        "Woleu-Ntem",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "mvet",
      "epopee-fang",
      "musique-traditionnelle",
      "transmission",
      "woleu-ntem",
    ],
    daysAgo: 2,
    views: 2650,
    body: [
      {
        type: "paragraph",
        text: "Samedi après-midi, dans une salle prêtée par un centre culturel de Libreville, un adolescent tend la main vers les cordes d'un mvet. Il hésite. Face à lui, Nadège Mintsa, qui joue de l'instrument depuis l'enfance, lui prend les doigts et les guide sur les cordes. Le son qui sort est sec, boisé, prolongé par les calebasses. Autour d'eux, une douzaine d'élèves, de dix à vingt-cinq ans, écoutent sans parler. Ils sont venus apprendre ce que beaucoup de leurs parents n'ont entendu qu'à la radio : le chant des épopées.",
      },
      {
        type: "paragraph",
        text: "Le mvet est une cithare sur tige, dotée de calebasses de résonance. Il accompagne les épopées fang, récitées et chantées par un barde que l'on appelle le « mbom-mvet ». Cette tradition est partagée avec le Cameroun et la Guinée équatoriale. Le récit, long, se transmet à l'oral : il parle de héros, de combats et de sagesse, et chaque barde y ajoute sa voix, sa manière, ses commentaires. Longtemps, on devenait mbom-mvet auprès d'un maître, au fil des années, sans cahier ni diplôme. Aujourd'hui, cette filiation se réinvente en ateliers, le week-end.",
      },
      {
        type: "heading",
        level: 2,
        text: "De maître à élève",
      },
      {
        type: "paragraph",
        text: "L'atelier de Libreville existe depuis deux ans. Il est animé par l'association Mvet Demain, qui en tient un second à Oyem, chef-lieu du Woleu-Ntem, province du nord du pays, frontalière du Cameroun et de la Guinée équatoriale. Le principe est simple : un maître, quelques élèves, des séances le week-end. On apprend d'abord à accorder l'instrument, puis à tenir un rythme, enfin à raconter. Chaque séance commence par un temps d'écoute : le maître joue, les élèves se taisent, puis chacun reprend la phrase à son tour. Les anciens y retrouvent une écoute que la ville leur accorde rarement. À Oyem, plusieurs maîtres viennent des villages voisins un week-end par mois pour enseigner.",
      },
      {
        type: "stat",
        value: "≈ 60 élèves",
        label:
          "Apprentis accueillis chaque année dans les ateliers de Libreville et d'Oyem",
        source: "Association Mvet Demain (estimation)",
      },
      {
        type: "quote",
        text: "On ne s'assoit pas devant un mvet comme devant une guitare. Il faut d'abord *se taire et écouter* le maître. Les notes viennent après. Celui qui veut aller trop vite n'apprend pas l'histoire, il n'apprend que le bruit.",
        attribution: "Nadège Mintsa, joueuse de mvet et animatrice d'atelier",
      },
      {
        type: "heading",
        level: 2,
        text: "Quand le mvet rencontre les musiques actuelles",
      },
      {
        type: "paragraph",
        text: "Une partie des jeunes ne s'en tient pas au répertoire ancien. Aymeric Edzang, 24 ans, joue de la guitare dans un groupe de Libreville. Il a introduit un mvet dans le groupe, soutenu par une basse et des percussions. Le résultat n'est ni une reconstitution ni une fantaisie : les phrases du récit demeurent, mais le tempo s'accélère, et des refrains en français côtoient les passages en fang. Certains puristes froncent les sourcils. D'autres voient dans ces métissages la meilleure chance de faire entendre l'instrument à des auditeurs qui ne fréquentent plus les veillées.",
      },
      {
        type: "quote",
        text: "Mon grand-père m'aurait fait recommencer dix fois. Mais s'il m'entendait jouer avec mes amis, je crois qu'il reconnaîtrait les phrases. L'important, c'est qu'on continue à les chanter.",
        attribution: "Aymeric Edzang, guitariste et élève de l'atelier",
      },
      {
        type: "heading",
        level: 2,
        text: "Enregistrer sans figer",
      },
      {
        type: "paragraph",
        text: "La question la plus délicate est celle de l'enregistrement. Les récits sont longs et se transmettent de bouche à oreille : quand un maître disparaît, une part du répertoire disparaît avec lui. L'association a commencé à enregistrer des veillées, avec l'accord des maîtres, et à transcrire certains passages. Les maîtres posent leurs conditions : être présents lors de la relecture, valider chaque transcription, refuser toute diffusion commerciale sans leur accord. Reste à décider qui conserve ces archives, comment on les partage et à quelles conditions. Les anciens craignent qu'un enregistrement fige un art qui vit de variations ; les jeunes, eux, y voient un moyen de ne rien perdre. Les deux positions s'accordent sur un point : un fichier audio ne remplace pas l'apprentissage.",
      },
      {
        type: "stat",
        value: "≈ 40 heures",
        label:
          "Récits enregistrés avec l'accord des maîtres depuis le lancement du programme",
        source: "Association Mvet Demain (estimation)",
      },
      {
        type: "paragraph",
        text: "Pour l'instant, le chantier avance au rythme des disponibilités des uns et des autres. L'atelier de Libreville cherche un local plus grand, celui d'Oyem un second instrument. L'association aimerait aussi inviter des joueurs du Cameroun et de la Guinée équatoriale, pour comparer les manières de dire un même récit. À la fin de la séance, l'adolescent du début rend le mvet à Nadège Mintsa, les doigts rougis. Il demande quand reprendra le prochain cours. Plus d'articles sur la création gabonaise dans notre rubrique [Musique](/rubrique/culture/musique).",
      },
    ],
  },
  {
    slug: "patrimoine-inventaire-collections-musees-gabon",
    title: "Patrimoine : un inventaire pour sortir les collections de l'ombre",
    dek: "Restaurateurs et étudiants photographient, mesurent et décrivent masques, parures et instruments, en lien avec les musées. L'objectif : un catalogue consultable, et des collections mieux protégées de l'humidité.",
    categorySlug: "culture",
    subCategorySlug: "patrimoine",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "musee-national",
    keyPoints: [
      "Une association de restaurateurs et d'étudiants photographie et décrit masques, parures et instruments, en lien avec les musées, dont le musée national.",
      "Le climat équatorial, chaud et humide, menace le bois, les fibres et les métaux : la conservation préventive devient une priorité.",
      "Le collectif veut numériser les fiches et ouvrir un catalogue en ligne, pour que le public et les chercheurs puissent consulter les objets.",
    ],
    seo: {
      description:
        "Photographier, décrire, numériser : un collectif de restaurateurs et d'étudiants dresse l'inventaire d'objets conservés dans les musées gabonais.",
      keywords: [
        "patrimoine Gabon",
        "inventaire",
        "musée national",
        "conservation préventive",
        "numérisation",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "patrimoine",
      "inventaire",
      "musee-national",
      "conservation",
      "numerisation",
    ],
    daysAgo: 9,
    views: 980,
    body: [
      {
        type: "paragraph",
        text: "Devant une vitrine du musée national, à Libreville, une étudiante enfile une paire de gants. Elle pose un bracelet de métal sur un fond gris, place une règle graduée à côté, ajuste l'éclairage. Un déclic, puis un autre : face, profil, détail du décor gravé. À la table voisine, un camarade note les dimensions, la matière, l'état de la surface. Le rythme est lent : une quinzaine de minutes par pièce, davantage pour un objet fragile. Dans la salle, quelques visiteurs s'arrêtent, intrigués par ce travail minutieux qui n'a rien d'une exposition. C'est pourtant le début d'un projet de longue haleine : donner à chaque objet une fiche, une photographie et un numéro.",
      },
      {
        type: "paragraph",
        text: "L'opération est conduite par le Collectif Inventaire Ouvert, une association de restaurateurs, d'étudiants et de bénévoles. Elle se déroule en lien avec les musées, dont le musée national, partenaire du projet. Les séances ont lieu le week-end et pendant les vacances universitaires, avec du matériel de prise de vue prêté par les membres. Masques, parures, instruments de musique : chaque pièce reçoit la même fiche, remplie à plusieurs mains et composée de cinq éléments :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Photographies sous plusieurs angles, avec échelle et fond neutre",
          "Dimensions et matériaux",
          "État de conservation",
          "Numéro d'inventaire",
          "Origine connue ou supposée, avec la source de l'information",
        ],
      },
      {
        type: "stat",
        value: "≈ 1 200 objets",
        label:
          "Pièces photographiées et décrites depuis le lancement de l'inventaire",
        source: "Collectif Inventaire Ouvert (bilan interne)",
      },
      {
        type: "heading",
        level: 2,
        text: "Un climat qui travaille contre les objets",
      },
      {
        type: "paragraph",
        text: "Le Gabon a un climat équatorial, chaud et humide. Pour des collections, c'est une épreuve permanente. Le bois se déforme et attire les insectes qui s'en nourrissent. Les fibres, les cuirs et les textiles moisissent. Les alliages se couvrent de produits de corrosion. Les restaurateurs parlent de conservation préventive : mesurer l'humidité, aérer, protéger les pièces dans des boîtes adaptées, contrôler régulièrement leur état. Rien de spectaculaire, mais ces gestes valent mieux qu'une restauration coûteuse après dommage. Encore faut-il savoir ce que l'on possède, objet par objet, et dans quel état il se trouve : c'est précisément ce que l'inventaire permet.",
      },
      {
        type: "quote",
        text: "Dans ce climat, un objet que l'on ne regarde pas est un objet qui se dégrade. L'inventaire nous oblige à regarder, à comparer d'une visite à l'autre, et à repérer à temps le début d'une moisissure ou d'une fissure.",
        attribution:
          "Élodie Mouanga, restauratrice, coordinatrice du collectif",
      },
      {
        type: "heading",
        level: 2,
        text: "Savoir d'où vient chaque pièce",
      },
      {
        type: "paragraph",
        text: "Comme dans beaucoup de musées du monde, l'origine de certaines pièces est mal documentée : village de provenance, date de fabrication, usage, parfois la communauté qui l'a produite. Les registres anciens sont incomplets, les étiquettes se décollent. Un bracelet peut avoir changé de main plusieurs fois avant d'entrer dans une collection. Le collectif croise les informations disponibles et recueille, quand c'est possible, des témoignages d'anciens ou d'artisans qui reconnaissent un style, un geste, un décor. Il s'agit d'ajouter des éléments, jamais d'en inventer. Chaque fiche indique donc trois choses : ce qui est établi, ce qui est supposé, ce qui reste inconnu.",
      },
      {
        type: "quote",
        text: "Un masque dont on ignore la provenance est un masque à moitié muet. Il reste beau, mais il ne dit plus qui l'a sculpté, pour qui, pour quel usage. Documenter, c'est *lui rendre la parole* sans lui faire dire ce qu'il ne dit pas.",
        attribution: "Constant Mombo, historien de l'art à l'université",
      },
      {
        type: "heading",
        level: 2,
        text: "Numériser, ouvrir au public",
      },
      {
        type: "paragraph",
        text: "L'étape suivante est la numérisation. Photographies et fiches alimentent une base de données que le collectif veut ouvrir en ligne, avec des images de bonne qualité et des textes en français, puis, à terme, en langues nationales. Le public pourrait y découvrir des objets que les salles ne peuvent pas toujours montrer, et les établissements scolaires s'en servir pour préparer leurs visites. Une première version, limitée à quelques centaines de fiches, pourrait ouvrir à titre d'essai. Les contraintes sont concrètes : stockage sécurisé des fichiers, conditions d'usage des images, accès à Internet hors de la capitale. Les responsables du collectif rappellent que le numérique complète les salles d'exposition sans les remplacer : on ne ressent pas un masque sur un écran.",
      },
      {
        type: "paragraph",
        text: "Le collectif espère achever une première série d'ici dix-huit mois, puis étendre l'opération à d'autres collections, publiques ou privées. Il cherche des financements, du matériel de prise de vue et surtout des volontaires. En attendant, chaque séance ajoute quelques fiches au catalogue. Retrouvez nos reportages sur la mémoire du pays dans la rubrique [Patrimoine](/rubrique/culture/patrimoine).",
      },
    ],
  },
];
