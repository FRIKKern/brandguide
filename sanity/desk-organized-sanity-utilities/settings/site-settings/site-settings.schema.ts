import { referenceField } from "@/sanity/type-organized-schemas/generator-fields/reference.field";
import { Globe } from "lucide-react";
import { defineField, defineType } from "sanity";

export const siteSettingsSchema = defineType({
  type: "document",
  title: "Globale innstillinger",
  name: "siteSettings",
  icon: Globe,
  
  
  fields: [
    referenceField({
      name: "frontPage",
      title: "Forside",
      to: [{ type: "page-slug" }, { type: "brand-guide-slug" }],
      required: true,
    }),

    referenceField({
      name: "privacyPolicyPage",
      title: "Side for personvernerklæring",
      to: [{ type: "page-slug" }],
      required: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Globale innstillinger",
      };
    },
  },
});
