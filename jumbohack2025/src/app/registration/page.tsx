import { Suspense } from "react";
import RegistrationPage from "./regpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading registration...</p>}>
      <RegistrationPage />
    </Suspense>
  );
}
