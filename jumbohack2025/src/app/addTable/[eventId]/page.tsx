"use client";

import { useState } from "react";
import ClubForm from "@/components/ClubForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

export default function AddTablePage() {
    const { userId } = useAuth();
  
    if (!userId) {
      redirect("/sign-in");
    }

    const params = useParams();
    const eventID = params.eventId;

    const router = useRouter();
    const [clubData, setClubData] = useState({
        name: "",
        category: "",
        contact: "",
        start_time: "",
        end_time: "",
        description: "",
        event_id: eventID,
        location: null as { x: number; y: number } | null,
        scale: 0,
    });
    const [categories, setCategories] = useState<string[]>([]);

    const [errors, setErrors] = useState({
      name: "",
      category: "",
      contact: "",
      start_time: "",
      end_time: "",
    });

    // Add table confirmation popup state
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors = {
        name: clubData.name ? "" : "Required",
        category: clubData.category ? "" : "Required",
        contact: clubData.contact ? "" : "Required",
        start_time: "", // not used
        end_time: "",   // not used
      };

      setErrors(newErrors);

      const hasErrors = Object.values(newErrors).some((v) => v !== "");
      if (hasErrors) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Show confirmation popup instead of immediately submitting
      setShowConfirmationPopup(true);
    };

    const handleConfirmSubmit = async () => {
      setShowConfirmationPopup(false);
      
      try {
        const res = await fetch("/api/addClub", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: clubData.name,
            category: clubData.category,
            contact: clubData.contact,
            description: "", // not collected from form
            coordinates: null, // not set yet
            confirmed: false, // default
            event_id: eventID,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          console.error("Server error:", data.error);
          toast.error("Error adding table.");
          return;
        }

        toast.success("Table added successfully!");
        router.push(`/placement/${eventID}`);
      } catch (err) {
        console.error("Error submitting form:", err);
        toast.error("Network error while adding table.");
      }
    };

    const handleCancelSubmit = () => {
      setShowConfirmationPopup(false);
    };

    if (eventID && categories.length === 0) {
      (async () => {
        try {
          const response = await fetch("/api/getClubs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventID }),
          });

          if (!response.ok) {
            console.error("Error fetching existing clubs.");
          }

          // const clubs = await response.json();
          const uniqueCategories = new Set<string>(
            (await response.json() as Array<{ category: string }>).map(c => c.category)
          );

          setCategories(Array.from(uniqueCategories));
        } catch (error) {
          console.error("Error fetching clubs:", error);
        }
      })();
    }

    const handleCancel = () => {
      router.push(`/placement/${eventID}`);
    };
    
    return (
        <div>
            <ClubForm
              clubData={clubData}
              setClubData={setClubData}
              categories={categories}
              errors={errors}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />

            {/* Confirmation Popup */}
            {showConfirmationPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-[#2971AC] rounded-full w-16 h-16 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Ready to Submit?</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Please review your table information carefully. Once you submit, you will not be able to make any changes.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleCancelSubmit}
                      className="flex-1 px-6 py-3 border-2 border-[#2971AC] text-[#2971AC] hover:bg-blue-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      className="flex-1 px-6 py-3 text-white bg-[#2E73B5] hover:bg-[#235d92] transition-colors font-medium"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );

}