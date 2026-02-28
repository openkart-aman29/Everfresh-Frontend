import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SchedulerView } from '@/features/core/scheduler/interfaces/types'

interface SchedulerHeaderProps {
    currentDate: Date
    view: SchedulerView
    onViewChange: (view: SchedulerView) => void
    onNavigate: (direction: 'prev' | 'next') => void
    onToday: () => void
}

export function SchedulerHeader({
    currentDate,
    view,
    onViewChange,
    onNavigate,
    onToday
}: SchedulerHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onToday}>
                    Today
                </Button>
                <div className="flex items-center rounded-md border shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={() => onNavigate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => onNavigate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <h2 className="ml-2 text-lg font-semibold min-w-[180px]">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
                    <Button
                        variant={view === 'day' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewChange('day')}
                        className="h-7 text-xs"
                    >
                        Day
                    </Button>
                    <Button
                        variant={view === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewChange('week')}
                        className="h-7 text-xs"
                    >
                        Week
                    </Button>
                </div>
            </div>
        </div>
    )
}
