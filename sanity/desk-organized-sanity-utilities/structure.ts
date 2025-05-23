import { settingsStructure } from "@/sanity/desk-organized-sanity-utilities/settings/settings.structure";
import { faqDeskStructure } from "./faq/faq.document-structure";
import { testimonialDeskStructure } from "./testimonial/testimonial.document-structure";
import { participantDeskStructure } from "./participant/participant.document-structure";

import { serviceSlugDeskStructure } from "@/app/(main)/service/[slug]/(service-slug-core-utilities)/service-slug.desk-structure";
import { courseSlugDeskStructure } from "@/app/(main)/course/[slug]/(course-slug-core-utilities)/course-slug.desk-structure";
import { Files, List } from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { faqCategoryDeskStructure } from "./faq-category/faq-category.document-structure";
import { brandGuidelineDeskStructure } from "./brand-guideline/brand-guideline-stuff/structure/brandGuideline.structure";
import { brandGuideDeskStructure } from "@/app/(main)/brand-guide/[slug]/(brand-guide-slug-core-utilities)/brand-guide-slug.desk-structure";

// ADD VALUE 1 ABOVE
export const structure = (S: StructureBuilder, context: any) => {


  
  return S.list()
    .title("Content")
    
    .items([
      settingsStructure(S),


      // I want tab to a list... it will show first service slug, then course slug, the seperator, then all the pages listed below
      S.listItem()
      .title("Pages")
      .icon(Files)
      .child(
        S.list()
        .title("Pages")
        
        .items([
          S.listItem()
          .title("Regular Pages")
          .schemaType("page-slug")
          .child(
            S.documentTypeList("page-slug")
              .title("Pages")
              .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
          ),
          S.divider(),
          serviceSlugDeskStructure(S),
          courseSlugDeskStructure(S),
          brandGuideDeskStructure(S),
          

          // show list of pages directly below
         
      ])
    ),
      // blogSlugDeskStructure(S),
      // categoryDeskStructure(S, context),
      S.listItem()
      .title("Misc")
      .icon(List)
      .child(
        S.list()
        .title("Misc")
        .items([
          S.listItem()
          .title("FAQ")
          .icon(List)
          .child(
            S.list()
            .title("FAQ")
            .items([
              faqDeskStructure(S, context),
              faqCategoryDeskStructure(S, context),
            ])
          ),
          testimonialDeskStructure(S, context),
          participantDeskStructure(S, context),
          brandGuidelineDeskStructure(S, context),
        ])
      ),
      // ADD VALUE 2 ABOVE
    ])

  }
  


   