"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SidebarLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string;
  icon: string;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-2 rounded px-2 py-2 transition",
        "hover:bg-gray-100",
        isActive && "bg-blue-100 text-blue-700 font-medium"
      )}
    >
      <Image src={icon} alt={label} width={30} height={30} quality={100}/>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
