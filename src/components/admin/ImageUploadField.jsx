import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, Images } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { uploadsApi } from "@/api/uploadApi";
import { extractError } from "@/lib/apiError";

const MAX_SIZE = 5 * 1024 * 1024;
const TYPE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ImageUploadField({ label, value, onChange, folder }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const extension = TYPE_EXTENSIONS[file.type];
    if (!extension) {
      toast.error("Formato non supportato", { description: "Usa JPEG, PNG o WebP" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File troppo grande", { description: "Massimo 5MB" });
      return;
    }

    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await uploadsApi.presign({
        folder,
        contentType: file.type,
        extension,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload fallito");
      onChange(publicUrl);
    } catch (err) {
      toast.error("Errore nel caricamento", { description: extractError(err) });
    } finally {
      setUploading(false);
    }
  };

  const openGallery = async () => {
    setGalleryOpen(true);
    setGalleryLoading(true);
    try {
      const res = await uploadsApi.list(folder);
      setImages(res?.images || []);
    } catch (err) {
      toast.error("Errore nel caricamento della galleria", { description: extractError(err) });
    } finally {
      setGalleryLoading(false);
    }
  };

  const pickFromGallery = (url) => {
    onChange(url);
    setGalleryOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <Image src={value} className="h-16 w-16 rounded-lg object-cover" fittingType="fill" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {value ? "Sostituisci" : "Carica immagine"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={openGallery}>
          <Images className="mr-2 h-4 w-4" /> Galleria
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={Object.keys(TYPE_EXTENSIONS).join(",")}
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Galleria immagini</DialogTitle></DialogHeader>
          {galleryLoading ? (
            <LoadingSpinner className="py-10" />
          ) : images.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nessuna immagine caricata finora.</p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto py-2 sm:grid-cols-4">
              {images.map((img) => (
                <button
                  type="button"
                  key={img.key}
                  onClick={() => pickFromGallery(img.url)}
                  className="overflow-hidden rounded-lg border border-border transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Image src={img.url} className="aspect-square w-full object-cover" fittingType="fill" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
