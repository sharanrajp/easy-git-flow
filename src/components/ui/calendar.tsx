import * as React from 'react'
import ReactCalendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface CalendarProps {
  mode?: 'single' | 'range'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

export function Calendar({
  selected,
  onSelect,
  className,
  ...props
}: CalendarProps) {
  const handleDateChange = (value: any) => {
    if (onSelect) {
      onSelect(value)
    }
  }

  return (
    <ReactCalendar
      onChange={handleDateChange}
      value={selected}
      className={className}
      // tileDisabled={({ date }) => {
      //   console.log('tileDisabled', { date });
      //   return date < new Date()
      // }}
      minDate={new Date()}
      {...props}
    />
  )
}
