import Image from "next/image";

export function SchoolLogo({
  size = 88,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/LOGO-SVENSKA-SKOLAN.jpg"
      alt="Svenska Skolan Mallorca"
      width={size}
      height={size}
      priority={priority}
      className="rounded-full bg-white"
    />
  );
}
