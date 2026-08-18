export interface PracticeProfile {
  nom: string;
  specialite: string;
  inpe: string;
  adresse: string;
  adresse2: string;
  ville: string;
  tel: string;
  fax: string;
  email: string;
}

export const PRACTICE_PROFILE: PracticeProfile = {
  nom: process.env.NEXT_PUBLIC_PRACTITIONER_NAME?.trim() || "Médecin responsable",
  specialite:
    process.env.NEXT_PUBLIC_PRACTITIONER_SPECIALTY?.trim() || "Spécialité à configurer",
  inpe: process.env.NEXT_PUBLIC_PRACTITIONER_INPE?.trim() || "Non configuré",
  adresse: process.env.NEXT_PUBLIC_FACILITY_NAME?.trim() || "Établissement à configurer",
  adresse2: process.env.NEXT_PUBLIC_FACILITY_ADDRESS?.trim() || "",
  ville: process.env.NEXT_PUBLIC_FACILITY_CITY?.trim() || "",
  tel: process.env.NEXT_PUBLIC_FACILITY_PHONE?.trim() || "",
  fax: process.env.NEXT_PUBLIC_FACILITY_FAX?.trim() || "",
  email: process.env.NEXT_PUBLIC_FACILITY_EMAIL?.trim() || "",
};
