"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowUp, Crosshair } from "lucide-react";
import { ChatMessage, FichePatient } from "@/types";
import { cn } from "@/lib/utils";

type BodyView = "front" | "back";
type BodyMode = "body" | "face";

type BodyRegionId =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "pelvis"
  | "back"
  | "shoulder-left"
  | "shoulder-right"
  | "elbow-left"
  | "elbow-right"
  | "wrist-left"
  | "wrist-right"
  | "hip-left"
  | "hip-right"
  | "knee-left"
  | "knee-right"
  | "ankle-left"
  | "ankle-right"
  | "ear-left"
  | "ear-right"
  | "eye-left"
  | "eye-right"
  | "nose"
  | "mouth"
  | "throat"
  | "sinus-frontal-left"
  | "sinus-frontal-right"
  | "sinus-maxillary-left"
  | "sinus-maxillary-right"
  | "temple-left"
  | "temple-right";

interface BodyRegionDefinition {
  id: BodyRegionId;
  label: string;
  detail: string;
  x: number;
  y: number;
  radius: number;
  view: BodyView | "both";
  joint?: boolean;
}

interface BodyMapProps {
  fiche: FichePatient;
  messages: ChatMessage[];
}

const BODY_REGIONS: BodyRegionDefinition[] = [
  { id: "head", label: "Tête", detail: "Région céphalique", x: 120, y: 31, radius: 13, view: "both" },
  { id: "neck", label: "Cou", detail: "Région cervicale", x: 120, y: 58, radius: 8, view: "both" },
  { id: "chest", label: "Thorax", detail: "Région thoracique", x: 120, y: 96, radius: 19, view: "front" },
  { id: "back", label: "Dos", detail: "Région dorsale / lombaire", x: 120, y: 112, radius: 22, view: "back" },
  { id: "abdomen", label: "Abdomen", detail: "Région abdominale", x: 120, y: 140, radius: 16, view: "front" },
  { id: "pelvis", label: "Bassin", detail: "Région pelvienne", x: 120, y: 178, radius: 15, view: "both" },
  { id: "shoulder-left", label: "Épaule gauche", detail: "Articulation gléno-humérale gauche", x: 91, y: 76, radius: 10, view: "both", joint: true },
  { id: "shoulder-right", label: "Épaule droite", detail: "Articulation gléno-humérale droite", x: 149, y: 76, radius: 10, view: "both", joint: true },
  { id: "elbow-left", label: "Coude gauche", detail: "Articulation du coude gauche", x: 68, y: 118, radius: 9, view: "both", joint: true },
  { id: "elbow-right", label: "Coude droit", detail: "Articulation du coude droit", x: 172, y: 118, radius: 9, view: "both", joint: true },
  { id: "wrist-left", label: "Poignet gauche", detail: "Articulation du poignet gauche", x: 56, y: 163, radius: 8, view: "both", joint: true },
  { id: "wrist-right", label: "Poignet droit", detail: "Articulation du poignet droit", x: 184, y: 163, radius: 8, view: "both", joint: true },
  { id: "hip-left", label: "Hanche gauche", detail: "Articulation coxo-fémorale gauche", x: 104, y: 184, radius: 10, view: "both", joint: true },
  { id: "hip-right", label: "Hanche droite", detail: "Articulation coxo-fémorale droite", x: 136, y: 184, radius: 10, view: "both", joint: true },
  { id: "knee-left", label: "Genou gauche", detail: "Articulation du genou gauche", x: 104, y: 242, radius: 10, view: "both", joint: true },
  { id: "knee-right", label: "Genou droit", detail: "Articulation du genou droit", x: 136, y: 242, radius: 10, view: "both", joint: true },
  { id: "ankle-left", label: "Cheville gauche", detail: "Articulation de la cheville gauche", x: 101, y: 300, radius: 8, view: "both", joint: true },
  { id: "ankle-right", label: "Cheville droite", detail: "Articulation de la cheville droite", x: 139, y: 300, radius: 8, view: "both", joint: true },
];

