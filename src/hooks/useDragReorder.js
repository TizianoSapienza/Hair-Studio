import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractError } from "@/lib/apiError";

//Riordino drag-and-drop ottimistico condiviso da ManageServices/ManageStaff: aggiorna subito
//l'ordine in UI, chiama l'API di reorder, invalida la cache site_data, e in caso di errore
//annulla ricaricando la lista dal server invece di un rollback manuale dell'array.
export function useDragReorder({ items, setItems, reorderFn, reload }) {
  const queryClient = useQueryClient();
  const [reordering, setReordering] = useState(false);

  const onDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    setReordering(true);
    try {
      await reorderFn(reordered.map((x) => x.id));
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
    } catch (err) {
      toast.error("Errore nel riordino", { description: extractError(err) });
      await reload();
    } finally {
      setReordering(false);
    }
  };

  return { reordering, onDragEnd };
}
