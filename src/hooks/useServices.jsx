import { useQuery } from "@tanstack/react-query";
import { siteDataQueryOptions } from "@/hooks/useSiteData";

//Stessa query condivisa di useBusinessInfo/useHomepageContent (vedi useSiteData.jsx):
//forma standard react-query { data, isLoading, ... }
export default function useServices() {
  return useQuery({ ...siteDataQueryOptions, select: (data) => data?.services || [] });
}

export function usePublicStaff() {
  return useQuery({ ...siteDataQueryOptions, select: (data) => data?.staff || [] });
}
