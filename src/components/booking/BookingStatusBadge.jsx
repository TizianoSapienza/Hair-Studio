import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_BADGE } from "@/lib/bookingStatus";

export default function BookingStatusBadge({ status, className, showIcon = true }) {
  const cfg = BOOKING_STATUS_BADGE[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className={className}>
      {showIcon && <Icon className="mr-1 h-3.5 w-3.5" />}
      {cfg.label}
    </Badge>
  );
}
