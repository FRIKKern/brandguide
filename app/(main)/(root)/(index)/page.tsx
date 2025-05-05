import React from 'react';
import { fetchFrontPage } from './page-index.server-actions';
import { Blocks } from '@/features/page-builder-blocks/block-component-exporter';
import { generatePageMetadata } from '@/features/unorganized-utils/metadata';
import { notFound, redirect } from 'next/navigation';

// Add ISR with revalidation every 30 seconds
export const revalidate = 30;

// generateStaticParams

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = await fetchFrontPage();

  if (!page) {
    notFound();
  }

  return generatePageMetadata({ page, slug: params.slug });
}

export default async function Page() {
  const frontPageData = await fetchFrontPage();
  
  if (!frontPageData) {
    notFound();
  }
  
  // If the frontpage is set to a brand guide, redirect to the brand guide page
  if (frontPageData._type === 'brand-guide-slug' && frontPageData.slug?.current) {
    redirect(`/brand-guide/${frontPageData.slug.current}`);
  }
  
  // Otherwise, render the page blocks (for normal pages)
  return (
    <>
    {/* @ts-ignore */}
    <Blocks blocks={frontPageData?.blocks} />
    </>
  )
}


