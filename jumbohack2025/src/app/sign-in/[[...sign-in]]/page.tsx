import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto mt-20",
            card: "bg-white shadow-md",
            button: "text-lg",          
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
