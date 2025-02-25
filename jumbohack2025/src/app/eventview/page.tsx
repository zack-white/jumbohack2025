import { Suspense } from "react";
import EventPage from "./evpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading registration...</p>}>
      <EventPage />
    </Suspense>
  );
}
