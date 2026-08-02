import React from "react";
import { Image } from "@/components/ui/image";
import Reveal from "./Reveal";

const PHOTOS = [
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80",
];

export default function GallerySection() {
  return (
    <section id="galleria" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Galleria</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            L'atmosfera del salone
          </h2>
        </div>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PHOTOS.map((src, i) => (
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