// Coordinates follow the patient's laterality: on a frontal view, the
// patient's left side appears on the right side of the screen.
const FACE_REGIONS: BodyRegionDefinition[] = [
  { id: "ear-left", label: "Oreille gauche", detail: "Région auriculaire gauche", x: 184, y: 116, radius: 11, view: "front" },
  { id: "ear-right", label: "Oreille droite", detail: "Région auriculaire droite", x: 56, y: 116, radius: 11, view: "front" },
  { id: "eye-left", label: "Œil gauche", detail: "Région orbitaire gauche", x: 145, y: 112, radius: 9, view: "front" },
  { id: "eye-right", label: "Œil droit", detail: "Région orbitaire droite", x: 95, y: 112, radius: 9, view: "front" },
  { id: "nose", label: "Nez", detail: "Région nasale", x: 120, y: 143, radius: 10, view: "front" },
  { id: "mouth", label: "Bouche", detail: "Région buccale et mandibulaire", x: 120, y: 177, radius: 11, view: "front" },
  { id: "throat", label: "Gorge", detail: "Région pharyngo-laryngée", x: 120, y: 236, radius: 13, view: "front" },
  { id: "sinus-frontal-left", label: "Sinus frontal gauche", detail: "Projection du sinus frontal gauche", x: 143, y: 84, radius: 10, view: "front" },
  { id: "sinus-frontal-right", label: "Sinus frontal droit", detail: "Projection du sinus frontal droit", x: 97, y: 84, radius: 10, view: "front" },
  { id: "sinus-maxillary-left", label: "Sinus maxillaire gauche", detail: "Projection du sinus maxillaire gauche", x: 146, y: 148, radius: 10, view: "front" },
  { id: "sinus-maxillary-right", label: "Sinus maxillaire droit", detail: "Projection du sinus maxillaire droit", x: 94, y: 148, radius: 10, view: "front" },
  { id: "temple-left", label: "Tempe gauche", detail: "Région temporale gauche", x: 166, y: 94, radius: 10, view: "front" },
  { id: "temple-right", label: "Tempe droite", detail: "Région temporale droite", x: 74, y: 94, radius: 10, view: "front" },
];

const ALL_REGIONS = [...BODY_REGIONS, ...FACE_REGIONS];

const JOINT_REGION_IDS: BodyRegionId[] = [
  "shoulder-left",
  "shoulder-right",
  "elbow-left",
  "elbow-right",
  "wrist-left",
  "wrist-right",
  "hip-left",
  "hip-right",
  "knee-left",
  "knee-right",
  "ankle-left",
  "ankle-right",
];

const SIDE_WORDS = {
  left: /(gauche|g\.|cote gauche|membre gauche)/,
  right: /(droite|droit|d\.|cote droit|cote droite|membre droit)/,
};

function normalize(text: string): string {
  return text
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe");
}

function addSideAwareRegion(
  regions: Set<BodyRegionId>,
  base: "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle",
  text: string,
  pattern: RegExp
) {
  const side = getSideNearMatch(text, pattern);

  if (side === "left") regions.add(`${base}-left` as BodyRegionId);
  else if (side === "right") regions.add(`${base}-right` as BodyRegionId);
  else {
    regions.add(`${base}-left` as BodyRegionId);
    regions.add(`${base}-right` as BodyRegionId);
  }
}

function getSideNearMatch(text: string, pattern: RegExp): "left" | "right" | "both" {
  const match = text.match(pattern);
  if (!match || match.index === undefined) return "both";
  const start = Math.max(0, match.index - 24);
  const end = Math.min(text.length, match.index + match[0].length + 24);
  const context = text.slice(start, end);
  const leftMatch = context.match(SIDE_WORDS.left);
  const rightMatch = context.match(SIDE_WORDS.right);

  if (leftMatch && !rightMatch) return "left";
  if (rightMatch && !leftMatch) return "right";
  if (!leftMatch || !rightMatch || leftMatch.index === undefined || rightMatch.index === undefined) return "both";

  const anchor = match.index - start + match[0].length / 2;
  const leftDistance = Math.abs(leftMatch.index + leftMatch[0].length / 2 - anchor);
  const rightDistance = Math.abs(rightMatch.index + rightMatch[0].length / 2 - anchor);
  return leftDistance < rightDistance ? "left" : rightDistance < leftDistance ? "right" : "both";
}

