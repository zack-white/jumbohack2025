"use client";

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegistrationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          bio: description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      // Show success toast
      toast.success("Registration Submitted!", {
        description: "Thank you for confirming. You will receive a confirmation email shortly.",
        duration: 5000,
      });

      router.push('/thank-you');

    } catch (error) {
      console.error("Registration error:", error); 
      toast.error("Registration Failed", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Suspense fallback={<p>loading registration...</p>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1">
            <h2 className="text-2xl font-bold text-center">Complete Your Registration</h2>
            <p className="text-center text-muted-foreground">
              Please provide a brief description for your club
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your organization description (max 250 characters)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {description.length}/250 characters
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || description.length === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Suspense>
  );
}
