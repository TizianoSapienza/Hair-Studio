import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function useHomepageContent() {
  return useQuery({
    queryKey: ["homepage_content"],
    queryFn: async () => {
      const res = await base44.functions.invoke("GetPublicSiteData");
      return res.data?.homepage_content || null;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}