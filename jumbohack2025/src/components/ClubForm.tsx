// components/ClubForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClubForm({
  clubData,
  setClubData,
  categories,
  errors,
  onSubmit,
  onCancel,
  mode = "add",
}: {
  clubData: any;
  setClubData: (data: any) => void;
  categories: string[];
  errors: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  mode?: "add" | "edit";
}) {

    console.log("Club Data Form:", clubData.category);

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      { clubData !== undefined ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-titleFont">
            {mode === "add" ? "Add Table" : "Edit Table"}
          </CardTitle>
          <hr className="my-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-2">
            <div>
              <CardTitle className="text-xl font-semibold text-titleFont">Organization Information</CardTitle>
              <label className="mt-4 text-sm text-primary flex items-center">
                Organization Name*
                {errors.name && <span className="ml-2 text-xs text-red-500">(Required)</span>}
              </label>
              <Input
                className="mt-2"
                placeholder="e.g. JumboHack"
                value={clubData.name}
                onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                required
              />
              <label className="mt-4 text-sm text-primary flex items-center">
                Select Category*
                {errors.category && <span className="ml-2 text-xs text-red-500">(Required)</span>}
              </label>
              <select
                className="mt-2 w-full border rounded px-3 py-2 text-sm text-gray-700"
                value={clubData.category ?? ""}
                onChange={(e) => setClubData({ ...clubData, category: e.target.value })}
                required
              >
                {clubData.category ? (
                    <option value={clubData.category}>{clubData.category}</option>
                ) : (
                    <option value="">Select...</option>
                )}
                {categories.map((category, i) => (
                    <option key={i} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mt-8 items-center gap-2 mb-2">
                <CardTitle className="text-xl font-semibold text-titleFont">Contact Information</CardTitle>
              </div>
              <label className="mt-4 text-sm text-primary flex items-center">
                Email*
                {errors.contact && <span className="ml-2 text-xs text-red-500">(Required)</span>}
              </label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="mt-2"
                value={clubData.contact}
                onChange={(e) => setClubData({ ...clubData, contact: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" onClick={onCancel} variant="outline" className="h-11 px-6">
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 bg-[#2E73B5] hover:bg-[#235d92]"
              >
                {mode === "add" ? "Add Table" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card> ) : (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading club data...</p>
      </div>
      )}
    </div>
  );
}
