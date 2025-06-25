import Image from 'next/image';

interface BackgroundImageProps {
  src: string;
  alt?: string;
  overlayOpacity?: number;
}

export const BackgroundImage = ({
  src,
  alt = 'Background',
  overlayOpacity = 0.3,
}: BackgroundImageProps) => {
  return (
    <>
      <Image src={src} alt={alt} fill className="object-cover z-0" />
      <div className={`absolute inset-0 bg-black/${overlayOpacity} z-10`} />
    </>
  );
};
