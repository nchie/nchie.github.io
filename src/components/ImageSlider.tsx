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
    <figure data-slider>
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.width}
          class={i === index ? "active" : ""}
        />
      ))}

      <div class="slider-controls">
        <button type="button" class="slider-nav prev" aria-label="Previous image" onClick={() => goTo(index - 1)}>
          ‹
        </button>
        <div class="slider-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              class={`slider-dot${i === index ? " active" : ""}`}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" class="slider-nav next" aria-label="Next image" onClick={() => goTo(index + 1)}>
          ›
        </button>
      </div>

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
