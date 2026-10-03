import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubrique « Politique ».
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_1: readonly SeedArticle[] = [
  {
    slug: "session-budgetaire-projet-loi-finances-examen",
    title:
      "Session budgétaire : comment les députés examinent le projet de loi de finances",
    dek: "Dépôt du texte, auditions en commission, séance publique, navette avec le Sénat : le projet de loi de finances suit un parcours balisé. Mode d'emploi, avec un budget de l'ordre de 4 000 milliards de FCFA pour exemple.",
    categorySlug: "politique",
    subCategorySlug: "institutions",
    authorSlug: "nadia-ondo",
    heroMediaKey: "assemblee-nationale",
    keyPoints: [
      "Le projet de loi de finances passe par la commission des finances, la séance publique, puis le Sénat, avant son adoption définitive.",
      "Le budget pris pour exemple, de l'ordre de 4 000 milliards de FCFA, met en avant trois priorités : l'école, la santé et les routes.",
      "Les citoyens peuvent suivre les débats publics, lire les documents budgétaires et comparer les crédits votés aux dépenses réelles.",
    ],
    seo: {
      description:
        "Du dépôt au vote : le parcours du projet de loi de finances, de la commission des finances au Sénat, et ce que les citoyens peuvent suivre.",
      keywords: [
        "loi de finances",
        "session budgétaire",
        "Assemblée nationale",
        "budget de l'État",
        "commission des finances",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "budget",
      "loi-de-finances",
      "assemblee-nationale",
      "parlement",
      "finances-publiques",
    ],
    daysAgo: 1,
    views: 3100,
    body: [
      {
        type: "paragraph",
        text: "Chaque année, la session budgétaire place le budget de l'État au centre des travaux de l'Assemblée nationale. Les députés examinent le projet de loi de finances, le texte qui fixe les recettes et les dépenses de l'exercice suivant. Le gouvernement le prépare, puis le dépose. L'examen mobilise deux chambres, l'Assemblée nationale puis le Sénat, et dure plusieurs semaines. Pour fixer les idées, cet article prend l'exemple d'un budget de l'ordre de 4 000 milliards de FCFA, un ordre de grandeur donné à titre d'illustration pour un pays d'environ 2,4 millions d'habitants.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un parcours en cinq étapes",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Dépôt : le gouvernement transmet le projet à l'Assemblée nationale, en début de session, avec son exposé des motifs et ses annexes.",
          "Commission : auditions puis examen article par article, pendant trois à quatre semaines.",
          "Séance publique : débat, amendements et vote, pendant une à deux semaines.",
          "Sénat : examen à son tour, avec une commission mixte en cas de désaccord entre les deux chambres.",
          "Adoption définitive : promulgation et publication, pour une application au 1er janvier.",
        ],
      },
      {
        type: "paragraph",
        text: "Le travail technique se déroule en commission. Les députés qui en sont membres auditionnent les administrations et interrogent les responsables de programmes sur l'emploi des crédits. Les services de l'éducation, de la santé ou des travaux publics expliquent ce qu'ils ont dépensé et ce qu'ils demandent. Les députés déposent ensuite des amendements. Un amendement modifie un article du texte. Il n'est recevable que s'il respecte l'équilibre du budget. En séance publique, l'ensemble des députés reprend la discussion. Les débats y sont en principe publics et donnent lieu à un compte rendu.",
      },
      {
        type: "quote",
        text: "En commission, on lit le budget ligne par ligne. Ce qui paraît abstrait dans un discours devient concret : combien de salles de classe, combien de dispensaires, combien de kilomètres de route.",
        attribution:
          "Ludovic Mpaga, député, membre de la commission des finances",
      },
      {
        type: "paragraph",
        text: "Le Sénat reçoit ensuite le texte voté. Il l'examine à son tour, d'abord en commission, puis en séance. Il peut le modifier. Si les deux chambres ne s'accordent pas, une commission mixte, composée de membres de chacune, cherche une rédaction commune. Le calendrier vise une adoption avant la fin de l'année civile, car le budget s'applique du 1er janvier au 31 décembre. Si le temps vient à manquer, des mesures transitoires permettent à l'État de continuer à payer ses agents et ses fournisseurs.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que contient le budget",
      },
      {
        type: "paragraph",
        text: "Un budget de cette taille se lit par grandes masses. Côté recettes, il repose sur les revenus pétroliers, les impôts et taxes, les droits de douane et, pour boucler l'équilibre, sur des emprunts. Côté dépenses, dans l'exemple retenu, les salaires des agents publics représentent environ 1 000 milliards de FCFA. Les biens, services et transferts en pèsent 900, et les investissements autant. Le service de la dette, intérêts et remboursements compris, atteint 1 200 milliards. Ces montants sont des ordres de grandeur. Dans un projet réel, chaque ligne est détaillée par programme, avec des objectifs et des indicateurs de résultat.",
      },
      {
        type: "stat",
        value: "≈ 4 000 milliards de FCFA",
        label: "Ordre de grandeur des dépenses d'un projet de loi de finances",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Trois priorités sont affichées dans l'exemple : l'école, la santé et les routes. Elles traversent plusieurs blocs à la fois : salaires des enseignants et des soignants, achats de manuels et de médicaments, entretien du réseau routier. À titre indicatif, l'éducation représenterait de l'ordre de 15 % des dépenses, la santé 8 % et les routes 6 %. Les députés comparent ces parts d'une année sur l'autre et demandent ce qui explique les écarts. Un chantier annoncé mais peu financé se repère vite à la lecture des lignes.",
      },
      {
        type: "quote",
        text: "Le Parlement autorise le budget, *il ne l'écrit pas*. Il peut réduire des crédits, les réorienter, exiger des explications. Mais les règles de recevabilité limitent sa capacité à créer des dépenses nouvelles.",
        attribution: "Aurélie Ndembi, enseignante-chercheuse en droit public",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que les citoyens peuvent suivre",
      },
      {
        type: "paragraph",
        text: "Le budget n'est pas réservé aux spécialistes. Les séances publiques peuvent être suivies, et les comptes rendus consultés après coup. Le projet est accompagné de documents explicatifs : hypothèses retenues, répartition des crédits, objectifs par politique publique. En cours d'année, une loi de finances rectificative peut ajuster les montants. L'année suivante, une loi de règlement compare ce qui a été voté et ce qui a été réellement dépensé.",
      },
      {
        type: "paragraph",
        text: "Reste la question de l'exécution : un crédit voté n'est pas un crédit dépensé. Suivre l'écart entre les deux, projet par projet, est une manière concrète de lire un budget. Nos analyses sont réunies dans la rubrique [Finances publiques](/rubrique/economie/finances-publiques).",
      },
    ],
  },
  {
    slug: "decentralisation-transfert-competences-communes",
    title:
      "Décentralisation : ce que le transfert de compétences change pour les communes",
    dek: "État civil, voirie, marchés, collecte des déchets : la décentralisation confie de nouvelles responsabilités aux communes. Dotations, agents, calendrier : ce que cela change, du conseil municipal au guichet.",
    categorySlug: "politique",
    subCategorySlug: "territoires",
    authorSlug: "nadia-ondo",
    heroMediaKey: "lambarene-ville",
    keyPoints: [
      "Le transfert confie aux communes quatre services du quotidien : l'état civil, la voirie, les marchés et la collecte des déchets.",
      "Une compétence ne se transfère pas seule : elle suppose une dotation de l'État, des agents formés et du matériel.",
      "Au guichet, les habitants conservent un interlocuteur de proximité, mais délais et tarifs peuvent varier d'une commune à l'autre.",
    ],
    seo: {
      description:
        "État civil, voirie, marchés, déchets : ce que le transfert de compétences de l'État vers les communes change pour les habitants et les finances locales.",
      keywords: [
        "décentralisation",
        "communes",
        "transfert de compétences",
        "état civil",
        "finances locales",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "decentralisation",
      "communes",
      "collectivites-locales",
      "etat-civil",
      "finances-locales",
    ],
    daysAgo: 5,
    views: 1450,
    body: [
      {
        type: "paragraph",
        text: "Transférer une compétence, c'est changer le nom de celui qui répond à l'habitant. Dans le cadre de la décentralisation, des services aujourd'hui assurés ou supervisés par l'État passent sous la responsabilité des communes : état civil, voirie, marchés, collecte des déchets. La commune devient l'interlocuteur direct, l'État l'accompagne et en finance une partie. Pour fixer les idées, imaginons une commune de la taille d'un chef-lieu de province, comme Lambaréné, au bord de l'Ogooué. Ce qui change pour elle vaut, avec des nuances, pour les autres communes du pays.",
      },
      {
        type: "heading",
        level: 2,
        text: "Quatre services du quotidien",
      },
      {
        type: "paragraph",
        text: "L'état civil recouvre l'enregistrement des naissances, des mariages et des décès, et la délivrance des copies d'actes. C'est un service visible : l'inscription à l'école ou l'accès aux soins en dépendent. La voirie, ce sont les rues, les caniveaux et l'éclairage des quartiers ; les grands axes restent en principe du ressort de l'État. Les marchés supposent des étals, de l'eau, des sanitaires et la perception de droits de place. La collecte des déchets, enfin, passe par des bacs, des camions et un lieu de dépôt. Ce sont des services que l'habitant utilise chaque semaine, souvent sans savoir qui en est responsable.",
      },
      {
        type: "quote",
        text: "Au guichet, l'habitant ne demande pas qui est compétent. Il veut son acte de naissance, une rue praticable, un marché propre. Une fois la compétence transférée, c'est à la commune de répondre, et c'est vers elle qu'on se tournera si cela ne fonctionne pas.",
        attribution:
          "Ghislaine Ndjoungui, conseillère municipale dans une commune de taille moyenne",
      },
      {
        type: "heading",
        level: 2,
        text: "Des moyens transférés avec les compétences",
      },
      {
        type: "paragraph",
        text: "Le principe est simple : pas de compétence sans moyens. L'État verse une dotation, que la commune complète avec ses recettes propres : droits de place, taxes locales, redevances. Il met aussi des agents à la disposition de la commune et organise leur formation. Ces agents gardent en principe leur statut, leur ancienneté et leur rémunération. La commune dispose alors d'un budget plus large, mais aussi de charges nouvelles : salaires, carburant, entretien du matériel, contrats avec des prestataires. Tout l'enjeu consiste à ajuster les unes aux autres, service par service.",
      },
      {
        type: "stat",
        value: "≈ 4 %",
        label:
          "Part indicative des dépenses de l'État reversée aux communes sous forme de dotations",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "paragraph",
        text: "Les communes ne partent pas toutes du même niveau. Un chef-lieu de province perçoit davantage de droits de place qu'une petite commune rurale. Pour éviter que l'écart se creuse, une partie de la dotation tient compte de la population, de l'étendue du territoire et de la longueur des voies à entretenir, et pas seulement des recettes locales. Ce mécanisme, appelé péréquation, réduit les écarts sans les supprimer. Les communes aux ressources limitées reçoivent ainsi une part plus élevée par habitant.",
      },
      {
        type: "quote",
        text: "*Un transfert sans ressources* n'existe que sur le papier. La bonne question n'est pas de savoir qui est compétent, mais avec quel budget, quels agents et quel matériel. Une commune qui hérite d'une compétence sans les moyens correspondants garde une responsabilité qu'elle ne peut pas exercer.",
        attribution: "Brice Tsamba, consultant en finances locales",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce qui change au guichet",
      },
      {
        type: "paragraph",
        text: "Le transfert ne se fait pas en un jour. Un calendrier type s'étale sur trois ans : état civil et marchés la première année, voirie la deuxième, collecte des déchets la troisième. Chaque étape commence par un inventaire des moyens existants, puis par une convention entre l'État et la commune. Les agents sont formés avant la prise de relais. Pendant la période de transfert, les anciens services continuent de répondre aux usagers. À la fin de chaque année, un bilan compare les moyens transférés et le service rendu. Pour l'habitant, les changements attendus sont concrets :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Les demandes d'actes d'état civil sont déposées et retirées à la mairie, selon des délais affichés au guichet.",
          "Les droits de place et les redevances de collecte peuvent être fixés par le conseil municipal, dans les limites prévues par les textes.",
          "Les réclamations sont portées devant la commune, dont le conseil se réunit en séance publique.",
          "Le budget communal peut être consulté par les habitants, ainsi que les décisions du conseil.",
        ],
      },
      {
        type: "paragraph",
        text: "Pour les habitants, le test sera simple : un acte délivré dans un délai connu, une rue entretenue, un marché propre. Les communes devront, elles, rendre des comptes à leur conseil municipal et aux citoyens qui suivent ses séances. L'État garde un rôle de contrôle et d'appui, notamment pour la formation des agents. Chacun peut aussi interroger ses conseillers municipaux sur l'emploi des dotations. Notre rubrique [Territoires](/rubrique/politique/territoires) suit ces réformes à l'échelle locale.",
      },
    ],
  },
  {
    slug: "securite-maritime-golfe-de-guinee-reunion-libreville",
    title:
      "Sécurité maritime : les pays du golfe de Guinée se concertent à Libreville",
    dek: "Pêche illicite, partage d'informations, patrouilles conjointes : des experts de pays riverains du golfe de Guinée ont travaillé trois jours à Libreville. Une réunion technique, sans décision politique, qui prépare des recommandations.",
    categorySlug: "politique",
    subCategorySlug: "diplomatie",
    authorSlug: "serge-boussougou",
    heroMediaKey: "seminaire-salle",
    galleryMediaKeys: ["peche-artisanale"],
    keyPoints: [
      "Une cinquantaine d'experts de pays riverains du golfe de Guinée se sont réunis trois jours à Libreville pour un atelier technique.",
      "La pêche illicite, le partage d'informations et les patrouilles conjointes figuraient au programme, dans le cadre de l'architecture issue du sommet de Yaoundé de 2013.",
      "L'atelier ne prend aucune décision : il produit des recommandations, que chaque pays examinera de son côté.",
    ],
    seo: {
      description:
        "Pêche illicite, partage d'informations, patrouilles conjointes : des experts du golfe de Guinée réunis à Libreville sur la sécurité maritime.",
      keywords: [
        "sécurité maritime",
        "golfe de Guinée",
        "pêche illicite",
        "patrouilles conjointes",
        "Libreville",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "securite-maritime",
      "golfe-de-guinee",
      "peche-illicite",
      "cooperation-regionale",
      "libreville",
    ],
    daysAgo: 8,
    views: 1180,
    body: [
      {
        type: "paragraph",
        text: "Une cinquantaine d'experts, venus d'une dizaine de pays riverains du golfe de Guinée, se sont réunis trois jours à Libreville pour un atelier consacré à la sécurité maritime. Officiers de marine, garde-côtes, administrateurs des pêches et juristes ont travaillé sur trois sujets : la pêche illicite, le partage d'informations et les patrouilles conjointes. Il s'agit d'une réunion technique. Elle ne produit ni traité ni décision, mais des recommandations que chaque pays examinera ensuite de son côté. Les délégations ont comparé leurs pratiques et listé les obstacles concrets à une action commune.",
      },
      {
        type: "heading",
        level: 2,
        text: "Un cadre régional déjà en place",
      },
      {
        type: "paragraph",
        text: "La coopération régionale s'appuie sur l'architecture issue du sommet de Yaoundé de 2013. Celle-ci répartit la surveillance en zones maritimes, prévoit des centres de coordination régionaux et organise l'échange d'informations entre États. Elle vise la piraterie, mais aussi d'autres activités illicites en mer : trafics, pollutions, pêche non déclarée. L'atelier n'a pas remis ce cadre en cause. Il a cherché à le rendre plus concret, avec des procédures de travail que les équipes pourraient appliquer au quotidien : qui prévient qui, dans quel délai, avec quel moyen.",
      },
      {
        type: "heading",
        level: 2,
        text: "La pêche illicite, un manque à gagner",
      },
      {
        type: "paragraph",
        text: "La pêche illicite, non déclarée et non réglementée, prive les États de recettes et appauvrit les stocks de poissons, dont dépendent aussi de nombreuses familles du littoral. Elle se pratique souvent loin des côtes, là où un navire peut couper sa balise de positionnement et reprendre sa route sans être vu. Chaque État surveille d'abord sa zone économique exclusive, qui s'étend jusqu'à 200 milles marins du rivage. Aucun pays de la région ne peut la couvrir seul en permanence. Mettre en commun les images satellite et les positions des navires permet de repérer plus vite un comportement inhabituel.",
      },
      {
        type: "stat",
        value: "≈ 20 %",
        label:
          "Part indicative des captures de la région qui échappent à toute déclaration",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "quote",
        text: "Un navire qui coupe sa balise en haute mer n'est visible que si un voisin partage ses images radar ou satellite. Une position isolée ne dit pas grand-chose. Mise en commun avec les autres, elle devient *une alerte*.",
        attribution: "Arsène Moukala, capitaine de frégate, officier de marine",
      },
      {
        type: "heading",
        level: 2,
        text: "Partage d'informations et patrouilles conjointes",
      },
      {
        type: "paragraph",
        text: "Le partage d'informations suppose un langage commun : formats de données, délais de transmission, niveaux de confidentialité. Une alerte transmise trop tard ne sert plus à rien. Un message trop largement diffusé peut, à l'inverse, prévenir celui qu'on cherchait à repérer. Les experts ont donc travaillé sur des fiches simples, utilisables de nuit par un opérateur de centre de coordination, avec les mêmes rubriques d'un pays à l'autre. Ils ont aussi évoqué la formation : un opérateur qui sait lire une carte de positions repère plus vite ce qui sort de l'ordinaire.",
      },
      {
        type: "paragraph",
        text: "Les patrouilles conjointes ont occupé une journée entière. Un navire d'un pays peut-il opérer dans les eaux d'un voisin ? Les experts ont étudié la formule d'un officier de liaison embarqué, qui représente l'État riverain à bord et autorise une intervention. Ils ont aussi parlé d'échange d'images, de langues de travail communes, de calendriers de patrouille et de partage des frais de carburant. Chaque point suppose un accord écrit entre États, donc un travail juridique.",
      },
      {
        type: "quote",
        text: "Les pêcheurs artisans connaissent la mer, mais pas toujours les règles qui changent. Nous ne demandons pas d'être protégés de tout. Nous demandons qu'on nous explique où sont les zones réservées et qu'on nous écoute avant de les fixer.",
        attribution:
          "Noëlle Mayombo, responsable de la coopérative Mer et Lagune",
      },
      {
        type: "paragraph",
        text: "Plusieurs coopératives de pêcheurs avaient été invitées. Leur présence répond à une réalité : les pêcheurs artisans sont souvent les premiers témoins de ce qui se passe près des côtes. Des participants ont proposé un dispositif simple de signalement, par radio ou par téléphone, vers un centre de coordination, avec un retour d'information aux pêcheurs. Les coopératives demandent aussi que les zones réservées soient balisées et que les règles soient expliquées en termes simples.",
      },
      {
        type: "paragraph",
        text: "Les recommandations de l'atelier seront transmises aux autorités compétentes de chaque pays. Une nouvelle réunion technique est envisagée dans six mois, pour mesurer ce qui peut être appliqué sans attendre. Aucune date de décision n'est fixée : chaque État reste libre de son calendrier. Les autres rendez-vous de la coopération régionale sont suivis dans la rubrique [Diplomatie](/rubrique/politique/diplomatie).",
      },
    ],
  },
  {
    slug: "etat-civil-numerisation-actes-de-naissance-phase-pilote",
    title:
      "État civil : la numérisation des actes de naissance entre en phase pilote",
    dek: "Registres papier abîmés, copies longues à obtenir, enfants sans acte : la numérisation de l'état civil démarre dans quelques centres pilotes. Calendrier, protection des données, attentes des familles : le point.",
    categorySlug: "politique",
    subCategorySlug: "gouvernement",
    authorSlug: "nadia-ondo",
    heroMediaKey: "senat-gabon",
    galleryMediaKeys: ["administration-gabon"],
    keyPoints: [
      "La phase pilote numérise les registres de naissance de quelques centres d'état civil et enregistre les nouvelles naissances en ligne.",
      "L'objectif est de réduire le nombre d'enfants sans acte de naissance et de raccourcir le délai de délivrance des copies.",
      "La protection des données personnelles des enfants et des familles conditionne l'extension du dispositif.",
    ],
    seo: {
      description:
        "La numérisation des actes de naissance entre en phase pilote : objectifs, centres concernés, calendrier et protection des données personnelles.",
      keywords: [
        "état civil",
        "acte de naissance",
        "numérisation",
        "protection des données",
        "Gabon",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "etat-civil",
      "acte-de-naissance",
      "numerisation",
      "donnees-personnelles",
      "administration",
    ],
    daysAgo: 13,
    views: 960,
    body: [
      {
        type: "paragraph",
        text: "Dans une dizaine de centres d'état civil, les registres de naissance commencent à être numérisés. Cette phase pilote, prévue pour six mois, teste trois opérations : la saisie des anciens registres, l'enregistrement des nouvelles naissances à la maternité et la délivrance de copies d'actes depuis n'importe quel centre participant. Les centres sont équipés d'ordinateurs et de scanners, et leurs agents ont reçu une formation de quelques jours. Une commission sénatoriale a auditionné des techniciens sur la réforme, afin de comprendre le dispositif : calendrier, coûts, sécurité des données.",
      },
      {
        type: "heading",
        level: 2,
        text: "Pourquoi numériser",
      },
      {
        type: "paragraph",
        text: "Un acte de naissance ouvre l'accès à l'école, aux soins et aux démarches administratives. Or certains enfants n'en ont pas, faute de déclaration dans les délais, par éloignement du centre d'état civil ou à cause du coût des démarches. Pour un enfant dont la naissance n'a pas été déclarée à temps, la régularisation passe en général par une procédure judiciaire, souvent longue. Les registres papier posent un autre problème : humidité, ratures, volumes égarés. Retrouver un acte peut prendre plusieurs jours. La copie numérique doit permettre de le retrouver en quelques minutes, tandis que le registre papier reste la référence officielle.",
      },
      {
        type: "stat",
        value: "≈ 1 enfant sur 10",
        label:
          "Ordre de grandeur de la part des enfants de moins de cinq ans sans acte de naissance",
        source: "Ordre de grandeur, exercice de démonstration",
      },
      {
        type: "quote",
        text: "Quand un registre est abîmé, c'est un morceau de l'histoire d'un quartier qui s'efface. Avec une copie numérique, je retrouve un acte en quelques minutes au lieu de plusieurs jours. Mais je continue à vérifier chaque information avec la famille, au guichet.",
        attribution: "Pascaline Itoungou, officière d'état civil",
      },
      {
        type: "paragraph",
        text: "Pour une famille, la différence se mesure en déplacements. Aujourd'hui, obtenir une copie peut obliger à se rendre dans le centre où la naissance a été enregistrée, parfois à plusieurs heures de route. Avec le dispositif pilote, la copie est demandée dans n'importe quel centre participant. Les familles rurales évitent ainsi un long trajet et une journée de travail perdue. Le demandeur doit toutefois se présenter avec une pièce d'identité, et la signature de l'officier d'état civil reste nécessaire.",
      },
      {
        type: "heading",
        level: 2,
        text: "Ce que teste la phase pilote",
      },
      {
        type: "paragraph",
        text: "Le dispositif repose sur trois volets, évalués séparément, chacun avec ses propres indicateurs :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Reprise des registres papier : chaque acte est saisi, puis contrôlé par un second agent, avant d'être rattaché au registre d'origine.",
          "Enregistrement des naissances à la maternité : un avis est transmis par voie électronique au centre d'état civil.",
          "Copies d'actes : elles sont délivrées depuis n'importe quel centre pilote, avec un code de vérification imprimé sur le document.",
        ],
      },
      {
        type: "paragraph",
        text: "Les centres choisis sont urbains et ruraux, répartis sur plusieurs provinces. Ce choix permet de tester le fonctionnement avec une connexion parfois instable et un équipement limité. Après six mois, une évaluation mesurera les délais de délivrance, le nombre d'actes saisis, le taux d'erreurs, la disponibilité du système et la satisfaction des usagers. Les familles seront interrogées sur la durée de la démarche et sur la clarté des explications reçues. Une extension progressive pourrait suivre sur deux ans, centre par centre, si les résultats sont concluants et si les moyens suivent.",
      },
      {
        type: "heading",
        level: 2,
        text: "Protéger les données des familles",
      },
      {
        type: "paragraph",
        text: "Numériser, c'est aussi concentrer. Un fichier d'actes de naissance contient des noms, des dates, des filiations. Les règles prévues pour la phase pilote reposent sur des principes simples : accès réservé aux agents habilités, traçage de chaque consultation, hébergement sécurisé, durée de conservation fixée, droit de rectification pour les familles. Chaque agent dispose d'un identifiant personnel, et les sauvegardes sont conservées hors du centre. Les données ne servent qu'à l'état civil : toute autre utilisation suppose un cadre légal précis. Les techniciens entendus au Sénat ont détaillé ces mesures et leur coût.",
      },
      {
        type: "quote",
        text: "Un acte de naissance se garde toute une vie. La numérisation est utile si elle reste *un outil au service des familles*. Il faut dire qui a accès aux données, pendant combien de temps, et comment corriger une erreur. Et il faut le dire aux familles dans des termes simples.",
        attribution:
          "Clément Pambou, juriste à l'association Un Nom pour Chacun",
      },
      {
        type: "paragraph",
        text: "La phase pilote ne tranche pas tout. Les centres devront vérifier que les familles éloignées accèdent au service, y compris sans connexion, et que les agents ne se retrouvent pas avec deux registres à tenir au lieu d'un. Les enseignements serviront à décider d'une éventuelle généralisation. Les autres réformes en cours sont suivies dans la rubrique [Gouvernement](/rubrique/politique/gouvernement).",
      },
    ],
  },
];
