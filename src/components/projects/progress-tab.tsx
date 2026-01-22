'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock } from "lucide-react"

export function ProgressTab({ dailyLogs, modules }: any) {
    return (
        <div className="space-y-6">
            {/* Daily Logs Timeline */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
                {dailyLogs.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No activity recorded yet
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(
                            dailyLogs.reduce((acc: any, log: any) => {
                                const date = new Date(log.date).toLocaleDateString()
                                if (!acc[date]) acc[date] = []
                                acc[date].push(log)
                                return acc
                            }, {})
                        ).map(([date, logs]: [string, any]) => (
                            <Card key={date} className="p-4">
                                <div className="font-medium mb-3">{date}</div>
                                <div className="space-y-2">
                                    {logs.map((log: any) => (
                                        <div key={log.id} className="flex items-start gap-3 text-sm">
                                            <span className={log.source === 'AUTO_TASK_COMPLETE' ? 'text-green-600' : 'text-blue-600'}>
                                                {log.source === 'AUTO_TASK_COMPLETE' ? '🟢' : '🔵'}
                                            </span>
                                            <div className="flex-1">
                                                <div className="font-medium">{log.employee.name}</div>
                                                <div className="text-muted-foreground">{log.description}</div>
                                                {log.hoursSpent && (
                                                    <div className="text-xs text-muted-foreground mt-1">{log.hoursSpent}h</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Module Hierarchy */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Project Structure</h3>
                {modules.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No modules created yet
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {modules.map((module: any) => (
                            <Card key={module.id} className="p-4">
                                <div className="font-semibold mb-3">📦 {module.name}</div>
                                {module.subModules.map((sub: any) => (
                                    <div key={sub.id} className="ml-6 mb-3">
                                        <div className="font-medium mb-2">📂 {sub.name}</div>
                                        {sub.tasks.map((task: any) => (
                                            <div key={task.id} className="ml-6 flex items-center gap-2 text-sm py-1">
                                                {task.status === 'COMPLETED' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : task.status === 'IN_PROGRESS' ? (
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-gray-400" />
                                                )}
                                                <span>{task.title}</span>
                                                {task.assignee && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {task.assignee.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
