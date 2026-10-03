import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubriques « Société » et « Sport ».
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_2: readonly SeedArticle[] = [
  {
    slug: "rentree-scolaire-salles-de-classe-effectifs",
    title:
      "Rentrée scolaire : des salles de classe rénovées, des effectifs toujours chargés",
    dek: "Dans une école publique de Libreville, les huit salles de classe ont été remises en état pendant les vacances. Les classes restent pourtant pleines, deux postes d'enseignants sont vacants et les fournitures pèsent sur les familles.",
    categorySlug: "societe",
    subCategorySlug: "education",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "formation-universite",
    keyPoints: [
      "À l'école publique des Frangipaniers, à Libreville, les huit salles de classe ont été remises en état pendant les vacances : toitures, sols, éclairage et tableaux.",
      "Avec environ 640 élèves pour douze classes, l'effectif moyen dépasse cinquante élèves, et quatre salles servent deux fois par jour grâce à la double vacation.",
      "Deux postes d'enseignants restent vacants, et les fournitures coûtent aux familles de 30 000 à 50 000 FCFA par enfant.",
    ],
    seo: {
      description:
        "Reportage dans une école publique de Libreville : salles rénovées, double vacation, postes vacants et coût des fournitures pour les familles à la rentrée.",
      keywords: [
        "rentrée scolaire",
        "école publique",
        "Libreville",
        "effectifs",
        "double vacation",
        "fournitures scolaires",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "rentree-scolaire",
      "ecole-publique",
      "libreville",
      "effectifs",
      "fournitures-scolaires",
    ],
    daysAgo: 3,
    views: 2050,
    body: [
      {
        type: "paragraph",
        text: "Sept heures, dans la cour de l'école publique des Frangipaniers, à Libreville. L'odeur de peinture fraîche flotte encore devant le bâtiment principal. Les élèves du matin se rangent par classes, cartable sur le dos, sous le regard des maîtres. Une cloche, un coup de sifflet, et les rangs entrent dans les salles. Ceux de l'après-midi, eux, n'arriveront qu'à midi. Ici, la rentrée a deux visages : des murs refaits à neuf, et des effectifs qui n'ont presque pas bougé.",
      },
      {
        type: "heading",
        level: 2,
        text: "Des salles remises en état",
      },
      {
        type: "paragraph",
        text: "Pendant les grandes vacances, les huit salles de classe ont été réhabilitées. Les toitures en tôle ont été remplacées, les plafonds repris, les sols carrelés. L'installation électrique a été remise aux normes, les tableaux et les tables-bancs changés. Dans la cour, le point d'eau fonctionne de nouveau et les deux blocs sanitaires ont été repris. Le chantier, de l'ordre de 45 millions de FCFA, s'est achevé quelques jours avant la reprise des cours. Sous le préau, une frise colorée, peinte par les enseignants, remplace les traces d'humidité. Les jours de pluie, l'eau ne coule plus sur les bancs.",
      },
      {
        type: "quote",
        text: "Un enfant apprend mieux quand le toit ne fuit pas et que le tableau se lit du fond de la classe. C'est un acquis. Mais une salle refaite à neuf avec cinquante élèves dedans reste *une salle surchargée*.",
        attribution:
          "Honorine Mapangou, directrice de l'école publique des Frangipaniers",
      },
      {
        type: "heading",
        level: 2,
        text: "Des classes pleines, des maîtres manquants",
      },
      {
        type: "paragraph",
        text: "L'école compte environ 640 élèves, répartis en douze classes. Elle ne dispose pourtant que de huit salles. Quatre d'entre elles servent donc deux fois par jour : une classe de CP ou de CE y travaille le matin, de 7 h 30 à midi, puis une classe de CM lui succède, de midi et demi à 17 h. C'est la double vacation. Elle impose aux familles des horaires décalés, surtout quand deux frères ou sœurs ne sont pas scolarisés à la même heure.",
      },
      {
        type: "stat",
        value: "53 élèves",
        label:
          "Effectif moyen par classe dans l'école : environ 640 élèves pour douze classes",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Le manque d'enseignants pèse sur ce quotidien. Deux postes restent vacants depuis la rentrée, un CE1 et un CM2. Pendant les premières semaines, les collègues se sont relayés pour assurer les cours. Des vacataires dépannent désormais, mais leur présence n'est pas toujours régulière. Quand l'un d'eux manque, les élèves sont répartis dans les classes voisines, et certains s'installent à trois sur une table prévue pour deux. La direction espère l'affectation de deux titulaires avant la fin du trimestre.",
      },
      {
        type: "quote",
        text: "À cinquante élèves, on ne suit pas chaque enfant. Je corrige moins de cahiers, je donne moins d'exercices individuels. On gère un groupe, on n'enseigne plus à chacun.",
        attribution: "Évariste Ibinga, enseignant en CM1",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que coûte la rentrée aux familles",
      },
      {
        type: "paragraph",
        text: "À la maison, la rentrée se compte en billets. Cahiers, livres, ardoise, blouse, sac, chaussures : la liste remise aux parents est longue. Pour un enfant, la facture se situe entre 30 000 et 50 000 FCFA selon les achats. Le total grimpe vite dans les familles où plusieurs enfants sont scolarisés. Beaucoup étalent les dépenses ou récupèrent les manuels des aînés. Certains achètent d'abord les cahiers et repoussent le reste à la fin du mois.",
      },
      {
        type: "paragraph",
        text: "L'école cherche à limiter la dépense. La liste a été ramenée à l'essentiel, et les enseignants se sont accordés sur des cahiers identiques d'une classe à l'autre. L'association des parents d'élèves organise un troc de livres usagés dans la cour, chaque samedi du mois de rentrée. Des familles y viennent aussi échanger des blouses et des sacs.",
      },
      {
        type: "quote",
        text: "Avec trois enfants à l'école, la rentrée, c'est à peu près un mois de salaire. On achète en plusieurs fois, on emprunte, on prend d'occasion. Les murs neufs, c'est bien. Mais ce sont des maîtres devant les classes que les familles attendent.",
        attribution: "Joël Ntoutoume, père de trois enfants scolarisés",
      },
      {
        type: "paragraph",
        text: "À midi, la cloche sonne. Les élèves de l'après-midi entrent dans la cour pendant que ceux du matin sortent. Le roulement recommence. La directrice voudrait que ces murs refaits abritent, un jour, des classes moins chargées. Le suivi de la rentrée et de ses moyens se poursuit dans notre rubrique [Éducation](/rubrique/societe/education).",
      },
    ],
  },
  {
    slug: "paludisme-moustiquaires-campagne-moyen-ogooue",
    title:
      "Paludisme : la distribution de moustiquaires démarre dans le Moyen-Ogooué",
    dek: "Porte-à-porte à Lambaréné, pirogues vers les villages du fleuve : une campagne de distribution de moustiquaires imprégnées s'ouvre dans le Moyen-Ogooué. Le vrai test sera leur usage, nuit après nuit.",
    categorySlug: "societe",
    subCategorySlug: "sante",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "hopital-lambarene",
    keyPoints: [
      "Une campagne de distribution de moustiquaires imprégnées d'insecticide démarre dans le Moyen-Ogooué : en porte-à-porte à Lambaréné, en pirogue dans les villages du fleuve.",
      "Environ 38 000 moustiquaires sont prévues, à raison d'une pour deux personnes, pour une province d'environ 75 000 habitants.",
      "Les agents de santé communautaires installent les moustiquaires avec les familles, puis repassent vérifier qu'elles sont bien utilisées.",
    ],
    seo: {
      description:
        "Dans le Moyen-Ogooué, une campagne distribue des moustiquaires imprégnées, du porte-à-porte aux pirogues. L'enjeu : qu'elles servent chaque nuit.",
      keywords: [
        "paludisme",
        "moustiquaires imprégnées",
        "Moyen-Ogooué",
        "Lambaréné",
        "agents de santé communautaires",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "paludisme",
      "moustiquaires",
      "moyen-ogooue",
      "sante-communautaire",
      "prevention",
    ],
    daysAgo: 7,
    views: 1320,
    body: [
      {
        type: "paragraph",
        text: "Six heures, sur la berge de l'Ogooué, à Lambaréné. Dans la brume, deux pirogues motorisées chargent des ballots de plastique bleu. Quatre agents de santé communautaires, gilet jaune sur le dos, calent les paquets sous des bâches. Sur le quai, la liste de contrôle passe de main en main : un ballot, deux ballots, trois. Chaque ballot contient des dizaines de moustiquaires imprégnées d'insecticide. Direction les villages en amont : deux heures de remontée, davantage si le niveau du fleuve est bas.",
      },
      {
        type: "paragraph",
        text: "La campagne a démarré cette semaine dans le Moyen-Ogooué. L'objectif : une moustiquaire pour deux personnes dans chaque foyer, soit environ 38 000 pièces pour une province de l'ordre de 75 000 habitants. Le Collectif Santé du Fleuve, qui réunit des associations locales, coordonne l'opération. Son entrepôt est installé à Lambaréné, à quelques minutes à pied de l'hôpital Albert-Schweitzer. Une soixantaine d'agents de santé communautaires se répartissent le territoire pendant trois semaines, avec une quarantaine de villages à atteindre par le fleuve ou par la piste. Chaque moustiquaire remise est inscrite sur la fiche du foyer, avec le nombre de lits et de personnes à protéger.",
      },
      {
        type: "heading",
        level: 2,
        text: "Du porte-à-porte aux pirogues",
      },
      {
        type: "paragraph",
        text: "La logistique tient de la patience. Les moustiquaires arrivent par camion depuis Libreville, puis sont réparties par zone. À Lambaréné, les agents frappent aux portes, quartier après quartier, avec une liste de ménages et un carnet de pointage. Ils visitent une trentaine de foyers par jour en ville, une dizaine seulement sur le fleuve, où les distances s'allongent. Chaque agent emporte peu de choses : un gilet, un carnet, une corde, quelques clous, et une moustiquaire dépliée pour la démonstration. Selon la saison, un village se rejoint en deux heures ou en quatre. Il faut parfois décharger les ballots sur la berge, les porter, puis les recharger plus loin.",
      },
      {
        type: "quote",
        text: "Les moustiquaires ne sont pas lourdes, c'est le volume qui encombre. Quand la pirogue est pleine, on ne voit plus l'avant. Alors on part tôt, on s'arrête où il faut, et on compte les ballots à chaque escale.",
        attribution: "Prosper Mavoungou, piroguier",
      },
      {
        type: "stat",
        value: "38 000 moustiquaires",
        label:
          "Quantité prévue pour la province, à raison d'une moustiquaire pour deux personnes",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "heading",
        level: 2,
        text: "Distribuer ne suffit pas",
      },
      {
        type: "paragraph",
        text: "Une moustiquaire ne protège que si elle est suspendue au-dessus du lit, chaque nuit, et si ses bords rentrent sous le matelas. Sur le terrain, les équipes rencontrent plusieurs freins, tous concrets. Trois reviennent souvent lors des visites de contrôle :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "La moustiquaire reste dans son emballage, gardée pour plus tard ou pour une grande occasion",
          "La chaleur incite à dormir sans elle, ou dehors, quand l'air est lourd et que le courant est coupé",
          "Le lit est trop large, ou le plafond trop bas, pour la suspendre correctement",
        ],
      },
      {
        type: "quote",
        text: "On ne dépose pas la moustiquaire pour repartir. On la suspend avec la famille, on vérifie que les bords rentrent sous le matelas, on explique qui doit dormir dessous : les enfants de moins de cinq ans et les femmes enceintes d'abord. Puis on revient dans le mois, on regarde, on demande.",
        attribution: "Arlette Nzigou, agente de santé communautaire",
      },
      {
        type: "stat",
        value: "7 foyers sur 10",
        label:
          "Part des foyers visités lors d'un précédent passage où la moustiquaire reçue était suspendue au-dessus d'un lit",
        source: "Collectif Santé du Fleuve",
      },
      {
        type: "heading",
        level: 2,
        text: "Un second passage pour vérifier",
      },
      {
        type: "paragraph",
        text: "Le second passage fait partie du dispositif. Environ un mois après le premier passage, les équipes referont le trajet en sens inverse, village après village. Elles compteront les moustiquaires suspendues, et non celles qui ont été distribuées. Elles noteront aussi l'état de chaque moustiquaire, remplaceront celles qui sont déchirées dans la limite du stock restant, et rappelleront quelques gestes : la laver rarement, sans la frotter, la faire sécher à l'ombre. Elles rappelleront enfin un réflexe : en cas de fièvre, surtout chez un enfant, il faut consulter sans attendre. Un test rapide permet de savoir si le paludisme est en cause.",
      },
      {
        type: "paragraph",
        text: "Les agents le savent : le résultat ne se mesurera pas au nombre de ballots déchargés, mais, dans quelques mois, au nombre de cas de fièvre dans les villages. D'autres reportages de terrain sur la prévention sont réunis dans notre rubrique [Santé](/rubrique/societe/sante).",
      },
    ],
  },
  {
    slug: "emploi-jeunes-apprentissage-entreprise-premier-bilan",
    title:
      "Emploi des jeunes : l'apprentissage en entreprise à l'épreuve du terrain",
    dek: "Un an après son lancement, le programme d'apprentissage « Pierre à Pierre » débouche sur une embauche pour près de six jeunes sur dix de la première promotion. Tutorat, indemnités et transport restent à régler.",
    categorySlug: "societe",
    subCategorySlug: "emploi",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "chantier-btp",
    keyPoints: [
      "Un an après son lancement, le programme d'apprentissage « Pierre à Pierre » compte environ 420 jeunes dans une trentaine d'entreprises du bâtiment.",
      "Près de six apprentis sur dix de la première promotion ont été embauchés par l'entreprise qui les avait formés.",
      "Les tuteurs manquent de temps, les indemnités sont remboursées avec retard aux entreprises et le transport pèse sur le budget des apprentis.",
    ],
    seo: {
      description:
        "Apprentissage « Pierre à Pierre » : près de six jeunes sur dix embauchés à la sortie, mais tutorat, indemnités et transport coincent. Premier bilan.",
      keywords: [
        "apprentissage",
        "emploi des jeunes",
        "bâtiment",
        "alternance",
        "PME",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "apprentissage",
      "emploi-des-jeunes",
      "batiment",
      "alternance",
      "pme",
    ],
    daysAgo: 12,
    views: 1090,
    body: [
      {
        type: "paragraph",
        text: "Sur le chantier d'un immeuble de trois étages, à Libreville, on entend d'abord la bétonnière. La poussière de ciment colle aux bottes. Puis la voix d'un chef d'équipe, qui fait reprendre un mur : il n'est pas d'aplomb. Devant lui, une jeune femme corrige son alignement au fil à plomb et recommence. Lydie Nkoghe a 22 ans. Elle est apprentie maçonne depuis neuf mois chez Komo Bâtiment, une petite entreprise de quatorze salariés.",
      },
      {
        type: "paragraph",
        text: "Elle fait partie des quelque 420 jeunes entrés dans « Pierre à Pierre », un programme d'apprentissage lancé il y a un an par un groupement d'entreprises et de centres de formation. Le principe est simple : trois jours par semaine sur un chantier, deux jours en salle, pendant douze mois. Les cours portent sur la lecture de plans, le calcul des quantités et la sécurité. Les apprentis ont entre 18 et 25 ans. Une trentaine d'entreprises, surtout des PME, les accueillent. Le comité de suivi du programme vient de publier un premier bilan.",
      },
      {
        type: "heading",
        level: 2,
        text: "Des embauches à la sortie",
      },
      {
        type: "paragraph",
        text: "C'est le résultat qui retient l'attention. Le programme a ouvert trois entrées successives de 140 jeunes chacune, mais seule la première a achevé son cycle de douze mois : les deux autres sont encore en formation, ce qui invite à la prudence. Pour cette première promotion, près de six jeunes sur dix ont été embauchés par l'entreprise qui les avait formés. D'autres ont rejoint une entreprise voisine ou un sous-traitant.",
      },
      {
        type: "stat",
        value: "Près de 6 sur 10",
        label:
          "Part des apprentis de la première promotion embauchés à l'issue du cycle par leur entreprise d'accueil",
        source: "Comité de suivi du programme « Pierre à Pierre »",
      },
      {
        type: "paragraph",
        text: "Pour les employeurs, l'intérêt tient en une phrase : ils recrutent des jeunes dont ils connaissent déjà le travail. Ils y gagnent aussi du temps, car un apprenti formé aux méthodes de la maison est opérationnel dès son embauche. Chez Komo Bâtiment, trois des cinq apprentis accueillis ont signé un contrat à l'issue du cycle. Les deux autres ont choisi de poursuivre leur formation.",
      },
      {
        type: "quote",
        text: "Un apprenti que j'ai formé pendant un an, je sais ce qu'il vaut, et lui sait comment nous travaillons. Je n'aurais pas pris ce risque en recrutant au hasard. Et pour le jeune, c'est *un vrai métier* à la sortie, pas un stage de plus.",
        attribution: "Gaspard Nziengui, gérant de Komo Bâtiment",
      },
      {
        type: "heading",
        level: 2,
        text: "Tuteurs, indemnités, transport : ce qui coince",
      },
      {
        type: "paragraph",
        text: "Les difficultés se concentrent sur trois points. D'abord le tutorat : chaque apprenti est suivi par un salarié expérimenté, sans que ce temps de formation soit décompté de sa production. Ensuite l'indemnité, de l'ordre de 60 000 FCFA par mois. L'entreprise l'avance, et le remboursement n'intervient qu'après plusieurs semaines, ce qui pèse sur la trésorerie des petites structures. Enfin le transport, qui reste à la charge des jeunes.",
      },
      {
        type: "quote",
        text: "Je suis tuteur, mais c'est en plus de mon travail. Quand on coule une dalle ou qu'une livraison arrive, je n'ai pas le temps d'expliquer. L'apprenti attend, ou il fait seul. Ce temps de tutorat devrait être prévu, et reconnu.",
        attribution: "Hilaire Mouity, chef de chantier et tuteur",
      },
      {
        type: "stat",
        value: "22 000 FCFA par mois",
        label:
          "Coût estimé du transport d'un apprenti qui habite en périphérie, pour une indemnité de l'ordre de 60 000 FCFA",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Pour les apprentis qui habitent en périphérie, le trajet est une charge. Lydie Nkoghe prend deux taxis à l'aller et deux au retour. Elle quitte son domicile à 5 h 45 pour être sur le chantier à 7 h. Certains matins, elle compte ses pièces avant de partir. Elle arrive fatiguée, mais dit tenir : le métier lui plaît. Face à ces difficultés, le comité de suivi indique travailler sur trois pistes pour la prochaine promotion :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Une prime de tutorat, pour compenser le temps passé auprès des apprentis",
          "Un remboursement des indemnités par virement mobile, dans un délai fixé à l'avance",
          "Un transport groupé depuis les quartiers périphériques vers les chantiers",
        ],
      },
      {
        type: "paragraph",
        text: "Rien n'est acquis. Les entreprises attendent des délais précis, les jeunes un trajet abordable. Sur un point, pourtant, l'expérience a fait ses preuves : un jeune formé sur le chantier trouve plus facilement sa place dans l'entreprise. Le comité de suivi annonce une quatrième entrée, ouverte à d'autres métiers que la maçonnerie : plomberie, électricité, menuiserie. Les offres de formation et d'insertion sont réunies dans notre rubrique [Emploi](/rubrique/societe/emploi).",
      },
    ],
  },
  {
    slug: "football-de-quartier-ecole-de-foot-plage-libreville",
    title:
      "Football : sur une plage de Libreville, une école de quartier forme la relève",
    dek: "Faute de terrain, l'association Étoile du Rivage entraîne une quarantaine de jeunes sur le sable. Bénévoles, bulletin scolaire exigé chaque trimestre, ballons comptés un à un : visite d'une école de foot de quartier.",
    categorySlug: "sport",
    subCategorySlug: "football",
    authorSlug: "yannick-moussavou",
    heroMediaKey: "football-plage",
    keyPoints: [
      "Faute de terrain disponible, l'association Étoile du Rivage fait s'entraîner une quarantaine de jeunes sur une plage de Libreville.",
      "Pour jouer, chaque enfant doit être scolarisé et présenter son bulletin chaque trimestre : l'école passe avant le ballon.",
      "Animée par des bénévoles, l'association manque de ballons, de chasubles et de buts, et cherche des partenaires pour s'équiper.",
    ],
    seo: {
      description:
        "À Libreville, l'association Étoile du Rivage forme une quarantaine de jeunes footballeurs sur la plage, avec des bénévoles et une règle : l'école d'abord.",
      keywords: [
        "football de quartier",
        "école de foot",
        "Libreville",
        "plage",
        "association sportive",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: ["football", "ecole-de-foot", "libreville", "jeunes", "benevolat"],
    daysAgo: 3,
    views: 2480,
    body: [
      {
        type: "paragraph",
        text: "Seize heures trente, la marée descend. Sur une plage du littoral de Libreville, le sable devient ferme et le terrain apparaît. Deux piquets de bois et une corde font office de but. Des tongs marquent la ligne de touche. Une quarantaine de jeunes arrivent en courant, ballon sous le bras. Dans quelques minutes, l'entraînement de l'association Étoile du Rivage commence, pieds nus pour beaucoup.",
      },
      {
        type: "paragraph",
        text: "L'association a été fondée il y a six ans par d'anciens joueurs du quartier. Les premiers entraînements réunissaient une douzaine d'enfants ; le bouche-à-oreille a fait le reste. Elle accueille aujourd'hui 42 jeunes de 8 à 16 ans, filles et garçons, répartis en trois groupes d'âge. Le terrain de terre battue où l'on jouait autrefois a disparu sous les constructions. Il ne restait que la plage, accessible à pied depuis les ruelles voisines.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un terrain que la mer reprend deux fois par jour",
      },
      {
        type: "paragraph",
        text: "La marée dicte le programme. Les séances ont lieu trois fois par semaine, en fin d'après-midi après la classe, et le samedi matin, avec un horaire qui glisse de quelques dizaines de minutes selon la marée. À marée haute, il ne reste qu'une bande de sable étroite : on y travaille les passes courtes et le jeu de tête. À marée basse, on joue à sept contre sept. À l'autre bout de la plage, un filet de volley sert de repère. On partage l'espace avec les volleyeurs, à tour de rôle. Les piquets des buts dorment chez un voisin, qui les garde dans sa cour.",
      },
      {
        type: "quote",
        text: "Sur le sable, un jeune apprend à contrôler le ballon, à garder l'équilibre, à lever la tête. On court moins vite, mais on travaille la technique. Seulement, il faut du matériel : des ballons, des buts, des chasubles. Aujourd'hui, on fait avec ce qu'on a.",
        attribution: "Rodrigue Mintsa, éducateur bénévole de l'association",
      },
      {
        type: "paragraph",
        text: "Une séance dure une heure et demie. Échauffement, conduite de balle entre des bouteilles remplies de sable, jeux de passes en triangle, puis un match. Les 8-10 ans font des relais, les groupes plus âgés travaillent leur placement sur le terrain. Les éducateurs corrigent peu et encouragent beaucoup. À la fin, tout le monde ramasse les déchets laissés sur la plage, avant de rentrer à pied.",
      },
      {
        type: "heading",
        level: 2,
        text: "L'école d'abord",
      },
      {
        type: "paragraph",
        text: "À Étoile du Rivage, une règle prime sur toutes les autres : pour s'entraîner, il faut être scolarisé. Les parents remettent le bulletin à chaque début de trimestre. Un enfant sans bulletin reste sur le banc jusqu'à régularisation. Quand les notes baissent, les bénévoles proposent un soutien scolaire un soir par semaine, animé par une enseignante retraitée. La cotisation est de 2 000 FCFA par mois ; les familles qui ne peuvent pas la payer en sont dispensées.",
      },
      {
        type: "quote",
        text: "Mon fils connaît ses leçons avant d'aller à l'entraînement. Il sait que sans bulletin, il n'y a pas de séance. À la maison, on ne se dispute plus pour les devoirs. Le foot est devenu *une raison de les faire*.",
        attribution: "Estelle Ndombi, mère d'un joueur",
      },
      {
        type: "heading",
        level: 2,
        text: "Neuf bénévoles, peu de matériel",
      },
      {
        type: "paragraph",
        text: "L'association repose sur neuf bénévoles : des éducateurs, une enseignante retraitée, des parents qui assurent l'accompagnement et le goûter. Chacun donne quelques heures par semaine. Le matériel, lui, est compté : une dizaine de ballons usés, des chasubles dépareillées, un seul jeu de petits buts abîmé par le sel. Au début de chaque séance, un bénévole note le nombre de ballons. À la fin, il recompte.",
      },
      {
        type: "stat",
        value: "800 000 FCFA",
        label:
          "Somme nécessaire pour équiper l'école : ballons, chasubles, deux jeux de petits buts et une trousse de secours",
        source: "Association Étoile du Rivage",
      },
      {
        type: "paragraph",
        text: "L'association cherche des partenaires, entreprises du quartier ou particuliers, pour s'équiper. Un commerçant a offert six ballons à la rentrée, mais l'usure est rapide : le sable use les coutures et le sel abîme le revêtement. À terme, les bénévoles voudraient un terrain en dur, même petit, pour continuer à jouer les jours de forte marée. En attendant, le sable fait l'affaire, et il oblige à un jeu plus technique.",
      },
      {
        type: "paragraph",
        text: "Au coup de sifflet final, le groupe se range. Les ballons sont comptés, un par un. Aucun ne doit rester sur le sable : la marée montante l'emporterait. Les initiatives de football de proximité sont réunies dans notre rubrique [Football](/rubrique/sport/football).",
      },
    ],
  },
  {
    slug: "dix-kilometres-libreville-course-front-de-mer",
    title:
      "Course à pied : 3 000 coureurs attendus sur les 10 km du front de mer",
    dek: "L'association Foulées de l'Estuaire organise une course populaire de 10 kilomètres le long du front de mer de Libreville. Parcours plat, dossard à 5 000 FCFA, clubs amateurs mobilisés : ce qu'il faut savoir avant le départ.",
    categorySlug: "sport",
    subCategorySlug: "autres-disciplines",
    authorSlug: "yannick-moussavou",
    heroMediaKey: "libreville-boulevard",
    galleryMediaKeys: ["libreville-baie"],
    keyPoints: [
      "L'association Foulées de l'Estuaire organise pour la première fois une course de 10 kilomètres sur le front de mer de Libreville, avec environ 3 000 participants attendus.",
      "Le parcours est plat, le départ est donné à 6 h 30 pour éviter la chaleur, et le dossard coûte 5 000 FCFA, avec une marche de 5 kilomètres en parallèle.",
      "Les clubs amateurs préparent les débutants depuis plusieurs semaines, avec des conseils simples : progresser par étapes, boire, partir lentement.",
    ],
    seo: {
      description:
        "10 km du front de mer à Libreville : parcours, inscriptions à 5 000 FCFA, clubs amateurs et conseils pour courir en sécurité avant le départ.",
      keywords: [
        "course à pied",
        "10 km",
        "Libreville",
        "front de mer",
        "running amateur",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: ["course-a-pied", "10-km", "libreville", "running", "sante"],
    daysAgo: 10,
    views: 870,
    body: [
      {
        type: "paragraph",
        text: "Il est 5 h 45 et le front de mer n'est encore qu'une bande grise. Pourtant, une soixantaine de coureurs s'échauffent déjà sur le trottoir, lampe frontale allumée. Les faisceaux balaient l'asphalte. Ce dimanche, les clubs amateurs repèrent le parcours des 10 km du front de mer, dont le départ sera donné dans quelques semaines. D'un côté, l'océan Atlantique. De l'autre, la ville qui s'éveille. Devant, une ligne droite que personne ne regarde sans calculer son allure.",
      },
      {
        type: "paragraph",
        text: "Pour sa première édition, l'association Foulées de l'Estuaire attend 3 000 coureurs. Elle a choisi la formule d'une course populaire : chronométrée pour ceux qui le souhaitent, ouverte aux débutants, aux marcheurs et aux clubs. Plusieurs clubs amateurs du littoral ont déjà inscrit leurs adhérents. Le départ est fixé à 6 h 30, avant la chaleur, devant un village installé sur le front de mer. L'arrivée est jugée au même endroit, avec ravitaillement, poste de secours et animations.",
      },
      {
        type: "heading",
        level: 2,
        text: "Parcours et inscriptions",
      },
      {
        type: "paragraph",
        text: "Le tracé est plat : un aller-retour de 5 kilomètres le long de la mer, à parcourir deux fois. Trois points d'eau jalonnent le parcours, tous les 2,5 kilomètres environ, et un ravitaillement attend à l'arrivée. La circulation sera déviée sur le tracé pendant la matinée, indiquent les organisateurs. Les coureurs rapides boucleront les 10 km en moins de quarante minutes, les autres en une heure ou davantage. Le temps limite est fixé à 1 h 30, soit une allure moyenne d'environ 6,7 km/h.",
      },
      {
        type: "stat",
        value: "3 000 coureurs",
        label:
          "Participants attendus pour cette première édition, dont une part importante de débutants",
        source: "Association Foulées de l'Estuaire",
      },
      {
        type: "paragraph",
        text: "Les inscriptions se font en ligne ou dans trois points de vente répartis en ville. Le dossard coûte 5 000 FCFA, et 3 000 FCFA pour les étudiants et les demandeurs d'emploi, sur justificatif. Il se retire la veille, entre 15 h et 19 h, au village de la course. Une marche de 5 kilomètres, sans chronomètre, part à 7 h pour ceux qui préfèrent ne pas courir.",
      },
      {
        type: "quote",
        text: "On voulait une course où celui qui boucle les 10 km en cinquante minutes et celle qui y met une heure vingt, en alternant marche et course, se retrouvent sur la même ligne de départ. L'objectif n'est pas le chrono. C'est de *donner envie de bouger*.",
        attribution:
          "Mireille Moussounda, organisatrice bénévole de Foulées de l'Estuaire",
      },
      {
        type: "heading",
        level: 2,
        text: "Les clubs amateurs, moteurs de la préparation",
      },
      {
        type: "paragraph",
        text: "Depuis plusieurs semaines, les clubs du littoral préparent leurs adhérents. Allure Marée et les Matinaux du Komo organisent des sorties groupées trois matins par semaine, avant le travail. Ils proposent aux débutants un plan de huit semaines : alternance de marche et de course, puis allongement progressif des temps de course. Les groupes sont mixtes, les niveaux mélangés, pour que personne ne coure seul. Ceux qui préfèrent marcher ont aussi leur groupe, qui vise la marche de 5 kilomètres.",
      },
      {
        type: "quote",
        text: "J'ai commencé il y a un an avec dix minutes de course entrecoupées de marche. Aujourd'hui, je tiens une heure. Le matin, avant le travail, je sens que mon souffle et mon sommeil ont changé. La première semaine a été difficile, mais le groupe m'a portée.",
        attribution: "Prisca Engonga, coureuse amateur",
      },
      {
        type: "heading",
        level: 2,
        text: "Courir sans se mettre en danger",
      },
      {
        type: "paragraph",
        text: "Courir au bord de la mer, c'est aussi composer avec la chaleur et l'humidité, dès l'aube. Une activité régulière, même modérée, profite au cœur et au sommeil, rappellent les entraîneurs, à condition de progresser par étapes. Ils résument quelques règles simples :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Demander l'avis d'un médecin en cas de doute : tension élevée, antécédents cardiaques, reprise après une longue pause",
          "Boire régulièrement la veille et le matin de la course, sans excès",
          "Courir avec des chaussures déjà portées, jamais neuves le jour J",
          "Partir lentement : les deux premiers kilomètres doivent paraître faciles",
          "S'arrêter et prévenir un bénévole en cas de malaise ou de douleur dans la poitrine",
        ],
      },
      {
        type: "paragraph",
        text: "Pour les organisateurs, la réussite se mesurera moins au nombre de dossards qu'à ce qui suivra : des groupes qui continuent à courir, des habitants qui prennent goût au mouvement, et peut-être une seconde édition. D'autres rendez-vous amateurs sont réunis dans notre rubrique [Autres disciplines](/rubrique/sport/autres-disciplines).",
      },
    ],
  },
];
