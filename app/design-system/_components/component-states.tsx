"use client";

import { useState } from "react";
import {
  CircleAlert,
  Download,
  Info,
  Share2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActionButton } from "@/components/custom/action-button";
import { CloseButton } from "@/components/custom/close-button";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { ThemeToggle } from "@/components/custom/theme-toggle";

/** Labelled cell: one component in one state. */
function StateCell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div>
        <p className="text-small font-semibold text-foreground">{label}</p>
        {hint && <p className="text-small text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function StateGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

function Block({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <h3 className="font-serif text-h3 text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-reading text-small text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Every base component of the design system, in each of its states.
 *
 * Hover and focus are live — point at the controls, then walk the page with
 * Tab. The cells labelled "aperçu" additionally freeze those states by
 * applying the same classes the component uses, so the reference stays
 * readable in a screenshot.
 */
export function ComponentStates() {
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);

  return (
    <div>
      <Block
        title="Boutons"
        description="ActionButton compose le bouton shadcn en imposant une cible de 44 px et un libellé de 15 px. Six variantes, cinq états."
      >
        <StateGrid>
          <StateCell label="Normal">
            <ActionButton>Publier l&apos;article</ActionButton>
            <ActionButton variant="outline">Enregistrer</ActionButton>
            <ActionButton variant="secondary">Aperçu</ActionButton>
          </StateCell>
          <StateCell label="Survol" hint="aperçu figé : bg-primary/80">
            <ActionButton className="bg-primary/80">
              Publier l&apos;article
            </ActionButton>
            <ActionButton variant="outline" className="bg-muted">
              Enregistrer
            </ActionButton>
          </StateCell>
          <StateCell
            label="Focus clavier"
            hint="aperçu figé : anneau 2 px + contour"
          >
            <ActionButton className="border-ring ring-3 ring-ring/50 outline-2 outline-offset-2 outline-[var(--ring)]">
              Publier l&apos;article
            </ActionButton>
          </StateCell>
          <StateCell label="Désactivé">
            <ActionButton disabled>Publier l&apos;article</ActionButton>
            <ActionButton variant="outline" disabled>
              Enregistrer
            </ActionButton>
          </StateCell>
          <StateCell label="Erreur / destructif">
            <ActionButton variant="destructive">
              Dépublier l&apos;article
            </ActionButton>
            <ActionButton aria-invalid>Champ invalide</ActionButton>
          </StateCell>
          <StateCell label="Autres variantes">
            <ActionButton variant="ghost">Fantôme</ActionButton>
            <ActionButton variant="link">Lien</ActionButton>
            <ActionButton shape="icon" aria-label="Partager">
              <Share2 aria-hidden="true" className="size-5" />
            </ActionButton>
          </StateCell>
        </StateGrid>
      </Block>

      <Block
        title="Champs de saisie"
        description="Hauteur 44 px, corps à 17 px : jamais de saisie illisible sur mobile. L'erreur est annoncée par aria-describedby et role=alert."
      >
        <StateGrid>
          <StateCell label="Normal">
            <div className="grid w-full gap-2">
              <Label htmlFor="ds-champ">Titre de l&apos;article</Label>
              <Input
                id="ds-champ"
                placeholder="Ex. : Le port d'Owendo double sa capacité"
                className="h-11 text-[1.0625rem]"
              />
            </div>
          </StateCell>
          <StateCell label="Focus clavier" hint="aperçu figé">
            <div className="grid w-full gap-2">
              <Label htmlFor="ds-champ-focus">Titre de l&apos;article</Label>
              <Input
                id="ds-champ-focus"
                defaultValue="Le port d'Owendo double sa capacité"
                className="h-11 border-ring text-[1.0625rem] ring-3 ring-ring/50 outline-2 outline-offset-2 outline-[var(--ring)]"
              />
            </div>
          </StateCell>
          <StateCell label="Désactivé">
            <div className="grid w-full gap-2">
              <Label htmlFor="ds-champ-off">Titre de l&apos;article</Label>
              <Input
                id="ds-champ-off"
                disabled
                defaultValue="Verrouillé pendant la relecture"
                className="h-11 text-[1.0625rem]"
              />
            </div>
          </StateCell>
          <StateCell label="Erreur">
            <div className="grid w-full gap-2">
              <Label htmlFor="ds-champ-erreur">Adresse électronique</Label>
              <Input
                id="ds-champ-erreur"
                aria-invalid
                aria-describedby="ds-champ-erreur-msg"
                defaultValue="redaction@"
                className="h-11 text-[1.0625rem]"
              />
              <p
                id="ds-champ-erreur-msg"
                role="alert"
                className="text-small text-destructive"
              >
                Cette adresse électronique n&apos;est pas valide.
              </p>
            </div>
          </StateCell>
          <StateCell label="Zone de texte">
            <Textarea
              placeholder="Chapô de l'article (deux phrases maximum)."
              className="min-h-24 text-[1.0625rem]"
            />
          </StateCell>
          <StateCell label="Sélecteur">
            <Select defaultValue="business-lifestyle">
              <SelectTrigger className="h-11 w-full text-[1.0625rem]">
                <SelectValue placeholder="Choisir une rubrique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business-lifestyle">
                  Business &amp; Lifestyle
                </SelectItem>
                <SelectItem value="editorial">Éditorial</SelectItem>
                <SelectItem value="succes-story">Succès story</SelectItem>
                <SelectItem value="espace-pro">Espace pro</SelectItem>
              </SelectContent>
            </Select>
          </StateCell>
        </StateGrid>
      </Block>

      <Block title="Contrôles binaires">
        <StateGrid>
          <StateCell label="Case à cocher">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-small">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />
              Contenu partenaire
            </label>
          </StateCell>
          <StateCell label="Case à cocher désactivée">
            <label className="flex min-h-[44px] items-center gap-3 text-small opacity-70">
              <Checkbox disabled checked />
              Mention « Communiqué » (non contournable)
            </label>
          </StateCell>
          <StateCell label="Case à cocher en erreur">
            <label className="flex min-h-[44px] items-center gap-3 text-small">
              <Checkbox aria-invalid />
              J&apos;accepte la charte éditoriale
            </label>
          </StateCell>
          <StateCell label="Interrupteur">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-small">
              <Switch checked={switched} onCheckedChange={setSwitched} />
              Programmer la publication
            </label>
          </StateCell>
          <StateCell label="Interrupteur désactivé">
            <label className="flex min-h-[44px] items-center gap-3 text-small opacity-70">
              <Switch disabled />
              Agent Diffusion (activé au lot 3)
            </label>
          </StateCell>
          <StateCell label="Préférences du lecteur">
            <DataSaverToggle />
            <ThemeToggle />
          </StateCell>
        </StateGrid>
      </Block>

      <Block
        title="Étiquettes et identité"
        description="Le badge de rubrique porte l'accent de sa rubrique ; il ne dépasse jamais 16 px de rayon."
      >
        <StateGrid>
          <StateCell label="Badges">
            <Badge>Une</Badge>
            <Badge variant="secondary">Dossier</Badge>
            <Badge variant="outline">Brouillon</Badge>
            <Badge variant="destructive">Refusé</Badge>
          </StateCell>
          <StateCell label="Badges de rubrique">
            <Badge className="bg-navy-900 text-white dark:bg-navy-300 dark:text-navy-950">
              Business &amp; Lifestyle
            </Badge>
            <Badge className="bg-magenta-600 text-white dark:bg-magenta-300 dark:text-magenta-950">
              Succès story
            </Badge>
          </StateCell>
          <StateCell label="Avatar et séparateur">
            <Avatar className="size-10 rounded-md after:rounded-md">
              <AvatarFallback className="rounded-md">AM</AvatarFallback>
            </Avatar>
            <Separator orientation="vertical" className="h-10" />
            <span className="text-small text-muted-foreground">
              Aline&nbsp;Mba, rédactrice en chef
            </span>
          </StateCell>
        </StateGrid>
      </Block>

      <Block title="Messages">
        <div className="grid gap-4 lg:grid-cols-2">
          <Alert>
            <Info aria-hidden="true" />
            <AlertTitle>Relecture proposée par un agent</AlertTitle>
            <AlertDescription>
              Trois corrections typographiques sont proposées. Un agent propose,
              un humain dispose.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Dépôt refusé</AlertTitle>
            <AlertDescription>
              Le motif du refus est obligatoire et sera transmis à
              l&apos;entreprise.
            </AlertDescription>
          </Alert>
          <Alert className="border-[var(--warning)]">
            <TriangleAlert
              aria-hidden="true"
              className="text-[var(--warning)]"
            />
            <AlertTitle>Budget de performance dépassé</AlertTitle>
            <AlertDescription>
              La page pèse 640 Ko : au-dessus du plafond de 600 Ko.
            </AlertDescription>
          </Alert>
          <Alert className="border-[var(--success)]">
            <Download aria-hidden="true" className="text-[var(--success)]" />
            <AlertTitle>Article programmé</AlertTitle>
            <AlertDescription>
              Publication prévue le 15 septembre à 07 h 00.
            </AlertDescription>
          </Alert>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <ActionButton
            variant="outline"
            onClick={() =>
              toast.success("Article enregistré", {
                description: "Version 4 · brouillon",
              })
            }
          >
            Notification de succès
          </ActionButton>
          <ActionButton
            variant="outline"
            onClick={() =>
              toast.error("Échec de l'enregistrement", {
                description: "Vérifiez votre connexion puis réessayez.",
              })
            }
          >
            Notification d&apos;erreur
          </ActionButton>
        </div>
      </Block>

      <Block title="Chargement">
        <div className="max-w-md rounded-md border border-border bg-card p-4">
          <Skeleton className="h-4 w-24 rounded-xs" />
          <Skeleton className="mt-3 h-7 w-full rounded-xs" />
          <Skeleton className="mt-2 h-7 w-4/5 rounded-xs" />
          <Skeleton className="mt-4 h-4 w-40 rounded-xs" />
        </div>
      </Block>

      <Block title="Navigation et surcouches">
        <StateGrid>
          <StateCell label="Onglets">
            <Tabs defaultValue="apercu" className="w-full">
              <TabsList className="h-11">
                <TabsTrigger value="apercu" className="min-h-[38px] px-4">
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="seo" className="min-h-[38px] px-4">
                  SEO
                </TabsTrigger>
                <TabsTrigger
                  value="agents"
                  className="min-h-[38px] px-4"
                  disabled
                >
                  Agents
                </TabsTrigger>
              </TabsList>
              <TabsContent value="apercu" className="pt-2 text-small">
                Le contenu de l&apos;onglet actif.
              </TabsContent>
              <TabsContent value="seo" className="pt-2 text-small">
                Slug, méta-description et données structurées.
              </TabsContent>
            </Tabs>
          </StateCell>

          <StateCell label="Info-bulle" hint="au survol et au focus clavier">
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionButton variant="outline">Temps de lecture</ActionButton>
              </TooltipTrigger>
              <TooltipContent>Estimé à 230 mots par minute.</TooltipContent>
            </Tooltip>
          </StateCell>

          <StateCell label="Menu déroulant">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ActionButton variant="outline">Actions</ActionButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Article</DropdownMenuLabel>
                <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                <DropdownMenuItem>Programmer</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Dépublier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </StateCell>

          <StateCell label="Boîte de dialogue">
            <Dialog>
              <DialogTrigger asChild>
                <ActionButton variant="outline">Ouvrir la modale</ActionButton>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader className="pr-12">
                  <DialogTitle className="font-serif text-h3">
                    Dépublier l&apos;article ?
                  </DialogTitle>
                  <DialogDescription>
                    L&apos;article ne sera plus accessible publiquement. Cette
                    action est tracée dans le journal d&apos;audit.
                  </DialogDescription>
                </DialogHeader>
                <div className="absolute top-2 right-2">
                  <DialogClose asChild>
                    <CloseButton />
                  </DialogClose>
                </div>
                <DialogFooter showCloseButton={false}>
                  <DialogClose asChild>
                    <ActionButton variant="outline">Annuler</ActionButton>
                  </DialogClose>
                  <DialogClose asChild>
                    <ActionButton variant="destructive">Dépublier</ActionButton>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </StateCell>

          <StateCell label="Feuille latérale">
            <Sheet>
              <SheetTrigger asChild>
                <ActionButton variant="outline">Ouvrir le tiroir</ActionButton>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton={false}>
                <SheetHeader className="flex-row items-start justify-between">
                  <div>
                    <SheetTitle className="font-serif text-h3">
                      Filtres
                    </SheetTitle>
                    <SheetDescription>
                      Affiner la liste par rubrique et par statut.
                    </SheetDescription>
                  </div>
                  <SheetClose asChild>
                    <CloseButton />
                  </SheetClose>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </StateCell>

          <StateCell label="Accordéon">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="un">
                <AccordionTrigger className="min-h-[44px]">
                  Sous-rubriques d&apos;Espace pro
                </AccordionTrigger>
                <AccordionContent className="text-small">
                  Docuthèques · Formation · Opportunités · Réglementations ·
                  Séminaires
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </StateCell>
        </StateGrid>
      </Block>
    </div>
  );
}
