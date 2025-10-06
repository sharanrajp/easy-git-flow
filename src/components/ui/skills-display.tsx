import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SkillsDisplayProps {
  skills: string[]
  maxVisible?: number
  className?: string
}

export function SkillsDisplay({ skills, maxVisible = 2, className = "" }: SkillsDisplayProps) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return (<span>-</span>)
  }

  const visibleSkills = skills.slice(0, maxVisible)
  const hiddenSkills = skills.slice(maxVisible)
  const hasMoreSkills = hiddenSkills.length > 0

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleSkills.map((skill, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {skill}
        </Badge>
      ))}
      {hasMoreSkills && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-xs hover:bg-accent transition-colors"
            >
              +{hiddenSkills.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="flex flex-wrap gap-1">
              {hiddenSkills.map((skill, index) => (
                <span key={index} className="text-xs">
                  {skill}
                  {index < hiddenSkills.length - 1 && ", "}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
