import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
    children: React.ReactNode;
}

export default function Droppable(props: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };
  
  
  return (
    <div className="flex flex-row justify-center align-center" ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}