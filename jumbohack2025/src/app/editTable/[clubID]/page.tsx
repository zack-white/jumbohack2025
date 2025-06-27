"use client";

import { use, useState } from "react";
import MapboxMap from "@/app/map/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditClubComponent from "@/components/EditClub";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

import Tooltip from "@/components/tooltip";

export default function AddTablePage() {
    const { userId } = useAuth();
  
    if (!userId) {
      redirect("/sign-in");
    }

    const params = useParams();
    const eventID = params.eventId;
    
    return (
        <div>
            <EditClubComponent eventID={Number(eventID)} />
        </div>
    );

}