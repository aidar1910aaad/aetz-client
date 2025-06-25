import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
}

export const Logo = ({ width = 300, height = 300, priority = true }: LogoProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image src="/login/logo.png" alt="Logo" width={width} height={height} priority={priority} />
      <p className="text-[16px] text-center font-semibold text-white">
        Астанинский электротехнический завод
      </p>
    </div>
  );
};
