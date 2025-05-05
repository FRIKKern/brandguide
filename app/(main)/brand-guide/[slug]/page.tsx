import { notFound } from "next/navigation";

import { generatePageMetadata } from "@/features/unorganized-utils/metadata";
import PortableTextRenderer from "@/features/unorganized-components/portable-text-renderer";
import { fetchSanityBrandGuideBySlug, fetchSanityBrandGuideStaticParams } from "./(brand-guide-slug-core-utilities)/brand-guide-slug.server-actions";
import BlockContent from "@/sanity/desk-organized-sanity-utilities/brand-guideline/brand-guideline-stuff/components/BlockContent/BlockContent";
import Nav from "@/sanity/desk-organized-sanity-utilities/brand-guideline/brand-guideline-stuff/components/Nav/Nav";
import BrandGuideContent from "./BrandGuideContent";

export async function generateStaticParams() {
  const posts = await fetchSanityBrandGuideStaticParams();

  return posts.map((post) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = await fetchSanityBrandGuideBySlug({ slug });

  if (!post) {
    notFound();
  }

  return generatePageMetadata({ page: post, slug: `/$brand-guide/${slug}` });
}

export default async function BrandGuide(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = await fetchSanityBrandGuideBySlug({ slug });

  if (!post) {
    notFound();
  }
  
  return (
    <section className="bg-background">
      <div className="mx-auto py-16 px-4 sm:px-6 lg:px-8 xl:py-20 max-w-7xl">
        {/* Main header above everything */}
        {post.title && (
          <header className="mb-12 text-left">
            <h1 className="mb-4 opacity-80">{post.title}</h1>
            {post.subtitle && (
              <p className="subtitle-1 text-primary max-w-3xl">{post.subtitle}</p>
            )}
          </header>
        )}
        
        {/* 2 columns - nav on left, content on right */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Nav subPages={post.brandGuideline.subPage} />
          </div>

          <div className="md:col-span-3 max-w-none">
            <BrandGuideContent subPages={post.brandGuideline.subPage} />
          </div>
        </div>

        {post.body && (
          <div className="mt-16 border-t border-black pt-8">
            <PortableTextRenderer value={post.body} />
          </div>
        )}
      </div>
    </section>
  );
}
