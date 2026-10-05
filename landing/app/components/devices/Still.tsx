import Image from "next/image";

/** A real frame from the app, layered over the others and faded by `show`. */
export default function Still({ src, alt, show }: { src: string; alt: string; show: number }) {
  return <Image src={src} alt={show > 0.5 ? alt : ""} fill unoptimized className="object-cover object-top" style={{ opacity: show }} />;
}
