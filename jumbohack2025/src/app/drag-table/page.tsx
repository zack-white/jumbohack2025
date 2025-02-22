"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Droppable from "../components/Droppable";
import Draggable from "../components/Draggable";

interface ClubInfo {
    key: number,
    id: number;
    x: number;
    y: number;
}

export default function DragTable() {
    const [clubs, setClubs] = useState<ClubInfo[]>([]);

    function handleDragEnd(event: any) {
        console.log("Drag ended", event);
        // Implement logic to update club positions if needed
    }

    function addClub() {
        console.log("HELLo")
        setClubs([...clubs, {key: 1, id: Date.now(), x: 0, y: 0 }]);
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="w-screen h-screen" onClick={addClub}>
                {clubs.map((club) => (
                    <Draggable key={}>Hello</Draggable>
                ))}
            </div>
        </DndContext>
    );
}
