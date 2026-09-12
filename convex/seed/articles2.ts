import type { SeedArticle } from "./types";

/**
 * Corpus de démonstration — rubrique « Succès story », éditorial et
 * innovation.
 * Contenu fictif : voir `convex/seed/index.ts`.
 */
export const ARTICLES_2: readonly SeedArticle[] = [
  {
    slug: "sylvie-mengue-filiere-cafe-cacao",
    title: "Sylvie Mengue, la femme qui a remis la filière café-cacao sur pied",
    dek: "En reprenant une coopérative exsangue du Woleu-Ntem, Sylvie Mengue a parié sur la transformation locale du cacao. Dix ans plus tard, son entreprise vend des tablettes à Libreville, mais reste suspendue à un seul acheteur européen.",
    categorySlug: "succes-story",
    subCategorySlug: "femme-dirigeante",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "femme-dirigeante",
    keyPoints: [
      "En 2015, Sylvie Mengue reprend une coopérative endettée de Bitam et convainc les planteurs de ne pas abandonner le cacao.",
      "Woleu Cacao transforme désormais une partie de sa récolte en tablettes vendues à Libreville, plutôt que d'exporter les fèves brutes.",
      "Faute d'un second débouché à l'export, l'entreprise reste dépendante d'un seul acheteur européen et du cours mondial du cacao.",
    ],
    seo: {
      description: "Portrait de Sylvie Mengue : une coopérative du Woleu-Ntem devenue entreprise de transformation du cacao, entre certification et dépendance à l'export.",
      keywords: [
        "café-cacao",
        "Woleu-Ntem",
        "coopérative agricole",
        "transformation locale",
        "export Gabon",
      ],
    },
    origin: "redaction",
    feature: "top",
    tags: [
      "cafe-cacao",
      "agroalimentaire",
      "femme-dirigeante",
      "woleu-ntem",
      "export",
    ],
    daysAgo: 3,
    views: 3180,
    body: [
      {
        type: "paragraph",
        text: "À Bitam, dans le Woleu-Ntem, les cacaoyers et les caféiers ont failli disparaître du paysage. En 2015, la coopérative locale accumulait deux ans d'arriérés de paiement aux planteurs, et plusieurs dizaines d'entre eux avaient déjà arraché leurs parcelles pour planter du manioc. Sylvie Mengue en prend la présidence cette année-là, contre l'avis de son entourage. Le Woleu-Ntem concentrait pourtant, une génération plus tôt, une bonne partie de la production nationale de cacao.",
      },
      {
        type: "paragraph",
        text: "Ancienne cadre d'une banque de la place, elle ne connaît alors des deux filières que les chiffres d'un compte d'exploitation exsangue. Les plantations vieillissent, les jeunes désertent les champs pour Libreville, et les négociants locaux imposent leurs prix à des producteurs isolés, sans organisation collective pour peser dans la négociation. Certains planteurs vendent alors leur récolte au premier acheteur venu, parfois à perte, faute d'autre solution pour financer la rentrée scolaire de leurs enfants.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le pari de la transformation",
      },
      {
        type: "paragraph",
        text: "Sylvie Mengue rompt d'abord avec le principal négociant, qui achetait les fèves de la coopérative à bas prix depuis une décennie. La décision prive l'organisation de son unique débouché pendant plusieurs mois, le temps de trouver une alternative. Elle engage ses économies personnelles dans une petite unité de séchage et de broyage, contre l'avis d'une partie du conseil d'administration, qui craint de tout perdre. Deux administrateurs démissionnent dans la foulée, jugeant le risque trop élevé pour une structure déjà fragile.",
      },
      {
        type: "quote",
        text: "« On m'a reproché de jouer l'argent des planteurs sur une idée. C'était vrai : je n'avais pas de solution de repli si ça échouait. »",
        attribution: "Sylvie Mengue, présidente-directrice générale, Woleu Cacao",
      },
      {
        type: "paragraph",
        text: "Faute de repreneur local, elle part démarcher des chocolatiers en Europe, salon après salon, avec des échantillons de fèves séchées glissés dans sa valise. Les premiers refus sont nombreux : les volumes proposés sont trop faibles pour intéresser les grands acheteurs, et la coopérative n'a pas encore de certification à présenter. Sylvie Mengue finance elle-même les billets d'avion des deux premiers voyages, faute de budget dédié.",
      },
      {
        type: "paragraph",
        text: "Un torréfacteur belge accepte finalement un premier contrat, modeste mais régulier, à un prix supérieur de moitié à celui du marché local. Une petite partie de la récolte de café robusta, longtemps délaissée, trouve elle aussi preneur auprès d'un torréfacteur artisanal de Libreville, pour des volumes encore marginaux. Ce débouché reste, pour l'instant, anecdotique face au poids du cacao dans le chiffre d'affaires de l'entreprise.",
      },
      {
        type: "stat",
        value: "340 millions de FCFA",
        label: "chiffre d'affaires de Woleu Cacao en 2023, contre 40 millions en 2016",
        source: "Woleu Cacao",
      },
      {
        type: "heading",
        level: 2,
        text: "La montée en gamme",
      },
      {
        type: "paragraph",
        text: "La coopérative, devenue société, obtient en 2019 une certification biologique reconnue en Europe, après trois ans de mise en conformité. Il faut renoncer aux engrais de synthèse, former les planteurs au compostage, documenter chaque parcelle pour les auditeurs, et convaincre des producteurs sceptiques que la baisse de rendement à court terme sera compensée par un meilleur prix. Plusieurs planteurs abandonnent en cours de route, jugeant les contraintes trop lourdes pour un gain incertain.",
      },
      {
        type: "paragraph",
        text: "**Woleu Cacao** lance sa propre marque de tablettes, vendues dans les supermarchés de Libreville depuis 2021. L'entreprise ne se contente plus d'exporter des fèves brutes : elle transforme désormais près d'un tiers de sa récolte sur place, et emploie une petite équipe de commerciaux pour démarcher les enseignes de la capitale. Les tablettes se vendent pour l'instant en quantités modestes, loin de couvrir à elles seules les charges de l'unité de transformation.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "420 planteurs affiliés à la coopérative, contre 260 en 2015",
          "3 unités de séchage réparties dans la province",
          "12 emplois permanents créés à l'atelier de transformation",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Un obstacle non résolu",
      },
      {
        type: "paragraph",
        text: "Le torréfacteur belge absorbe encore l'essentiel de la production transformée. Aucun second acheteur n'a pris le relais, malgré les démarches menées par Sylvie Mengue dans d'autres salons professionnels, à Paris puis à Cologne. Les discussions avancent lentement, freinées par les volumes encore modestes que Woleu Cacao peut garantir. Certains acheteurs potentiels demandent des volumes que la coopérative ne pourrait pas tenir avant plusieurs années.",
      },
      {
        type: "paragraph",
        text: "Le cours mondial du cacao, qui a doublé en deux ans avant de refluer, échappe entièrement à l'entreprise. Une chute des prix pourrait annuler d'un coup la marge dégagée depuis 2021, sans que la coopérative dispose d'un mécanisme de couverture pour s'en protéger. Une assurance récolte existe en théorie, mais son coût reste hors de portée d'une structure de cette taille.",
      },
      {
        type: "quote",
        text: "« Le marché mondial ne se négocie pas depuis Bitam. On subit les prix, on ne les fixe pas. »",
        attribution: "Sylvie Mengue",
      },
      {
        type: "paragraph",
        text: "Sylvie Mengue a entamé des discussions avec un négociant marocain, séduit par la certification biologique, mais aucun accord n'a encore été signé. Elle sait qu'un second débouché ne suffirait pas à effacer le risque, tant que Woleu Cacao restera exposée aux variations d'un marché mondial qu'elle ne peut influencer. Les discussions avec ce négociant marocain durent depuis huit mois, sans calendrier de signature annoncé.",
      },
      {
        type: "paragraph",
        text: "Sylvie Mengue prépare une demande de financement pour une seconde ligne de transformation. Elle espère convaincre une banque régionale avant la prochaine récolte, sans certitude sur l'issue, ni sur la capacité de la coopérative à financer elle-même une part de l'investissement. D'ici là, la coopérative avance au rythme des récoltes, une saison après l'autre.",
      },
    ],
  },
  {
    slug: "vingt-neuf-ans-logistique-portuaire-owendo",
    title: "À 29 ans, il pilote la logistique du terminal d'Owendo",
    dek: "Yannick Bivigou a 29 ans et dirige les opérations du terminal à conteneurs d'Owendo. Formé à Libreville puis à Anvers, il a préféré rentrer, quitte à réorganiser des équipes habituées à l'ancienneté.",
    categorySlug: "succes-story",
    subCategorySlug: "graine-de-manager",
    authorSlug: "patrick-mbadinga",
    heroMediaKey: "port-owendo",
    keyPoints: [
      "Formé en logistique portuaire à Libreville puis à Anvers, Yannick Bivigou a refusé une offre d'expatriation pour rentrer au Gabon.",
      "En cinq ans, il a réorganisé les rotations d'équipes du terminal d'Owendo, malgré les réticences de dockers plus anciens que lui.",
      "Au-dessus de lui, la direction générale d'Estuaire Logistique reste occupée par un cadre expatrié, plafond que la relève locale n'a pas encore franchi.",
    ],
    seo: {
      description: "À 29 ans, Yannick Bivigou dirige la logistique du terminal d'Owendo, entre formation à l'étranger, choix du retour et relève managériale gabonaise.",
      keywords: [
        "port d'Owendo",
        "logistique portuaire",
        "jeunes cadres",
        "relève managériale",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "port-owendo",
      "logistique",
      "jeunes-cadres",
      "transport-maritime",
    ],
    daysAgo: 8,
    views: 1450,
    body: [
      {
        type: "paragraph",
        text: "Yannick Bivigou a 29 ans et dirige les opérations du terminal à conteneurs d'Owendo, exploité par Estuaire Logistique. Dans l'organigramme, il supervise une centaine de dockers, de grutiers et de chefs d'équipe, pour la plupart plus âgés que lui, sur un site qui tourne vingt-quatre heures sur vingt-quatre. Le site traite l'essentiel des importations conteneurisées du pays, denrées alimentaires comme équipements industriels.",
      },
      {
        type: "paragraph",
        text: "Fils d'un douanier, il a étudié le commerce international à Libreville avant de partir en Belgique pour un master en logistique portuaire, financé par une bourse d'État. Anvers, l'un des plus grands ports d'Europe, lui ouvre alors des portes qu'il n'attendait pas, dans un secteur où les cadres gabonais restent minoritaires aux postes de direction. Beaucoup de ses camarades de promotion restés en Europe gagnent aujourd'hui nettement plus que lui.",
      },
      {
        type: "heading",
        level: 2,
        text: "Le choix du retour",
      },
      {
        type: "paragraph",
        text: "Une entreprise portuaire belge lui propose un poste après son diplôme, avec un salaire nettement supérieur à ce qu'il pourrait espérer à Libreville. Yannick Bivigou refuse et rentre au Gabon, convaincu que la relève managériale ne se joue pas ailleurs qu'à Owendo, quitte à repartir presque de zéro dans la hiérarchie de l'entreprise. Ses proches ne comprennent pas tous ce choix, dans un pays où l'expatriation reste vue comme une réussite en soi.",
      },
      {
        type: "quote",
        text: "« Rester là-bas, c'était apprendre pour un pays qui n'était pas le mien. »",
        attribution: "Yannick Bivigou, directeur des opérations, Estuaire Logistique",
      },
      {
        type: "heading",
        level: 2,
        text: "Réorganiser sans tout casser",
      },
      {
        type: "paragraph",
        text: "À son arrivée comme adjoint, puis comme responsable des opérations, il constate que les rotations d'équipes suivent encore l'ancienneté plutôt que la charge réelle des navires à quai. Yannick Bivigou impose un nouveau planning fondé sur les escales, ce qui allonge certaines journées de travail. Des dockers expérimentés le contestent ouvertement pendant plusieurs semaines, certains menaçant de saisir les délégués du personnel. Deux chefs d'équipe historiques finissent par démissionner plutôt que d'appliquer le nouveau planning.",
      },
      {
        type: "paragraph",
        text: "Pour désamorcer les tensions, il met en place des réunions hebdomadaires où chaque chef d'équipe peut contester un planning avant qu'il ne soit appliqué. La méthode ne convainc pas tout le monde, mais elle limite les blocages purs et simples sur les quais. Yannick Bivigou y voit une école de patience, plus longue que ce qu'il avait imaginé en rentrant.",
      },
      {
        type: "stat",
        value: "80 000 conteneurs",
        label: "traités par le terminal d'Owendo en 2023, contre 54 000 en 2019",
        source: "Estuaire Logistique",
      },
      {
        type: "paragraph",
        text: "Le temps moyen d'immobilisation des navires à quai recule d'environ un quart depuis la réorganisation, selon les chiffres internes communiqués par la direction. La direction générale, elle, reste occupée par un cadre expatrié, comme c'est le cas depuis la création de l'entreprise, deux décennies plus tôt. Aucune date n'a été communiquée en interne pour une éventuelle nomination d'un directeur général gabonais.",
      },
      {
        type: "paragraph",
        text: "Yannick Bivigou touche un salaire inférieur à celui de certains cadres expatriés occupant des fonctions comparables, selon plusieurs sources internes à Estuaire Logistique. Il n'en fait pas un combat public, mais le sujet revient régulièrement dans les couloirs du terminal, notamment chez les jeunes cadres qui espèrent suivre le même chemin que lui. Il en parle sans amertume apparente, mais reconnaît que la question finira par se poser plus frontalement.",
      },
      {
        type: "quote",
        text: "« La relève existe. Reste à savoir jusqu'où on nous laissera monter. »",
        attribution: "Yannick Bivigou",
      },
    ],
  },
  {
    slug: "patron-btp-former-avant-recruter",
    title: "Le patron du BTP qui a choisi de former avant de recruter",
    dek: "Faute de trouver des maçons et des électriciens qualifiés, Thierry Bouka a ouvert son propre centre de formation. Une décision coûteuse, qui n'empêche pas ses meilleurs éléments de partir chez des concurrents mieux-disants.",
    categorySlug: "succes-story",
    subCategorySlug: "leader",
    authorSlug: "serge-boussougou",
    heroMediaKey: "chantier-btp",
    keyPoints: [
      "Faute de main-d'œuvre qualifiée, Thierry Bouka a investi dans un centre de formation interne à Bouka BTP, plutôt que de débaucher chez ses concurrents.",
      "Le centre forme chaque année une trentaine de jeunes recrues aux métiers du gros œuvre, de l'électricité et de la conduite d'engins.",
      "Une fois qualifiés, certains salariés partent chez des concurrents offrant de meilleurs salaires, sans que Bouka BTP ait trouvé de parade durable.",
    ],
    seo: {
      description: "Portrait de Thierry Bouka, patron de BTP gabonais qui a créé son propre centre de formation faute de trouver une main-d'œuvre qualifiée sur le marché.",
      keywords: [
        "BTP Gabon",
        "formation professionnelle",
        "main-d'œuvre qualifiée",
        "ressources humaines",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "btp",
      "formation-professionnelle",
      "ressources-humaines",
      "construction",
    ],
    daysAgo: 13,
    views: 2100,
    body: [
      {
        type: "paragraph",
        text: "Sur un chantier de Libreville, Thierry Bouka montre un mur monté la veille par une équipe de crépis sortie de son propre centre de formation. Il y a cinq ans, il ne trouvait tout simplement pas assez de maçons qualifiés pour tenir ses délais, et perdait des pénalités de retard sur plusieurs marchés publics. Certains clients menaçaient déjà de résilier leurs contrats.",
      },
      {
        type: "paragraph",
        text: "La construction gabonaise manque de personnel qualifié depuis plusieurs années : les grands chantiers publics et privés se disputent les mêmes équipes de maçons, de coffreurs et d'électriciens, ce qui pousse les salaires à la hausse et allonge les délais des petites entreprises, souvent incapables de suivre la surenchère. Plusieurs petites entreprises du secteur ont mis la clé sous la porte ces dernières années, faute de main-d'œuvre pour honorer leurs carnets de commandes.",
      },
      {
        type: "heading",
        level: 2,
        text: "Former plutôt que débaucher",
      },
      {
        type: "paragraph",
        text: "Plutôt que de surenchérir pour attirer des ouvriers déjà formés, Thierry Bouka investit dans un centre de formation adossé à son entreprise, Bouka BTP, installé sur un terrain attenant au dépôt de matériel. Le pari coûte cher : les recrues sont payées pendant leur formation, sans produire immédiatement, pendant une durée qui peut atteindre six mois. Certains associés proposent alors de vendre l'entreprise plutôt que de poursuivre cet investissement jugé hasardeux.",
      },
      {
        type: "quote",
        text: "« Payer des gens à apprendre plutôt qu'à construire, ça a fait rire deux ou trois confrères. »",
        attribution: "Thierry Bouka, dirigeant de Bouka BTP",
      },
      {
        type: "stat",
        value: "1,8 milliard de FCFA",
        label: "chiffre d'affaires de Bouka BTP en 2023",
        source: "Bouka BTP",
      },
      {
        type: "heading",
        level: 2,
        text: "Une fidélisation difficile",
      },
      {
        type: "paragraph",
        text: "Le centre forme chaque année une trentaine de jeunes aux métiers du gros œuvre, de l'électricité et de la conduite d'engins, recrutés en priorité dans les quartiers périphériques de Libreville. Une fois qualifiés, certains partent au bout de quelques mois vers des chantiers concurrents qui offrent des salaires plus élevés. Bouka BTP estime perdre ainsi près d'un tiers de chaque promotion formée, dans les deux ans suivant la qualification.",
      },
      {
        type: "paragraph",
        text: "Thierry Bouka a introduit des primes de fidélité et des clauses de dédit-formation, sans réussir à enrayer complètement les départs. Le marché reste tendu : la hausse des salaires qualifiés a dépassé 15 % en trois ans dans certains corps de métier, une pression que ses seuls moyens ne suffisent pas à contrebalancer. Certains concurrents, mieux financés, proposent des primes d'embauche immédiates que Bouka BTP ne peut pas toujours égaler.",
      },
      {
        type: "quote",
        text: "« On ne peut pas retenir les gens de force. On essaie de leur donner une raison de rester. »",
        attribution: "Thierry Bouka",
      },
      {
        type: "paragraph",
        text: "Certains anciens élèves du centre reviennent parfois chez Bouka BTP après quelques années passées ailleurs, attirés par l'ambiance de chantier et la proximité avec la direction. Thierry Bouka en tire une leçon prudente : la fidélité se reconstruit, elle ne se décrète pas. Ces retours restent cependant minoritaires face au nombre de départs constatés chaque année.",
      },
      {
        type: "paragraph",
        text: "Bouka BTP envisage désormais de proposer des parts d'intéressement aux techniciens les plus expérimentés. Rien ne garantit que cela suffise à inverser la tendance, dans un secteur où la demande de main-d'œuvre qualifiée dépasse largement l'offre disponible sur le marché gabonais. Thierry Bouka continue, en attendant, à former plus de monde qu'il n'en garde.",
      },
    ],
  },
  {
    slug: "passerelle-paiement-airtel-moov-money",
    title: "La passerelle de paiement qui veut unifier Airtel Money et Moov Money",
    dek: "Léa Nzoghe a fondé Obali Pay pour permettre les transferts directs entre Airtel Money et Moov Money. Un seul des deux opérateurs a signé un accord commercial, l'autre reste en discussion depuis des mois.",
    categorySlug: "succes-story",
    subCategorySlug: "startup",
    authorSlug: "clarisse-ivanga",
    heroMediaKey: "startup-bureau",
    keyPoints: [
      "Lassée de jongler entre deux portefeuilles mobiles incompatibles, Léa Nzoghe a fondé Obali Pay pour créer une passerelle entre les deux services.",
      "Depuis 2023, Obali Pay a traité 1,4 milliard de FCFA de transactions, pour un chiffre d'affaires de 38 millions de FCFA tiré des commissions.",
      "Un seul des deux opérateurs de mobile money a signé un accord d'interopérabilité, l'autre négociation restant ouverte sans échéance annoncée.",
    ],
    seo: {
      description: "Obali Pay, jeune pousse gabonaise, veut relier Airtel Money et Moov Money. Un accord signé, un autre en négociation, et des commissions à discuter.",
      keywords: [
        "mobile money",
        "fintech Gabon",
        "Airtel Money",
        "Moov Money",
        "interopérabilité",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "fintech",
      "mobile-money",
      "startup",
      "paiement-mobile",
      "interoperabilite",
    ],
    daysAgo: 16,
    views: 890,
    body: [
      {
        type: "paragraph",
        text: "Léa Nzoghe se souvient d'avoir dû emprunter le téléphone d'un voisin pour recevoir un paiement, faute de pouvoir transférer de l'argent entre deux portefeuilles mobiles concurrents. De cette frustration, vécue lors d'un stage à Franceville, est née l'idée d'Obali Pay, fondée à Libreville en 2023. Elle a alors 26 ans et travaille comme développeuse pour une banque de la place.",
      },
      {
        type: "paragraph",
        text: "Au Gabon, les deux principaux services de paiement mobile ne communiquent pas directement entre eux : un utilisateur d'Airtel Money ne peut pas envoyer d'argent à un compte Moov Money sans passer par un intermédiaire, une agence physique ou des espèces, ce qui complique la vie de nombreux usagers au quotidien. Les commerçants, eux, doivent souvent posséder deux téléphones et deux cartes SIM pour accepter les paiements des deux réseaux.",
      },
      {
        type: "heading",
        level: 2,
        text: "Bâtir un pont entre deux mondes",
      },
      {
        type: "paragraph",
        text: "Avec trois développeurs recrutés parmi ses anciens camarades d'école d'ingénieurs, Léa Nzoghe construit une passerelle technique capable de router une transaction d'un service vers l'autre en quelques secondes. L'entreprise s'autofinance les dix-huit premiers mois, sans lever de fonds extérieurs, en travaillant le soir et le week-end pour ses premiers clients test. Les premiers essais échouent à plusieurs reprises, avant qu'une transaction ne passe enfin correctement d'un service à l'autre.",
      },
      {
        type: "quote",
        text: "« Chaque opérateur défend son écosystème. Nous, on veut juste que l'argent circule. »",
        attribution: "Léa Nzoghe, fondatrice d'Obali Pay",
      },
      {
        type: "stat",
        value: "1,4 milliard de FCFA",
        label: "de transactions traitées par Obali Pay depuis son lancement, pour 38 millions de FCFA de commissions",
        source: "Obali Pay",
      },
      {
        type: "heading",
        level: 2,
        text: "Deux opérateurs, une seule signature",
      },
      {
        type: "paragraph",
        text: "Un premier opérateur signe un accord commercial fin 2023, après un an de négociations sur le partage des commissions perçues à chaque transfert. Le second reste en discussion : les échanges portent sur la répartition des frais et sur l'accès aux données de transaction, un point sensible pour des opérateurs qui considèrent ces informations comme stratégiques. Les négociations avec le second opérateur ont déjà connu deux interruptions de plusieurs semaines chacune.",
      },
      {
        type: "paragraph",
        text: "L'activité d'Obali Pay s'inscrit dans le cadre de la réglementation de la COBAC sur la monnaie électronique en zone CEMAC, qui impose de s'adosser à un établissement agréé plutôt que d'opérer seule. Cette exigence a rallongé de plusieurs mois le lancement commercial du service, le temps de formaliser un partenariat avec un établissement de monnaie électronique déjà agréé. Ce partenaire prend une partie de la commission perçue sur chaque transaction, réduisant d'autant la marge d'Obali Pay.",
      },
      {
        type: "paragraph",
        text: "En attendant la signature du second accord, Obali Pay fonctionne en mode dégradé : les transferts vers le service non signataire transitent par un compte relais, plus lent et plus coûteux qu'une interconnexion directe. Léa Nzoghe présente cette solution provisoire comme un pis-aller, pas comme une réussite. Certains clients se plaignent des délais, sans toujours comprendre pourquoi une seule des deux directions fonctionne sans accroc.",
      },
      {
        type: "quote",
        text: "« Tant que le deuxième accord n'est pas signé, la moitié de nos utilisateurs restent à moitié servis. »",
        attribution: "Léa Nzoghe",
      },
      {
        type: "paragraph",
        text: "Léa Nzoghe espère finaliser le second accord avant la fin de l'année, sans pouvoir en garantir la date. En attendant, Obali Pay élargit son équipe technique à cinq personnes, et commence à démarcher des commerçants pour accepter les paiements via sa passerelle. Elle refuse pour l'instant de communiquer une date précise de rentabilité.",
      },
    ],
  },
  {
    slug: "editorial-le-prix-de-la-data",
    title: "Le prix de la data",
    dek: "Une page d'accueil qui pèse neuf mégaoctets ne coûte pas cher à publier. Elle coûte cher à lire. La rédaction du Corporate explique pourquoi le poids d'une page est aussi une question de responsabilité éditoriale.",
    categorySlug: "editorial",
    authorSlug: "nadia-ondo",
    heroMediaKey: "mobile-money",
    keyPoints: [
      "Au Gabon, un mégaoctet de données a un coût réel pour le lecteur, payé sur son propre forfait mobile, souvent serré.",
      "L'ancienne page d'accueil du Corporate pesait 9 350 kilooctets ; la rédaction s'impose désormais un plafond de 600 kilooctets.",
      "La rédaction du Corporate publiera régulièrement le poids de ses pages, comme elle publie déjà ses corrections d'articles.",
    ],
    seo: {
      description: "Éditorial de la rédaction du Corporate : pourquoi le poids d'une page web est un arbitrage domestique au Gabon, et une responsabilité éditoriale.",
      keywords: [
        "éditorial",
        "coût de la donnée mobile",
        "performance web",
        "responsabilité éditoriale",
      ],
    },
    origin: "redaction",
    feature: "none",
    tags: [
      "editorial",
      "performance-web",
      "donnees-mobiles",
      "responsabilite-editoriale",
    ],
    daysAgo: 17,
    views: 1560,
    body: [
      {
        type: "paragraph",
        text: "À Port-Gentil comme à Libreville, un forfait de données se recharge en semaines, parfois en jours, selon le revenu du foyer et le prix du gigaoctet choisi. Chaque mégaoctet consommé par une page qui met trop de temps à s'afficher est un mégaoctet qui manquera ensuite pour autre chose : un message, une photo de famille, une recherche d'emploi. Ce choix n'appartient pas qu'au lecteur : il commence par les décisions prises dans nos rédactions.",
      },
      {
        type: "paragraph",
        text: "Nous avons longtemps traité le poids de nos pages comme un détail technique, réservé aux développeurs et invisible pour le lecteur. C'est une erreur : au Gabon, le mégaoctet est un arbitrage domestique, au même titre qu'une note d'électricité ou un plein de carburant, et il pèse d'autant plus lourd que le revenu du foyer est modeste. Une rédaction qui ignore ce rapport de force ignore une partie de son lectorat réel. Cette exigence traverse toutes nos pages, de l'[Éditorial](/rubrique/editorial) à la rubrique [Succès story](/rubrique/succes-story).",
      },
      {
        type: "heading",
        level: 2,
        text: "Le poids d'une page",
      },
      {
        type: "paragraph",
        text: "Une image mal compressée, une police de caractères superflue, un script publicitaire de trop : chacun de ces choix, pris isolément, semble anodin. Additionnés sur des milliers de visites quotidiennes, ils représentent des dizaines de gigaoctets facturés à nos lecteurs, sans qu'ils aient rien demandé, et sans qu'ils puissent le refuser. Le lecteur ne choisit pas d'ouvrir une page plus lourde que nécessaire : c'est la rédaction qui choisit, souvent sans y penser, à sa place.",
      },
      {
        type: "quote",
        text: "« Je lis vos articles au bureau, jamais chez moi : ma connexion ne le permet pas tous les jours. »",
        attribution: "Un lecteur de Port-Gentil, par courriel",
      },
      {
        type: "heading",
        level: 2,
        text: "Notre propre négligence",
      },
      {
        type: "paragraph",
        text: "L'ancienne version du site que nous publions aujourd'hui pesait 9 350 kilooctets par page d'accueil, soit environ neuf mégaoctets. Personne, dans la rédaction, n'avait vraiment mesuré ce que cela représentait pour un lecteur connecté depuis un téléphone d'entrée de gamme, dans une zone où le réseau mobile passe parfois de la 4G à une simple connexion de secours. Cette moyenne cachait sans doute des écarts plus violents encore pour les lecteurs les plus éloignés des grandes villes.",
      },
      {
        type: "paragraph",
        text: "Nous nous imposons désormais un plafond de **600 kilooctets** pour la page d'accueil, avec une cible à 450. Ce n'est pas un objectif marketing : c'est une ligne budgétaire, vérifiée à chaque publication comme on vérifie une orthographe ou une source. Aucun article ne part en publication sans relecture ; aucune page ne devrait partir en ligne sans ce même contrôle. Concrètement, la rédaction s'engage à :",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Publier le poids de chaque page dans nos mentions techniques",
          "Plafonner l'accueil à 600 kilooctets, cible à 450",
          "Faire repasser toute image en revue avant mise en ligne",
        ],
      },
      {
        type: "paragraph",
        text: "Un article mal vérifié abîme la confiance du lecteur. Une page trop lourde abîme son forfait et son temps. Les deux relèvent, à nos yeux, de la même exigence journalistique : ne pas faire payer à autrui, en argent ou en patience, le prix de notre négligence. Nous ne voyons pas de raison de traiter l'un sérieusement et l'autre par-dessus la jambe.",
      },
      {
        type: "paragraph",
        text: "Nous ne prétendons pas avoir réglé la question une fois pour toutes : la tentation d'ajouter une image, un *widget* ou un script reviendra à chaque nouvelle fonctionnalité. Nous nous engageons seulement à la mesurer, à la publier, et à corriger ce qui doit l'être, page après page, comme n'importe quelle autre erreur de rédaction. Ce texte lui-même sera un jour dépassé par nos propres pratiques ; nous préférons que ce soit noté ici plutôt que découvert ailleurs.",
      },
    ],
  },
  {
    slug: "solaire-120-mw-owendo-port-gentil",
    title: "Solaire : 120 MW attribués à Owendo et Port-Gentil",
    dek: "Deux centrales photovoltaïques totalisant 120 MW doivent alimenter Owendo et Port-Gentil d'ici 2027. L'électricité solaire promet un mix plus diversifié, mais le raccordement au réseau reste un chantier à part entière.",
    categorySlug: "business-lifestyle",
    subCategorySlug: "innovation",
    authorSlug: "serge-boussougou",
    heroMediaKey: "energie-solaire",
    keyPoints: [
      "Deux consortiums, Akanda Energy et Ogooué Solaire, ont remporté l'appel d'offres pour deux centrales solaires de 70 et 50 mégawatts.",
      "Le tarif d'achat négocié, environ 68 FCFA le kilowattheure, serait inférieur à celui des centrales thermiques d'appoint utilisées en pointe.",
      "Le raccordement des deux sites au réseau existant nécessite des renforcements dont le financement complet n'est pas encore bouclé.",
    ],
    seo: {
      description: "Deux centrales solaires de 120 mégawatts doivent alimenter Owendo et Port-Gentil, avec un effet attendu sur les coûts, mais un raccordement encore incertain.",
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
    tags: [
      "energie-solaire",
      "electricite",
      "innovation",
      "industrie",
    ],
    daysAgo: 19,
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
        label: "tarif d'achat négocié par kilowattheure solaire, contre plus de 90 FCFA pour l'appoint thermique",
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
];
