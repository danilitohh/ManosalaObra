import {
  AirVent,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  Plomería: Droplets,
  Electricidad: Zap,
  Pintura: Paintbrush,
  Climatización: AirVent,
  Carpintería: Hammer,
  Limpieza: Sparkles,
};

type ServiceCategoryIconProps = {
  category: string;
  className?: string;
  size?: number;
};

export function ServiceCategoryIcon({
  category,
  className = "",
  size = 19,
}: ServiceCategoryIconProps) {
  const Icon = categoryIcons[category] ?? Wrench;

  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={1.8} />;
}
