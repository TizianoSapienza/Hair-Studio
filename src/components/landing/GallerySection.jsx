import React from "react";
import { Image } from "@/components/ui/image";
import Reveal from "./Reveal";
import useHomepageContent from "@/hooks/useHomepageContent";

const PHOTOS = [
  "/img/gallery_1.jpg",
  "/img/gallery_2.jpg",
  "/img/gallery_3.jpg",
];

export default function GallerySection() {
  const { data: content } = useHomepageContent();
  const photos = [
    content?.gallery1ImageUrl || PHOTOS[0],
    content?.gallery2ImageUrl || PHOTOS[1],
    content?.gallery3ImageUrl || PHOTOS[2],
  ];
  return (
    <section id="galleria" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center">
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            L'atmosfera del salone
          </h2>
        </div>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {photos.map((src, i) => (
          <Reveal key={src} delay={i * 0.1}>
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={src}
                alt={`Foto ${i + 1}`}
                fittingType="fill"
                className="aspect-[4/3] w-full transition-transform duration-500 hover:scale-105"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}