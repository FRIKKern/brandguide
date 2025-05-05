import { sanityFetch } from "@/sanity/lib/live";
import { GET_FRONT_PAGE_QUERY } from "./page-index.route-query";
import { GET_FRONT_PAGE_QUERYResult } from "@/sanity.types";

// Extended type to include brand guide type
interface FrontPageData extends GET_FRONT_PAGE_QUERYResult {
  _type: string;
  _id: string;
  slug?: { current: string };
  title?: string;
}

export const fetchFrontPage = async (): Promise<FrontPageData> => {
    const { data } = await sanityFetch({
        query: GET_FRONT_PAGE_QUERY,
    });
    return data;
}



