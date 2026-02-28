import { generateTimeSlots, SLOT_HEIGHT } from '@/features/core/scheduler/utils/scheduler.utils'

export function TimeGrid() {
    const slots = generateTimeSlots()

    return (
        <div className="flex flex-col border-r bg-background select-none w-16 flex-shrink-0">
            {/* Header Spacer to match DayColumn header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b h-14 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Time
                </span>
            </div>

            {/* Time Slots */}
            <div className="flex-1">
                {slots.map((time, i) => (
                    <div
                        key={i}
                        className="relative border-b border-muted/10 flex items-center justify-end pr-3"
                        style={{ height: SLOT_HEIGHT }}
                    >
                        <span className="text-[11px] text-muted-foreground font-medium">
                            {time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