function addBilateralFaceRegion(
  regions: Set<BodyRegionId>,
  leftId: BodyRegionId,
  rightId: BodyRegionId,
  text: string,
  pattern: RegExp
) {
  if (!pattern.test(text)) return;
  const side = getSideNearMatch(text, pattern);

  if (side === "left") regions.add(leftId);
  else if (side === "right") regions.add(rightId);
  else {
    regions.add(leftId);
    regions.add(rightId);
  }
}

function detectBodyRegions(fiche: FichePatient, messages: ChatMessage[]) {
  const ficheLocation = [
    fiche.motifLibre,
    fiche.hmaLibre,
    fiche.hmaDouleur?.localisation,
    fiche.hmaDouleur?.irradiation,
    fiche.signesAssocies?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  const chatLocation = messages
    .filter((message) => message.role === "medecin")
    .slice(-8)
    .map((message) => message.content)
    .join(" ");

  const locationText = normalize(`${ficheLocation} ${chatLocation}`);
  const regions = new Set<BodyRegionId>();
  const earPattern = /(oreille|otalg|otite|acouphen|tinnitus|auricul|tympan|hypoacous|surdite)/;
  const eyePattern = /(oeil|yeux|ocul|orbite|vision|diplop|conjonctiv)/;
  const nosePattern = /(nez|nasal|rhin|epistaxis|anosmie|odorat)/;
  const mouthPattern = /(bouche|buccal|levre|langue|dentaire|dent|machoire)/;
  const throatPattern = /(gorge|pharyn|laryn|amygdal|odynophag|dysphag|voix)/;
  const frontalSinusPattern = /(sinus frontal|frontal)/;
  const maxillarySinusPattern = /(sinus maxill|maxill|pommette|joue)/;
  const generalSinusPattern = /(sinusite|sinus)/;
  const templePattern = /(tempe|temporal)/;
  const hasFaceSignal =
    fiche.motifPrincipal === "orl" ||
    [earPattern, eyePattern, nosePattern, mouthPattern, throatPattern, generalSinusPattern, templePattern]
      .some((pattern) => pattern.test(locationText));

  if (
    fiche.motifPrincipal === "cephalee" ||
    fiche.motifPrincipal === "vertiges" ||
    /(mal de tete|maux de tete|cephale|migraine|crane|tempe|frontal|occipital)/.test(locationText)
  ) {
    regions.add("head");
  }

  if (/(cervical|nuque|cou)/.test(locationText)) regions.add("neck");
  if (fiche.motifPrincipal === "dyspnee" || fiche.motifPrincipal === "toux" || /(thorax|thoracique|poitrine|cote|sternum|respirat)/.test(locationText)) {
    regions.add("chest");
  }
  if (fiche.motifPrincipal === "digestif" || /(abdomen|abdominal|ventre|epigastre|estomac|foie|flanc)/.test(locationText)) {
    regions.add("abdomen");
  }
  if (fiche.motifPrincipal === "urinaire" || /(pelvis|pelvien|bassin|aine|bas ventre|pubis)/.test(locationText)) {
    regions.add("pelvis");
  }
  if (/(dos|dorsal|lombaire|lombalgie|rachis|colonne|vertebre)/.test(locationText)) regions.add("back");

  addBilateralFaceRegion(regions, "ear-left", "ear-right", locationText, earPattern);
  addBilateralFaceRegion(regions, "eye-left", "eye-right", locationText, eyePattern);
  addBilateralFaceRegion(regions, "temple-left", "temple-right", locationText, templePattern);
  if (nosePattern.test(locationText)) regions.add("nose");
  if (mouthPattern.test(locationText)) regions.add("mouth");
  if (throatPattern.test(locationText)) regions.add("throat");

  const hasSpecificFrontalSinus = frontalSinusPattern.test(locationText);
  const hasSpecificMaxillarySinus = maxillarySinusPattern.test(locationText);
  if (hasSpecificFrontalSinus) {
    addBilateralFaceRegion(regions, "sinus-frontal-left", "sinus-frontal-right", locationText, frontalSinusPattern);
  }
  if (hasSpecificMaxillarySinus) {
    addBilateralFaceRegion(regions, "sinus-maxillary-left", "sinus-maxillary-right", locationText, maxillarySinusPattern);
  }
  if (generalSinusPattern.test(locationText) && !hasSpecificFrontalSinus && !hasSpecificMaxillarySinus) {
    addBilateralFaceRegion(regions, "sinus-frontal-left", "sinus-frontal-right", locationText, generalSinusPattern);
    addBilateralFaceRegion(regions, "sinus-maxillary-left", "sinus-maxillary-right", locationText, generalSinusPattern);
  }

  const jointSignal =
    /(articul|synovit|polyarth|rhumat)/.test(locationText) ||
    (/(inflamm)/.test(locationText) && /(epaule|coude|poignet|hanche|genou|cheville|joint)/.test(locationText));
  if (jointSignal) {
    const jointMappings: Array<{ pattern: RegExp; base: "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" }> = [
      { pattern: /(epaule|deltoide)/, base: "shoulder" },
      { pattern: /(coude|olecrane)/, base: "elbow" },
      { pattern: /(poignet|carpe)/, base: "wrist" },
      { pattern: /(hanche|coxofemorale)/, base: "hip" },
      { pattern: /(genou|rotule|gonalg)/, base: "knee" },
      { pattern: /(cheville|mall|tarse)/, base: "ankle" },
    ];
    const specificMappings = jointMappings.filter(({ pattern }) => pattern.test(locationText));
    if (!specificMappings.length) {
      JOINT_REGION_IDS.forEach((id) => regions.add(id));
    } else {
      specificMappings.forEach(({ base, pattern }) => addSideAwareRegion(regions, base, locationText, pattern));
    }
  } else {
    const directMappings: Array<{ pattern: RegExp; base: "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" }> = [
      { pattern: /(epaule|deltoide)/, base: "shoulder" },
      { pattern: /(coude|olecrane)/, base: "elbow" },
      { pattern: /(poignet|carpe)/, base: "wrist" },
      { pattern: /(hanche|coxofemorale)/, base: "hip" },
      { pattern: /(genou|rotule|gonalg)/, base: "knee" },
      { pattern: /(cheville|mall|tarse)/, base: "ankle" },
    ];
    directMappings.filter(({ pattern }) => pattern.test(locationText)).forEach(({ base, pattern }) => addSideAwareRegion(regions, base, locationText, pattern));
  }

  const activeDefinitions = ALL_REGIONS.filter(({ id }) => regions.has(id));
  const activeBodyDefinitions = BODY_REGIONS.filter(({ id }) => regions.has(id));
  const activeFaceDefinitions = FACE_REGIONS.filter(({ id }) => regions.has(id));
  const hasGeneralJointSignal = jointSignal && !/(epaule|coude|poignet|hanche|genou|cheville)/.test(locationText);
  const labels = hasGeneralJointSignal
    ? ["Articulations multiples"]
    : Array.from(new Set(activeDefinitions.map((region) => region.label)));

  return {
    regions: activeDefinitions,
    bodyRegions: activeBodyDefinitions,
    faceRegions: activeFaceDefinitions,
    labels,
    hasSignal: regions.size > 0,
    defaultMode: hasFaceSignal || activeFaceDefinitions.length > 0 ? "face" as BodyMode : "body" as BodyMode,
    defaultView: activeBodyDefinitions.some((region) => region.view === "back") && !activeBodyDefinitions.some((region) => region.view === "front") ? "back" as BodyView : "front" as BodyView,
  };
}

function BodySilhouette({ view }: { view: BodyView }) {
  return (
    <motion.g
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{ transformOrigin: "120px 170px" }}
    >
      <ellipse cx="120" cy="322" rx="45" ry="4.5" fill="#050d18" opacity="0.72" />

      {/* Limbs sit behind the torso to keep the outline natural. */}
      <path
        d="M88 76 C80 91 75 108 70 126 C66 143 62 158 58 172"
        fill="none"
        stroke="url(#bodyFill)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#bodyGlow)"
      />
      <path
        d="M152 76 C160 91 165 108 170 126 C174 143 178 158 182 172"
        fill="none"
        stroke="url(#bodyFill)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#bodyGlow)"
      />
      <path d="M54 170 C52 177 53 182 57 186 C61 182 62 176 62 171 Z" fill="#405d7a" stroke="#9fb3ca" strokeWidth="0.9" />
      <path d="M186 170 C188 177 187 182 183 186 C179 182 178 176 178 171 Z" fill="#405d7a" stroke="#9fb3ca" strokeWidth="0.9" />

      <path d="M106 181 C105 205 104 226 104 244 C104 264 102 286 100 305" fill="none" stroke="url(#bodyFill)" strokeWidth="18" strokeLinecap="round" filter="url(#bodyGlow)" />
      <path d="M134 181 C135 205 136 226 136 244 C136 264 138 286 140 305" fill="none" stroke="url(#bodyFill)" strokeWidth="18" strokeLinecap="round" filter="url(#bodyGlow)" />
      <path d="M94 304 C99 301 106 302 110 307 L113 315 C105 318 91 318 83 315 C84 311 88 307 94 304 Z" fill="#405d7a" stroke="#9fb3ca" strokeWidth="1" />
      <path d="M146 304 C141 301 134 302 130 307 L127 315 C135 318 149 318 157 315 C156 311 152 307 146 304 Z" fill="#405d7a" stroke="#9fb3ca" strokeWidth="1" />

      {/* Balanced torso and pelvis. */}
      <path
        d="M105 59 C95 61 86 66 81 74 C78 82 80 96 84 112 L90 142 C92 155 96 170 100 184 C106 189 112 192 120 192 C128 192 134 189 140 184 C144 170 148 155 150 142 L156 112 C160 96 162 82 159 74 C154 66 145 61 135 59 C130 64 126 67 120 68 C114 67 110 64 105 59 Z"
        fill="url(#bodyFill)"
        stroke="#9fb3ca"
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#bodyGlow)"
      />

      {/* Neck and head. */}
      <path d="M112 49 C113 55 111 58 106 61 C110 66 115 68 120 68 C125 68 130 66 134 61 C129 58 127 55 128 49 Z" fill="url(#bodyFill)" stroke="#9fb3ca" strokeWidth="1" />
      <ellipse cx="120" cy="31" rx="15.5" ry="19.5" fill="url(#bodyFill)" stroke="#a9bdd1" strokeWidth="1.2" filter="url(#bodyGlow)" />

      {/* One restrained orientation landmark. */}
      {view === "back" ? (
        <path d="M120 68 L120 174" fill="none" stroke="url(#anatomyLine)" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      ) : (
        <path d="M120 72 L120 150" fill="none" stroke="url(#anatomyLine)" strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
      )}

    </motion.g>
  );
}

