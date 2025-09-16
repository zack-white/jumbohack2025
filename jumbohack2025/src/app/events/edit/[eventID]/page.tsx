"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EventForm from "@/components/EventForm";

export default function EditEventPage() {
  const id = useParams().eventID;
  const [event, setEvent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Fetching event with id:", id);
    (async () => {
      const res = await fetch(`/api/fetchEvent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id) }),
      });
      if (res.ok) {
        console.log("Response OK");
        const data = await res.json();
        console.log(data);
        setEvent(data[0]);
      }
    })();
  }, [id]);

  async function handleUpdate(values: any) {
    const res = await fetch(`/api/event/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error("Failed to update event");
      return;
    }

    toast.success("Event updated!");
    router.push(`/placement/${id}`);
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
            <div className="bg-[#F7F9FB] max-w-4xl w-full md:w-[80%] lg:w-[60%] mx-auto p-8">
                <div>
                    <div className="mb-3">
                        <h1 className="text-2xl font-bold font-serif text-primary">Edit Event</h1>
                    </div>
                    <EventForm initialValues={event} onSubmit={handleUpdate} submitLabel="Save Event" />
                </div>
            </div>
        </div>
  );
}
