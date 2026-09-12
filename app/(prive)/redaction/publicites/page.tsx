import { AccessGuard } from "@/components/custom/access-guard";
import { AdvertisingManager } from "@/components/custom/advertising-manager";

export default function AdvertisingPage() {
  return (
    <AccessGuard permission="settings:manage">
      <AdvertisingManager />
    </AccessGuard>
  );
}