function FaceSilhouette() {
  return (
    <motion.g
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{ transformOrigin: "120px 150px" }}
    >
      {/* Shoulders and neck establish a realistic clinical portrait crop. */}
      <path
        d="M18 296 C24 260 49 236 83 226 C96 222 102 215 103 194 L137 194 C138 215 144 222 157 226 C191 236 216 260 222 296 Z"
        fill="url(#faceFill)"
        stroke="#91a9c1"
        strokeWidth="1.2"
        filter="url(#bodyGlow)"
      />
      <path d="M103 187 C105 207 111 217 120 217 C129 217 135 207 137 187 Z" fill="url(#faceFill)" stroke="#9fb3ca" strokeWidth="1" />

      {/* Ears sit behind the facial contour. */}
      <path d="M77 91 C65 86 60 98 63 116 C66 132 72 143 82 139 L87 107 Z" fill="#425f7d" stroke="#a9bdd1" strokeWidth="1.1" />
      <path d="M163 91 C175 86 180 98 177 116 C174 132 168 143 158 139 L153 107 Z" fill="#425f7d" stroke="#a9bdd1" strokeWidth="1.1" />
      <path d="M71 103 C68 110 71 125 77 130 M169 103 C172 110 169 125 163 130" fill="none" stroke="#c4d3e1" strokeWidth="0.9" opacity="0.55" />

      {/* Face: cranium, cheekbones and jaw in one continuous contour. */}
      <path
        d="M120 22 C92 22 76 43 76 77 C76 96 79 119 84 139 C89 159 99 178 112 190 C117 195 123 195 128 190 C141 178 151 159 156 139 C161 119 164 96 164 77 C164 43 148 22 120 22 Z"
        fill="url(#faceFill)"
        stroke="#b5c8da"
        strokeWidth="1.35"
        filter="url(#bodyGlow)"
      />

      {/* Facial landmarks remain subtle so detected hotspots stay dominant. */}
      <path d="M86 78 C95 66 105 60 120 60 C135 60 145 66 154 78" fill="none" stroke="#d2dfeb" strokeWidth="1" opacity="0.35" />
      <path d="M88 102 C98 96 106 96 114 102 M126 102 C134 96 142 96 152 102" fill="none" stroke="#d9e5ef" strokeWidth="1.3" strokeLinecap="round" opacity="0.64" />
      <path d="M91 112 C99 106 107 107 113 113 C106 118 98 118 91 112 Z M127 113 C133 107 141 106 149 112 C142 118 134 118 127 113 Z" fill="none" stroke="#c8d8e6" strokeWidth="1" opacity="0.58" />
      <circle cx="102" cy="112" r="2.1" fill="#d9e7f2" opacity="0.45" />
      <circle cx="138" cy="112" r="2.1" fill="#d9e7f2" opacity="0.45" />
      <path d="M120 108 C118 124 114 140 116 146 C119 149 123 149 126 146" fill="none" stroke="#c9d9e7" strokeWidth="1" strokeLinecap="round" opacity="0.58" />
      <path d="M106 166 C115 162 125 162 134 166 C126 174 114 174 106 166 Z" fill="none" stroke="#d4e1ec" strokeWidth="1" opacity="0.58" />
      <path d="M96 148 C103 154 108 156 112 156 M144 148 C137 154 132 156 128 156" fill="none" stroke="#c1d2e1" strokeWidth="0.8" opacity="0.32" />

      {/* Sinus projections provide useful orientation without showing disease. */}
      <path d="M94 78 Q102 70 112 78 L109 91 Q101 95 94 88 Z" fill="#79a5c9" opacity="0.12" stroke="#a9c8e2" strokeWidth="0.7" />
      <path d="M146 78 Q138 70 128 78 L131 91 Q139 95 146 88 Z" fill="#79a5c9" opacity="0.12" stroke="#a9c8e2" strokeWidth="0.7" />
      <path d="M91 132 Q101 124 111 134 L108 151 Q98 158 90 148 Z" fill="#79a5c9" opacity="0.1" stroke="#a9c8e2" strokeWidth="0.7" />
      <path d="M149 132 Q139 124 129 134 L132 151 Q142 158 150 148 Z" fill="#79a5c9" opacity="0.1" stroke="#a9c8e2" strokeWidth="0.7" />

      <path d="M120 217 L120 260" fill="none" stroke="#b8ccdd" strokeWidth="1" opacity="0.3" />
    </motion.g>
  );
}

