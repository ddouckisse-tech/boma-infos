import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubriques « Espace pro » et « Tribune ».
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_3: readonly SeedArticle[] = [
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
      description: "Seuils d’agrément, fiscalité, contenu local, guichet unique, recours, clause de sauvegarde : ce que change le nouveau code des investissements.",
      keywords: [
        "code des investissements",
        "fiscalité",
        "contenu local",
        "Gabon",
        "réglementation",
      ],
    },
    origin: "redaction",
    feature: "top",
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
        label: "Part minimale de sous-traitance locale exigée dans les projets d’extraction, selon le nouveau texte",
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
        text: "Plusieurs décrets d’application, notamment sur le calcul précis du taux de contenu local par filière, n’étaient pas encore publiés au moment de la rédaction de cet article. Les cabinets de conseil recommandent aux porteurs de projets de déposer leur dossier en tenant compte des deux jeux de règles, ancien et nouveau, le temps que les textes secondaires soient stabilisés. Un premier bilan d’application est promis par l’administration dans les douze mois suivant l’entrée en vigueur. Ces mêmes porteurs de projets suivront avec intérêt les [appels d’offres publics](/rubrique/opportunites) actuellement ouverts, eux aussi concernés par la montée en puissance des exigences de contenu local.",
      },
    ],
  },
  {
    slug: "appel-offres-quatorze-lots-rehabilitation-routiere",
    title: "Appel d’offres : quatorze lots de réhabilitation routière ouverts jusqu’au 30 octobre",
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
      description: "Quatorze lots de travaux routiers, six provinces, dépôt des dossiers jusqu’au 30 octobre : critères de recevabilité et calendrier de l’appel d’offres.",
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
        attribution: "M. Rodrigue Essono, gérant d’une entreprise de travaux publics",
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
        text: "Les candidats sont invités à vérifier la composition exacte de chaque lot auprès du service en charge du retrait des dossiers, les linéaires pouvant être ajustés à la marge avant la clôture. Les entreprises soumissionnaires ont aussi intérêt à anticiper les nouvelles règles de contenu local, présentées dans notre rubrique [Réglementations](/rubrique/reglementations). Un métré contradictoire est prévu en début de chantier pour ajuster, le cas échéant, le montant définitif du marché.",
      },
    ],
  },
  {
    slug: "formation-continue-dispositif-employeurs",
    title: "Formation continue : ce que le nouveau dispositif change pour les employeurs",
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
      description: "Contribution formation, plan annuel, prise en charge majorée pour les très petites entreprises : ce qui change pour les employeurs gabonais.",
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
        label: "Taux de prise en charge applicable aux très petites entreprises pour une formation éligible",
      },
      {
        type: "quote",
        text: "« Le dossier est plus simple, mais le remboursement met parfois quatre à cinq mois à arriver : pour une entreprise de huit salariés, c’est une trésorerie qu’on immobilise »",
        attribution: "Mme Sylvie Moussavou, directrice des ressources humaines",
      },
      {
        type: "paragraph",
        text: "Ce délai de remboursement reste la principale réserve exprimée par les employeurs consultés, en particulier dans les très petites entreprises où la trésorerie disponible est plus limitée. L’administration indique travailler à sa réduction, sans avoir communiqué d’échéance précise à ce stade. Les responsables formation trouveront un calendrier des prochaines sessions professionnelles dans notre rubrique [Séminaires](/rubrique/seminaires).",
      },
    ],
  },
  {
    slug: "seminaire-cemac-conformite-bancaire-programme",
    title: "Séminaire CEMAC sur la conformité bancaire : le programme",
    dek: "Un séminaire de deux jours réunit responsables conformité et auditeurs internes autour de la lutte anti-blanchiment, de la connaissance du client et du reporting prudentiel. Inscriptions ouvertes.",
    categorySlug: "espace-pro",
    subCategorySlug: "seminaires",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "seminaire-salle",
    keyPoints: [
      "Le séminaire se déroule sur deux jours et s’adresse aux responsables conformité, auditeurs internes et juristes des établissements financiers.",
      "Trois thèmes structurent le programme : lutte anti-blanchiment, connaissance du client et reporting prudentiel dans l’espace CEMAC.",
      "L’inscription se fait via un formulaire en ligne ; les places sont attribuées par ordre d’arrivée des dossiers complets.",
    ],
    seo: {
      title: "Séminaire CEMAC : conformité bancaire, le programme",
      description: "Programme, thèmes et modalités d’inscription du séminaire consacré à la conformité bancaire dans l’espace CEMAC, ouvert aux professionnels du secteur.",
      keywords: [
        "conformité bancaire",
        "CEMAC",
        "blanchiment",
        "séminaire",
        "banque",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "conformite-bancaire",
      "formation",
      "banque",
      "cemac",
      "seminaire",
    ],
    daysAgo: 12,
    views: 540,
    body: [
      {
        type: "paragraph",
        text: "Un séminaire consacré à la conformité bancaire dans l’espace CEMAC se tient sur deux jours à Libreville. Organisé par un centre de formation professionnelle spécialisé, il vise les équipes conformité des banques, des établissements de microfinance et des sociétés de transfert d’argent, à un moment où les exigences de supervision se renforcent dans l’ensemble de la zone et où plusieurs établissements renouvellent leurs procédures internes de vigilance.",
      },
      {
        type: "heading",
        level: 2,
        text: "Trois thèmes, deux journées",
      },
      {
        type: "paragraph",
        text: "Le programme s’articule autour de trois blocs thématiques. Le premier porte sur la lutte contre le blanchiment de capitaux et le financement du terrorisme, avec un rappel des obligations de vigilance renforcée. Le deuxième traite de la connaissance du client dans un contexte de digitalisation croissante des ouvertures de compte, y compris à distance. Le troisième est consacré au reporting prudentiel attendu des établissements par les autorités de supervision de la zone, un exercice souvent perçu comme technique mais déterminant pour la notation interne des dossiers. Un temps est également réservé aux questions portant sur l’articulation entre les obligations nationales et les recommandations des organismes internationaux de lutte contre le blanchiment. Ce dernier module s’appuie sur des extraits anonymisés de rapports réels, retravaillés pour l’exercice. Les organisateurs annoncent une mise à jour du support pédagogique chaque année pour tenir compte des évolutions réglementaires.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Jour 1, matin : cadre réglementaire et obligations de vigilance",
          "Jour 1, après-midi : connaissance du client et bénéficiaires effectifs",
          "Jour 2, matin : déclarations de soupçon et coopération avec les cellules de renseignement financier",
          "Jour 2, après-midi : reporting prudentiel et ateliers de cas pratiques",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Public visé et prérequis",
      },
      {
        type: "paragraph",
        text: "Le séminaire s’adresse en priorité aux responsables conformité, aux auditeurs internes et aux juristes des établissements financiers. Une expérience préalable du secteur bancaire est recommandée, sans être une condition d’inscription : le format alterne apports théoriques, retours d’expérience de praticiens et étude de cas pratiques construits à partir de situations rencontrées dans des établissements de la zone. Les participants venus d’établissements de microfinance suivent le même tronc commun, avec un atelier optionnel adapté à leur taille. Les échanges entre pairs, souvent cités comme le point fort de ce type de session, sont favorisés par des groupes de travail restreints.",
      },
      {
        type: "stat",
        value: "30 places",
        label: "Capacité maximale de la session, attribuées par ordre d’arrivée des dossiers complets",
      },
      {
        type: "heading",
        level: 3,
        text: "Modalités d’inscription",
      },
      {
        type: "paragraph",
        text: "L’inscription se fait au moyen d’un formulaire en ligne, à retourner accompagné d’une lettre de prise en charge de l’employeur, au plus tard une semaine avant la session. Les frais couvrent la documentation pédagogique et les pauses ; le déjeuner n’est pas inclus. Une attestation de participation est délivrée à l’issue des deux journées, sur la base d’une présence effective aux quatre demi-journées. Ce séminaire s’inscrit dans une offre plus large, présentée dans notre rubrique [Formation](/rubrique/formation).",
      },
      {
        type: "quote",
        text: "« Le reporting prudentiel est souvent traité en dernier, alors que c’est le module où les équipes ont le plus de questions concrètes »",
        attribution: "M. Guy-Fernand Ella, formateur en conformité bancaire",
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
      description: "Masse monétaire, crédit à l’économie, réserves de change, taux directeur : les chiffres du rapport annuel de la banque centrale de la zone, expliqués.",
      keywords: [
        "banque centrale",
        "masse monétaire",
        "crédit à l’économie",
        "réserves de change",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "banque-centrale",
      "politique-monetaire",
      "credit",
      "conjoncture",
    ],
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
        label: "Part du crédit à l’économie orientée vers le commerce et les services sur l’exercice sous revue",
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
        attribution: "Mme Chantal Ivinza, économiste dans une banque de la place",
      },
      {
        type: "paragraph",
        text: "Pour les directions financières, ce rapport annuel reste avant tout un outil de calibrage : il permet de resituer les conditions de financement de chaque entreprise par rapport à la tendance générale du crédit dans la zone. Les prochaines publications trimestrielles permettront de vérifier si ces tendances se confirment. Pour resituer ces montants à l’échelle nationale, le produit intérieur brut du Gabon avoisine 12 000 milliards de FCFA, et le budget de l’État un peu plus de 4 000 milliards de FCFA sur l’exercice en cours. Nos autres décryptages économiques sont réunis dans la rubrique [Espace pro](/rubrique/espace-pro).",
      },
    ],
  },
  {
    slug: "tribune-contenu-local-ne-se-decrete-pas",
    title: "Pourquoi le contenu local ne se décrète pas",
    dek: "Imposer un quota de sous-traitance locale sans outil de formation ni accès au crédit ne fabrique pas une industrie. Cela produit surtout des sociétés-écrans, utiles sur le papier, absentes sur le terrain.",
    categorySlug: "tribune",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "port-gentil",
    keyPoints: [
      "Un quota de sous-traitance imposé sans accompagnement pousse certaines entreprises à créer des filiales de façade plutôt que des capacités réelles.",
      "La formation technique et l’accès au crédit conditionnent la capacité des sous-traitants locaux à répondre aux exigences des donneurs d’ordre.",
      "Un contenu local qui fonctionne s’appuie sur des paliers progressifs, adossés à des dispositifs de financement et de transfert de compétences.",
    ],
    seo: {
      title: "Tribune : le contenu local ne se décrète pas",
      description: "Tribune : un quota de contenu local imposé sans formation ni crédit ne crée pas une industrie, mais des sociétés-écrans utiles sur le papier.",
      keywords: [
        "contenu local",
        "sous-traitance",
        "tribune",
        "industrie",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "tribune",
      "contenu-local",
      "industrie",
      "emploi",
    ],
    daysAgo: 18,
    views: 2460,
    body: [
      {
        type: "paragraph",
        text: "Je l’ai constaté sur plusieurs dossiers, dans des secteurs différents : le contenu local, tel qu’il est aujourd’hui exigé, produit surtout des montages juridiques. Une société est créée, un gérant gabonais est nommé, un pourcentage du capital est cédé sur le papier. Le sous-traitant, lui, n’a souvent ni atelier, ni salarié qualifié, ni carnet de commandes en dehors du contrat qui l’a fait naître.",
      },
      {
        type: "heading",
        level: 2,
        text: "Une intention que je partage",
      },
      {
        type: "paragraph",
        text: "Je ne conteste pas l’objectif. Un pays producteur de matières premières a raison de vouloir que la valeur ajoutée reste, au moins en partie, sur son territoire. Les grands groupes internationaux ont les moyens de sous-traiter localement une part croissante de leurs achats, et il est légitime de le leur demander, à condition de leur laisser le temps de trouver des partenaires réellement capables.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le quota sans les moyens de l’atteindre",
      },
      {
        type: "paragraph",
        text: "Le problème n’est pas le principe, mais la méthode. Un quota fixé par décret ne fabrique ni compétences techniques, ni trésorerie, ni parc de matériel. Une entreprise gabonaise de maintenance industrielle ne devient pas certifiée du jour au lendemain parce qu’un texte l’exige. Faute de pouvoir répondre seule au cahier des charges, elle prête son nom à un montage qui, lui, répond aux critères sur le papier. Le nom de l’entreprise change, l’atelier reste le même, avec les mêmes limites de capacité.",
      },
      {
        type: "quote",
        text: "« On nous demande d’être actionnaires à trente pour cent d’une société dont on ne connaît ni les comptes ni les chantiers : on signe, parce que refuser ferme la porte à tout le reste »",
        attribution: "M. Landry Kombila, entrepreneur dans la sous-traitance industrielle",
      },
      {
        type: "heading",
        level: 3,
        text: "Formation et crédit, les vrais leviers",
      },
      {
        type: "paragraph",
        text: "Les rares filières où le contenu local fonctionne sont aussi celles où un effort de formation technique a précédé l’obligation réglementaire. Des artisans formés à la soudure certifiée, à la maintenance de pompes ou à la logistique de chantier deviennent des sous-traitants crédibles, capables de répondre à un cahier des charges sans intermédiaire de façade.",
      },
      {
        type: "paragraph",
        text: "Deuxième blocage : l’accès au crédit de moyen terme pour financer l’outil de production. Une petite entreprise qui voudrait investir dans un atelier ou un véhicule adapté se heurte à des garanties hors de portée. Sans mécanisme de financement adossé à l’obligation de contenu local, celle-ci reste théorique pour la majorité des candidats sous-traitants.",
      },
      {
        type: "stat",
        value: "30 %",
        label: "Part de capital généralement cédée à un partenaire gabonais dans les montages de sous-traitance observés",
      },
      {
        type: "heading",
        level: 2,
        text: "Des paliers, pas un mur",
      },
      {
        type: "paragraph",
        text: "Je crois davantage à des paliers progressifs, assortis d’un accompagnement technique et d’une ligne de crédit dédiée, qu’à un pourcentage unique appliqué à tous les secteurs. Le contenu local se construit avec des ateliers qui tournent et des carnets de commandes qui se remplissent, pas avec des parts sociales distribuées pour cocher une case administrative. Un donneur d’ordre sérieux devrait pouvoir mesurer cette différence en visitant simplement l’atelier du sous-traitant.",
      },
    ],
  },
  {
    slug: "tribune-foret-gabonaise-credit-carbone",
    title: "La forêt gabonaise vaut mieux qu’un crédit carbone",
    dek: "Vendre des crédits carbone valorise la forêt au prix du renoncement. La transformer en bois d’œuvre certifié et en emplois industriels la valorise au prix du travail. Le choix n’est pas neutre.",
    categorySlug: "tribune",
    authorSlug: "jean-rene-obame",
    heroMediaKey: "foret-okoume",
    keyPoints: [
      "Un crédit carbone rémunère l’absence d’exploitation, quand la seconde transformation du bois rémunère le travail et forme une main-d’œuvre qualifiée.",
      "Le marché volontaire du carbone reste peu liquide et expose le vendeur à une forte volatilité des prix, contrairement à un contrat d’export.",
      "Les deux logiques ne s’excluent pas totalement, mais l’une crée des emplois durables quand l’autre en crée très peu.",
    ],
    seo: {
      title: "Tribune : la forêt gabonaise vaut mieux qu’un crédit carbone",
      description: "Tribune : la forêt gabonaise transformée en bois d’œuvre certifié et en emplois vaut davantage qu’une même surface vendue en crédits carbone.",
      keywords: [
        "forêt gabonaise",
        "crédit carbone",
        "bois d’œuvre",
        "tribune",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "tribune",
      "foret",
      "bois",
      "credit-carbone",
      "industrie",
    ],
    daysAgo: 21,
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
        label: "Ordre de grandeur de l’emploi généré par un mètre cube de bois transformé, comparé au même volume exporté en grume",
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
];
