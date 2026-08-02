import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function useBusinessInfo() {
  return useQuery({
    queryKey: ["business_info"],
    queryFn: async () => {
      const res = await base44.functions.invoke("GetPublicSiteData");
      return res.data?.business_info || null;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}