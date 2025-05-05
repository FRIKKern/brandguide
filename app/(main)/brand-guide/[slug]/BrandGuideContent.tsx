"use client";

import React from 'react';
import BlockContent from "@/sanity/desk-organized-sanity-utilities/brand-guideline/brand-guideline-stuff/components/BlockContent/BlockContent";

interface SubPage {
  _key?: string;
  title?: string;
  components?: any[];
}

interface BrandGuideContentProps {
  subPages: SubPage[];
}

const BrandGuideContent: React.FC<BrandGuideContentProps> = ({ subPages }) => {
  if (!subPages || subPages.length === 0) {
    return <div>No content available</div>;
  }

  return (
    <div className="space-y-16">
      {subPages.map((subPage, index) => {
        if (!subPage?.components || !Array.isArray(subPage.components) || subPage.components.length === 0) {
          return null;
        }

        // Process components to ensure unique keys
        const processedComponents = subPage.components.map(component => {
          // Create a new object to avoid mutating the original
          const newComponent = {...component};
          
          // If component has a _key, prefix it with subpage index to make it unique
          if (newComponent._key) {
            newComponent._key = `subpage-${index}-${newComponent._key}`;
          }
          
          return newComponent;
        });

        // Create a unique section ID for navigation
        const sectionId = `section-${subPage._key || subPage.title?.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <section key={sectionId} id={sectionId} className="">

            <BlockContent blocks={processedComponents} />
          </section>
        );
      })}
    </div>
  );
};

export default BrandGuideContent; 