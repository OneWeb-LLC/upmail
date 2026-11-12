import { Suspense } from "react";

import { OwebSsoClient } from "@/app/sso/OwebSsoClient";

export default function OwebSsoPage() {
  return (
    <Suspense>
      <OwebSsoClient />
    </Suspense>
  );
}
