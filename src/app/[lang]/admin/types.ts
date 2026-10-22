import type { Locale } from "@/lib/i18n";
import type {
  MaterialFile,
  MaterialImage,
  MaterialStatus,
  MaterialText,
  MaterialType,
} from "@/lib/content";

/** What the editor form sends to saveMaterial. */
export type MaterialInput = {
  id?: number;
  type: MaterialType;
  lang: Locale;
  status: MaterialStatus;
  slug: string;
  subjectId?: number;
  newSubject?: { nameRu: string; nameEn: string };
  url?: string;
  tags: string[];
  texts: Partial<Record<Locale, MaterialText>>;
  images: MaterialImage[];
  files: MaterialFile[];
};
