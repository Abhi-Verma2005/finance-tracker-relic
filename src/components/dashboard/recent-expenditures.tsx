import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"

export function RecentExpenditures({ data }: { data: any[] }) {
  return (
    <div className="space-y-8">
      {data.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{item.account.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.description}</p>
            <p className="text-sm text-muted-foreground">
              {format(item.date, "MMM dd")} • {item.account.name}
            </p>
          </div>
          <div className="ml-auto font-medium text-red-500">
            -${item.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}