function getRegionX(region: BodyRegionDefinition, view: BodyView): number {
  const isLateral = region.id.endsWith("-left") || region.id.endsWith("-right");
  return view === "front" && isLateral ? 240 - region.x : region.x;
}

export function BodyMap({ fiche, messages }: BodyMapProps) {
  const detection = useMemo(() => detectBodyRegions(fiche, messages), [fiche, messages]);
  const [view, setView] = useState<BodyView>(detection.defaultView);
  const [mode, setMode] = useState<BodyMode>(detection.defaultMode);
  const [selectedId, setSelectedId] = useState<BodyRegionId | null>(null);

  useEffect(() => {
    setView(detection.defaultView);
    setMode(detection.defaultMode);
    setSelectedId(
      detection.defaultMode === "face"
        ? detection.faceRegions[0]?.id || detection.regions[0]?.id || null
        : detection.bodyRegions[0]?.id || detection.regions[0]?.id || null
    );
  }, [detection.defaultMode, detection.defaultView, detection.regions, detection.bodyRegions, detection.faceRegions]);

  const visibleRegions = BODY_REGIONS.filter((region) => region.view === "both" || region.view === view);
  const activeVisibleRegions = detection.bodyRegions.filter((region) => region.view === "both" || region.view === view);
  const activeModeRegions = mode === "face" ? detection.faceRegions : activeVisibleRegions;
  const selectedRegion = ALL_REGIONS.find((region) => region.id === selectedId) || activeModeRegions[0];
  const selectedIsActive = Boolean(selectedRegion && detection.regions.some((region) => region.id === selectedRegion.id));

  const selectRegion = (id: BodyRegionId) => setSelectedId(id);
  const changeMode = (nextMode: BodyMode) => {
    setMode(nextMode);
    setSelectedId(
      nextMode === "face"
        ? detection.faceRegions[0]?.id || null
        : activeVisibleRegions[0]?.id || null
    );
  };

  return (
    <section className="mx-4 mt-4 overflow-hidden rounded-2xl border border-slate-700/80 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,0.16),transparent_55%),linear-gradient(145deg,#17253b,#101827)]" aria-label="Repérage corporel automatique">
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
              <Activity size={15} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Repérage corporel</h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">Détection automatique</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 rounded-lg border border-slate-700 bg-slate-900/50 p-0.5 text-[10px] font-medium">
          {(["body", "face"] as BodyMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeMode(option)}
              aria-pressed={mode === option}
              className={cn(
                "rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200",
                mode === option ? "bg-slate-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {option === "body" ? "Corps" : "Visage"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center gap-1 px-3 pb-3 pt-1 sm:gap-4 sm:px-5">
        <div className="relative flex min-h-[248px] items-center justify-center">
          {mode === "body" ? (
            <>
              <div className="relative h-[250px] w-full max-w-[190px]">
                <svg viewBox="0 0 240 340" className="absolute inset-0 h-full w-full" role="img" aria-label={`Illustration du corps humain, vue de ${view === "front" ? "face" : "dos"}`}>
                  <defs>
                    <linearGradient id="bodyFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#7894b1" stopOpacity="0.9" />
                      <stop offset="0.42" stopColor="#45627f" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#20364f" stopOpacity="0.98" />
                    </linearGradient>
                    <linearGradient id="anatomyLine" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#d7e7f5" />
                      <stop offset="1" stopColor="#7e9bb8" />
                    </linearGradient>
                    <filter id="bodyGlow" x="-30%" y="-20%" width="160%" height="145%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.18" />
                    </filter>
                    <filter id="hotspotGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <BodySilhouette key={view} view={view} />
                  {visibleRegions.map((region) => {
                    const isActive = activeVisibleRegions.some(({ id }) => id === region.id);
                    const isSelected = selectedRegion?.id === region.id;
                    const displayX = getRegionX(region, view);
                    return (
                      <g key={region.id} aria-hidden="true">
                        {isActive && (
                          <motion.circle cx={displayX} cy={region.y} fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3 3" initial={{ r: region.radius + 3, opacity: 0.25 }} animate={{ r: [region.radius + 2, region.radius + 6, region.radius + 2], opacity: [0.25, 0.7, 0.25] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                        )}
                        {(isActive || isSelected) && (
                          <circle cx={displayX} cy={region.y} r={isActive ? region.radius * 0.62 : region.radius * 0.48} fill={isActive ? "#22d3ee" : "#8ca4bd"} opacity={isActive ? 0.96 : 0.42} filter={isActive ? "url(#hotspotGlow)" : undefined} stroke={isSelected ? "#ffffff" : "none"} strokeWidth={isSelected ? 1.5 : 0} />
                        )}
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0">
                  {visibleRegions.map((region) => {
                    const isActive = activeVisibleRegions.some(({ id }) => id === region.id);
                    const isSelected = selectedRegion?.id === region.id;
                    const displayX = getRegionX(region, view);
                    return (
                      <button key={`control-${region.id}`} type="button" aria-label={`${region.label}${isActive ? " — zone repérée" : ""}`} aria-pressed={isSelected} title={`Détailler : ${region.label}`} onClick={() => selectRegion(region.id)} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-cyan-200" style={{ left: `${(displayX / 240) * 100}%`, top: `${(region.y / 340) * 100}%` }}>
                        <span className="sr-only">{region.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="absolute right-0 top-1 flex rounded-md border border-slate-700/80 bg-slate-950/50 p-0.5 text-[9px]">
                {(["front", "back"] as BodyView[]).map((option) => (
                  <button key={option} type="button" onClick={() => setView(option)} aria-pressed={view === option} className={cn("rounded px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-200", view === option ? "bg-slate-600 text-white" : "text-slate-500")}>
                    {option === "front" ? "Face" : "Dos"}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-[10px] text-slate-500"><Crosshair size={10} />{view === "front" ? "Vue antérieure" : "Vue postérieure"}</div>
            </>
          ) : (
            <>
              <div className="relative h-[250px] w-full max-w-[205px]">
                <svg viewBox="0 0 240 300" className="absolute inset-0 h-full w-full" role="img" aria-label="Zoom anatomique du visage et de la sphère ORL">
                  <defs>
                    <linearGradient id="faceFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6f8eaa" /><stop offset="0.5" stopColor="#3e5c78" /><stop offset="1" stopColor="#1f344c" /></linearGradient>
                    <filter id="bodyGlow" x="-30%" y="-20%" width="160%" height="145%"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.18" /></filter>
                    <filter id="hotspotGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <FaceSilhouette />
                  {FACE_REGIONS.map((region) => {
                    const isActive = detection.faceRegions.some(({ id }) => id === region.id);
                    const isSelected = selectedRegion?.id === region.id;
                    return (
                      <g key={region.id} aria-hidden="true">
                        {isActive && (
                          <motion.circle cx={region.x} cy={region.y} fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3 3" initial={{ r: region.radius + 3, opacity: 0.25 }} animate={{ r: [region.radius + 2, region.radius + 6, region.radius + 2], opacity: [0.25, 0.75, 0.25] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
                        )}
                        {(isActive || isSelected) && (
                          <circle cx={region.x} cy={region.y} r={isActive ? region.radius * 0.6 : region.radius * 0.46} fill={isActive ? "#22d3ee" : "#8ca4bd"} opacity={isActive ? 0.96 : 0.42} filter={isActive ? "url(#hotspotGlow)" : undefined} stroke={isSelected ? "#ffffff" : "none"} strokeWidth={isSelected ? 1.5 : 0} />
                        )}
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0">
                  {FACE_REGIONS.map((region) => {
                    const isActive = detection.faceRegions.some(({ id }) => id === region.id);
                    const isSelected = selectedRegion?.id === region.id;
                    return (
                      <button key={`face-control-${region.id}`} type="button" aria-label={`${region.label}${isActive ? " — zone repérée" : ""}`} aria-pressed={isSelected} title={`Détailler : ${region.label}`} onClick={() => selectRegion(region.id)} className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-cyan-200" style={{ left: `${(region.x / 240) * 100}%`, top: `${(region.y / 300) * 100}%` }}><span className="sr-only">{region.label}</span></button>
                    );
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-[10px] text-cyan-300/70"><Crosshair size={10} />Zoom ORL · Visage et cou</div>
            </>
          )}
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRegion?.id || "empty"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="min-h-[76px]"
            >
              {selectedRegion ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
                    {selectedRegion.label}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {selectedIsActive ? `${selectedRegion.detail} repérée dans les éléments saisis.` : `${selectedRegion.detail}.`}
                  </p>
                  {selectedIsActive && <div className="mt-3 flex flex-wrap gap-1.5">
                    {detection.regions.slice(0, 6).map((region) => (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => {
                          if (FACE_REGIONS.some(({ id }) => id === region.id)) setMode("face");
                          else setMode("body");
                          selectRegion(region.id);
                        }}
                        aria-pressed={selectedRegion.id === region.id}
                        className={cn(
                          "rounded-full border px-2 py-1 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200",
                          selectedRegion.id === region.id
                            ? "border-cyan-200/60 bg-cyan-300/25 text-white"
                            : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:border-cyan-200/50 hover:bg-cyan-300/20"
                        )}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    Aucune zone repérée
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {mode === "face"
                      ? "Précisez l’oreille, le sinus, le nez, la gorge, l’œil ou la tempe concernés."
                      : "Décrivez la localisation dans le chat ou la fiche patient pour positionner le point automatiquement."}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {detection.hasSignal && activeModeRegions.length > 0 && (
            <div className="mt-2 border-t border-slate-700/70 pt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{detection.regions.length === 1 ? detection.regions[0].label : `${detection.regions.length} zones repérées`}</span>
                <span className="text-cyan-300/80">Sélection anatomique active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-slate-700/60 bg-slate-950/20 px-3.5 py-2 text-[10px] text-slate-500">
        <ArrowUp size={10} className="text-slate-600" />
        Repérage indicatif à confirmer avec le patient — ne constitue pas un diagnostic.
      </div>
    </section>
  );
}
