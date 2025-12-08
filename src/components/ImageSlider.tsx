import { useState } from "preact/hooks";

type SliderImage = {
  src: string;
  alt: string;
  width?: number | string;
};

type ImageSliderProps = {
  images: SliderImage[];
  caption?: string;
};

export function ImageSlider({ images, caption }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;

  const goTo = (nextIndex: number) => {
    const total = images.length;
    const normalized = ((nextIndex % total) + total) % total;
    setIndex(normalized);
  };

  return (
    <figure class="my-6 space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-md" data-slider>
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.width}
          class={`w-full rounded-xl border border-base-300 object-contain transition ${
            i === index ? "block" : "hidden"
          }`}
        />
      ))}

      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="btn btn-circle btn-ghost border border-base-300"
          aria-label="Previous image"
          onClick={() => goTo(index - 1)}
        >
          ‹
        </button>
        <div class="inline-flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              class={`h-3 w-3 rounded-full border border-base-300 transition ${
                i === index ? "scale-110 border-primary bg-primary" : "bg-base-200"
              }`}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          class="btn btn-circle btn-ghost border border-base-300"
          aria-label="Next image"
          onClick={() => goTo(index + 1)}
        >
          ›
        </button>
      </div>

      {caption && <figcaption class="text-center text-sm text-base-content/70">{caption}</figcaption>}
    </figure>
  );
}
