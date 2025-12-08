import type { MDXComponents } from "mdx/types";
import type { JSX } from "preact";

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(" ");

type ElementProps<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], "class" | "className"> & {
  class?: string;
  className?: string;
};

const extractClass = <T extends keyof JSX.IntrinsicElements>(props: ElementProps<T>) => {
  const { class: classAttr, className, ...rest } = props;
  return { rest, className: className || classAttr };
};

const baseText = "text-base leading-7 text-base-content/85";

const mdxComponents: MDXComponents = {
  h1: (props: ElementProps<"h1">) => {
    const { rest, className } = extractClass(props);
    return <h1 {...rest} className={cx("font-sans text-3xl font-semibold text-base-content md:text-4xl", className)} />;
  },
  h2: (props: ElementProps<"h2">) => {
    const { rest, className } = extractClass(props);
    return <h2 {...rest} className={cx("mt-10 font-sans text-2xl font-semibold text-base-content md:text-3xl", className)} />;
  },
  h3: (props: ElementProps<"h3">) => {
    const { rest, className } = extractClass(props);
    return <h3 {...rest} className={cx("mt-8 text-xl font-semibold text-base-content", className)} />;
  },
  p: (props: ElementProps<"p">) => {
    const { rest, className } = extractClass(props);
    return <p {...rest} className={cx(baseText, "my-4", className)} />;
  },
  a: (props: ElementProps<"a">) => {
    const { rest, className } = extractClass(props);
    return (
      <a
        {...rest}
        className={cx(
          "font-semibold text-primary underline-offset-4 transition hover:text-primary/80 hover:underline",
          className,
        )}
      />
    );
  },
  ul: (props: ElementProps<"ul">) => {
    const { rest, className } = extractClass(props);
    return <ul {...rest} className={cx(baseText, "mb-1 list-disc pl-6", className)} />;
  },
  ol: (props: ElementProps<"ol">) => {
    const { rest, className } = extractClass(props);
    return <ol {...rest} className={cx(baseText, "my-1 list-decimal space-y-3 pl-6", className)} />;
  },
  li: (props: ElementProps<"li">) => {
    const { rest, className } = extractClass(props);
    return <li {...rest} className={cx("leading-6 text-base-content/90", className)} />;
  },
  blockquote: (props: ElementProps<"blockquote">) => {
    const { rest, className } = extractClass(props);
    return (
      <blockquote
        {...rest}
        className={cx(
          baseText,
          "my-6 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 text-base-content/80 shadow-sm",
          className,
        )}
      />
    );
  },
  code: (props: ElementProps<"code">) => {
    const { rest, className } = extractClass(props);
    return (
      <code
        {...rest}
        className={cx(
          "rounded-md px-2 py-1 text-sm font-mono text-primary-content",
          className,
        )}
      />
    );
  },
  pre: (props: ElementProps<"pre">) => {
    const { rest, className } = extractClass(props);
    return (
      <pre
        {...rest}
        className={cx(
          "my-6 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm leading-7 text-slate-100 shadow-lg",
          className,
        )}
      />
    );
  },
  hr: (props: ElementProps<"hr">) => {
    const { rest, className } = extractClass(props);
    return <hr {...rest} className={cx("my-8 border-base-300", className)} />;
  },
  strong: (props: ElementProps<"strong">) => {
    const { rest, className } = extractClass(props);
    return <strong {...rest} className={cx("font-semibold text-base-content", className)} />;
  },
  em: (props: ElementProps<"em">) => {
    const { rest, className } = extractClass(props);
    return <em {...rest} className={cx("italic text-base-content", className)} />;
  },
  figure: (props: ElementProps<"figure">) => {
    const { rest, className } = extractClass(props);
    return (
      <figure
        {...rest}
        className={cx("my-6 space-y-3 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm", className)}
      />
    );
  },
  img: (props: ElementProps<"img">) => {
    const { rest, className } = extractClass(props);
    return <img {...rest} className={cx("mx-auto h-auto w-full max-w-5xl rounded-xl border border-base-300 object-contain", className)} />;
  },
  figcaption: (props: ElementProps<"figcaption">) => {
    const { rest, className } = extractClass(props);
    return <figcaption {...rest} className={cx("text-center text-sm text-base-content/70", className)} />;
  },
  table: (props: ElementProps<"table">) => {
    const { rest, className } = extractClass(props);
    return (
      <div className="my-6 overflow-hidden rounded-xl border border-base-300">
        <table {...rest} className={cx("w-full border-collapse text-left", className)} />
      </div>
    );
  },
  th: (props: ElementProps<"th">) => {
    const { rest, className } = extractClass(props);
    return <th {...rest} className={cx("bg-base-200 px-4 py-3 text-sm font-semibold text-base-content", className)} />;
  },
  td: (props: ElementProps<"td">) => {
    const { rest, className } = extractClass(props);
    return <td {...rest} className={cx("px-4 py-3 text-base-content/85", className)} />;
  },
};

export default mdxComponents;
