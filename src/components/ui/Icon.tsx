type IconProps = {
  name: string;
  size?: 16 | 24 | 32 | 48;
  /** Leave empty when the icon sits next to visible text. */
  alt?: string;
  className?: string;
};

/** Renders an icon from /public/icons. SVGs don't benefit from next/image optimisation. */
export function Icon({ name, size = 32, alt = "", className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${name}.svg`}
      width={size}
      height={size}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
