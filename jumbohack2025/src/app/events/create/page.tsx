
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function CreateEventPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  if (!userId) redirect("/sign-in");

  async function handleCreate(values: any) {
    const res = await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, creator: user?.primaryEmailAddress?.emailAddress }),
    });

    if (!res.ok) {
      toast.error("Failed to create event");
      return;
    }

    const data = await res.json();
    toast.success("Event created!");
    router.push(`/placement/${data.eventId}`);
  }

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
        <div className="bg-[#F7F9FB] max-w-4xl w-full md:w-[80%] lg:w-[60%] mx-auto p-8">
            <div>
                <div className="mb-3">
                    <h1 className="text-2xl font-bold font-serif text-primary">Create Event</h1>
                </div>
                <EventForm onSubmit={handleCreate} submitLabel="Create Event" />
            </div>
        </div>
    </div>
  );
}