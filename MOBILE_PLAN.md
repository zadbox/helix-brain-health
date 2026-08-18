# PLAN DE CHANTIER — VERSION MOBILE
**HELIX Brain Health | Date : 2026-04-03**

---

## DIAGNOSTIC ACTUEL

### Problèmes bloquants sur mobile

| Problème | Fichier | Gravité |
|----------|---------|---------|
| Layout `w-1/2` fixe — deux colonnes impossibles sur mobile | `app/page.tsx` | 🔴 Bloquant |
| `overflow-hidden` sur le body → impossible de scroller | `app/page.tsx`, `app/layout.tsx` | 🔴 Bloquant |
| Top bar : subtitle trop long, disparaît sur petits écrans | `app/page.tsx` | 🟠 Majeur |
| Chips Examen Clinique trop petites (`px-2.5 py-1 text-xs`) — touch difficile | `FichePatient.tsx` | 🟠 Majeur |
| Chat input collé en bas — masqué par le clavier virtuel | `AgentPanel.tsx` | 🟠 Majeur |
| ReportModal pleine largeur non adaptée | `ReportModal.tsx` | 🟡 Moyen |
| Boutons reset & rapport trop petits pour le touch | `page.tsx`, `AgentPanel.tsx` | 🟡 Moyen |

### Ce qui fonctionne déjà bien
- Sections collapsibles FichePatient ✅
- EVA slider tactile ✅
- Voice input (Web Speech API) ✅
- Zustand store → pas de refactoring nécessaire ✅
- Framer Motion animations ✅

---

## ARCHITECTURE CIBLE (mobile)

```
Desktop (≥ 768px)                Mobile (< 768px)
┌──────────┬──────────┐          ┌─────────────────┐
│          │          │          │   Top Bar        │
│  Fiche   │  Agent   │   →      ├─────────────────┤
│ Patient  │   IA     │          │  [Fiche] [Agent] │  ← Onglets
│          │          │          ├─────────────────┤
└──────────┴──────────┘          │                  │
                                 │  Contenu actif   │
                                 │  (scroll libre)  │
                                 │                  │
                                 └─────────────────┘
```

**Pattern retenu : Tab Navigation (onglets en haut)**
- Onglet 1 : Fiche Patient
- Onglet 2 : Agent IA / HELIX
- Indicateur de notifications sur l'onglet Agent (nouvelles hypothèses)

---

## CHANTIER 1 — LAYOUT PRINCIPAL (page.tsx)
**Priorité : 🔴 Critique — À faire en premier**

### Changements
- Remplacer `w-1/2` fixe par `md:w-1/2` + système d'onglets sur mobile
- Ajouter state `activeTab: "fiche" | "agent"`
- `overflow-hidden` → garder sur desktop, retirer sur mobile
- Top bar mobile : garder logo + "HELIX", masquer subtitle, adapter bouton reset

### Fichiers touchés
- `app/page.tsx` — refactoring principal

### Code cible (structure)
```tsx
// Desktop : flex côte à côte
// Mobile : tabs + un seul panneau visible
<div className="flex flex-col h-screen">
  <TopBar />
  <TabBar activeTab={activeTab} onChange={setActiveTab} /> {/* mobile only */}
  <div className="flex flex-1 overflow-hidden">
    <div className={cn("flex flex-col", activeTab === "fiche" ? "flex" : "hidden", "md:flex md:w-1/2")}>
      <FichePatientForm />
    </div>
    <div className={cn("flex flex-col", activeTab === "agent" ? "flex" : "hidden", "md:flex md:w-1/2")}>
      <AgentPanel />
    </div>
  </div>
</div>
```

---

## CHANTIER 2 — FICHE PATIENT (FichePatient.tsx)
**Priorité : 🟠 Majeur**

### Changements
- Chips Examen Clinique : `px-2.5 py-1` → `px-3 py-1.5` + `text-sm` sur mobile
- Grilles : `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` pour les champs identité/constantes
- Grille constantes : `grid-cols-3` → `grid-cols-2 sm:grid-cols-3`
- CheckGroup : déjà en 2 colonnes, garder
- Boutons motif principal : déjà en 2 colonnes, garder (taille suffisante après font-size)

### Fichiers touchés
- `components/consultation/FichePatient.tsx`

---

