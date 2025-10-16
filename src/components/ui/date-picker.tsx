import React from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

interface DatePickerProps {
  selected?: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  dateFormat?: string
  inline?: boolean
  showMonthYearPicker?: boolean
  showYearPicker?: boolean
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  selected,
  onChange,
  placeholder = 'Pick a date',
  dateFormat = 'dd MMM yyyy',
  inline = false,
  showMonthYearPicker = false,
  showYearPicker = false,
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  if (inline) {
    return (
      <div className={cn('date-picker-wrapper', className)}>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          inline
          dateFormat={dateFormat}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          showMonthYearPicker={showMonthYearPicker}
          showYearPicker={showYearPicker}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          calendarClassName="shadow-lg rounded-lg border"
        />
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-12 text-base',
            !selected && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-3 h-5 w-5" />
          {selected ? format(selected, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[150]" align="start">
        <div className="date-picker-wrapper p-3">
          <ReactDatePicker
            selected={selected}
            onChange={onChange}
            inline
            dateFormat={dateFormat}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            showMonthYearPicker={showMonthYearPicker}
            showYearPicker={showYearPicker}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
