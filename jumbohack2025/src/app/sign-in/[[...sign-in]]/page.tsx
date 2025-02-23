import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md rounded-lg",
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}