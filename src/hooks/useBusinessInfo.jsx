import { useQuery } from "@tanstack/react-query";
import { siteDataQueryOptions } from "@/hooks/useSiteData";

export default function useBusinessInfo() {
  return useQuery({ ...siteDataQueryOptions, select: (data) => data?.businessInfo || null });
}
