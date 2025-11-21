"use client"

import HoverCard from "@/app/components/(ui)/HoverCard"

interface EventHeaderProps {
  imageUrl: string
}

export default function EventHeader({ imageUrl }: EventHeaderProps) {
  return (
    <HoverCard>
      <div className="relative z-10 h-[500px] w-full rounded-2xl overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Event preview" 
          className="w-full h-full object-cover" 
        />
      </div>
    </HoverCard>
  )
}