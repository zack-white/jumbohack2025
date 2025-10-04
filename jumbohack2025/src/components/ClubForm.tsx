// components/ClubForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Tooltip from "@/components/tooltip";
import * as React from "react";

type BaseClubFields = {
  name: string;
  category: string;
  contact: string;
  description?: string;
};

type ClubFormErrors = {
  name?: string;
  category?: string;
  contact?: string;
};

type ClubFormProps<T extends BaseClubFields> = {
  clubData: T;
  setClubData: React.Dispatch<React.SetStateAction<T>>;
  categories: string[];
  errors: ClubFormErrors;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  mode?: "add" | "edit";
};

export default function ClubForm<T extends BaseClubFields>({
  clubData,
  setClubData,
  categories,
  errors,
  onSubmit,
  onCancel,
  mode = "add",
}: ClubFormProps<T>) {
  // console.log("Club Data Form (category):", clubData.category);

  return (
    <div className="bg-[#F7F9FB] md:bg-white m-[3%] overflow-hidden md:flex md:items-center md:justify-center">
      {clubData !== undefined ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-titleFont">
              {mode === "add" ? "Add Table" : "Edit Table"}
            </CardTitle>
            <hr className="my-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="">
              <div>
                <CardTitle className="text-xl font-semibold text-titleFont">
                  Organization Information
                </CardTitle>

                <label className="mt-4 text-sm text-primary flex items-center">
                  Organization Name*
                  {errors.name && (
                    <span className="ml-2 text-xs text-red-500">(Required)</span>
                  )}
                </label>
                <Input
                  className="mt-2"
                  placeholder="e.g. JumboHack"
                  value={clubData.name}
                  onChange={(e) =>
                    setClubData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />

                <label className="mt-4 text-sm text-primary flex items-center">
                  Select Category*
                  {errors.category && (
                    <span className="ml-2 text-xs text-red-500">(Required)</span>
                  )}
                </label>
                <select
                  className="mt-2 w-full border rounded px-3 py-2 text-sm text-gray-700"
                  value={clubData.category ?? ""}
                  onChange={(e) =>
                    setClubData((prev) => ({ ...prev, category: e.target.value }))
                  }
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

              {mode === "edit" && (
                <>
                  <label className="mt-4 text-sm text-primary flex items-center">
                    Description
                  </label>
                  <textarea
                    className="mt-2 w-full px-3 py-2 text-sm text-gray-700 min-h-[120px]"
                    placeholder="What is this table or organization about?"
                    value={clubData.description ?? ""}
                    onChange={(e) =>
                      setClubData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </>
              )}

              <div>
                <div className="mt-8 flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl font-semibold text-titleFont">
                    Contact Information
                  </CardTitle>
                  <Tooltip text="What is the best way for others to contact you or your organization? You may provide an organizational email or phone number, or your personal contact information if you prefer." />
                </div>

                <label className="mt-4 text-sm text-primary flex items-center">
                  Email*
                  {errors.contact && (
                    <span className="ml-2 text-xs text-red-500">(Required)</span>
                  )}
                </label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  className="mt-2"
                  value={clubData.contact}
                  onChange={(e) =>
                    setClubData((prev) => ({ ...prev, contact: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="h-11 px-6"
                >
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
        </Card>
      ) : (
        <div className="p-4 text-center">
          <p className="text-gray-500">Loading club data...</p>
        </div>
      )}
    </div>
  );
}
