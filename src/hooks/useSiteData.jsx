import { useQuery } from "@tanstack/react-query";
import { siteDataApi } from "@/api/contentApi";

//Un'unica query condivisa (stessa queryKey) per business_info + homepage_content + servizi
//attivi + staff pubblico: prima venivano rifatte 4 richieste identiche da 4 hook/componenti
//diversi montati insieme sulla landing. Gli hook pubblici (useBusinessInfo, useHomepageContent,
//useServices) leggono da qui via `select`, senza richieste aggiuntive.
export const siteDataQueryOptions = {
  queryKey: ["site_data"],
  queryFn: () => siteDataApi.get(),
  staleTime: Infinity,
  refetchOnWindowFocus: false,
};

export default function useSiteData() {
  return useQuery(siteDataQueryOptions);
}
