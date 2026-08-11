import { useQuery } from "@tanstack/react-query";
import { siteDataQueryOptions } from "@/hooks/useSiteData";

export default function useHomepageContent() {
  return useQuery({ ...siteDataQueryOptions, select: (data) => data?.homepageContent || null });
}