## CHANTIER 3 — AGENT PANEL (AgentPanel.tsx)
**Priorité : 🟠 Majeur**

### Problème clavier virtuel
Sur mobile, quand le clavier s'ouvre, il pousse le contenu vers le haut et masque le champ de saisie. Solution : utiliser `dvh` (dynamic viewport height) ou `visualViewport` API.

### Changements
- Conteneur chat : `h-screen` → `h-[100dvh]` sur mobile
- Input zone : `position: sticky; bottom: 0` avec padding safe-area
- Ajouter `env(safe-area-inset-bottom)` pour les iPhones avec barre home
- Bouton micro : taille minimale 44×44px (Apple HIG)
- Panneau hypothèses : scroll horizontal ou cards empilées

### Fichiers touchés
- `components/agent/AgentPanel.tsx`

---

## CHANTIER 4 — REPORT MODAL (ReportModal.tsx)
**Priorité : 🟡 Moyen**

### Changements
- `max-w-4xl` → `w-full md:max-w-4xl` + `h-full md:h-auto`
- Marges internes réduites sur mobile
- Bouton imprimer : masquer sur mobile (pas de print natif) → remplacer par "Partager" (Web Share API)

### Fichiers touchés
- `components/consultation/ReportModal.tsx`

---

## CHANTIER 5 — SAFE AREA & POLISH
**Priorité : 🟡 Moyen — Phase finale**

### CSS à ajouter dans globals.css
```css
/* Safe area pour iPhone notch / Dynamic Island / barre home */
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-top    { padding-top: env(safe-area-inset-top); }

/* Dynamic viewport height (résout le problème du clavier virtuel) */
.h-dvh { height: 100dvh; }
```

### Meta viewport (layout.tsx)
```tsx
// Déjà présent dans Next.js 14 par défaut, vérifier :
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### Fichiers touchés
- `app/globals.css`
- `app/layout.tsx`

---

## CHANTIER 6 — NAVIGATION BADGE (bonus UX)
**Priorité : 🟢 Optionnel**

Quand l'agent génère de nouvelles hypothèses alors que l'utilisateur est sur l'onglet Fiche, afficher un badge rouge sur l'onglet Agent.

```tsx
// Logique : écouter store.agent.hypotheses.length depuis page.tsx
// Si activeTab === "fiche" && nouvelles hypothèses → badge
```

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
1. Chantier 1 — Layout (page.tsx)          ← débloque tout
2. Chantier 5 — Safe area / globals.css    ← fondation CSS
3. Chantier 3 — AgentPanel (clavier)       ← UX critique
4. Chantier 2 — FichePatient (grilles)     ← polish form
5. Chantier 4 — ReportModal                ← finishing touch
6. Chantier 6 — Badge notification         ← bonus
```

---

## CHECKLIST DE VALIDATION MOBILE

Tester sur :
- [ ] iPhone SE (375px) — le plus contraignant
- [ ] iPhone 14 Pro (393px) avec Dynamic Island
- [ ] iPad (768px) — breakpoint md: doit basculer en desktop
- [ ] Android Chrome (360px)

Tests fonctionnels :
- [ ] Scroll fluide dans la fiche patient
- [ ] Clavier virtuel ne masque pas le chat input
- [ ] Voice input fonctionne (micro Chrome Android / Safari iOS)
- [ ] Onglets basculent correctement
- [ ] Modal rapport s'affiche en plein écran
- [ ] Alertes constantes visibles
- [ ] Safe area respectée (pas de contenu derrière la barre home)
- [ ] Touch targets ≥ 44px sur les éléments interactifs

---

## RÉSUMÉ EFFORT ESTIMÉ

| Chantier | Fichiers modifiés | Complexité |
|----------|------------------|------------|
| 1 — Layout | page.tsx | ⭐⭐⭐ |
| 2 — FichePatient grilles | FichePatient.tsx | ⭐⭐ |
| 3 — AgentPanel clavier | AgentPanel.tsx | ⭐⭐⭐ |
| 4 — ReportModal | ReportModal.tsx | ⭐ |
| 5 — Safe area | globals.css, layout.tsx | ⭐ |
| 6 — Badge | page.tsx | ⭐ |

**Total : 5 fichiers à modifier — zéro nouvelle dépendance**

---

*Plan généré le 2026-04-03 — HELIX BRAINHEALTH Mobile*
