"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Calendar as CalIcon, Clock } from "lucide-react";

export default function AdminCalendarPage() {
  const [meetings, setMeetings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/meetings")
      .then((d) => { if (d.success && d.data) setMeetings((d.data as { meetings?: Record<string, unknown>[] }).meetings || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Calendar</h1><p className="text-sm text-muted-foreground mt-1">View meetings, bookings, and scheduled content</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalIcon className="h-5 w-5" />{monthNames[today.getMonth()]} {today.getFullYear()}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(today.getFullYear(), today.getMonth(), day);
              const dayMeetings = meetings.filter((m) => {
                const mDate = m.requestedDate ? new Date(String(m.requestedDate)) : null;
                return mDate && mDate.toDateString() === date.toDateString();
              });
              const isToday = day === today.getDate();
              return (
                <div key={day} className={`min-h-[60px] rounded-lg border p-1 text-xs ${isToday ? "border-orange-500 bg-orange-50" : "border-border"}`}>
                  <div className={`font-medium ${isToday ? "text-orange-600" : ""}`}>{day}</div>
                  {dayMeetings.slice(0, 2).map((m, mi) => (
                    <div key={mi} className="mt-0.5 truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700">
                      {String((m as { requestedTime?: string }).requestedTime || "")} {String((m as { contactName?: string }).contactName || "").split(" ")[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Upcoming Meetings</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div> :
         meetings.filter(m => m.requestedDate && new Date(String(m.requestedDate)) >= today).slice(0, 10).map((m, i) => (
           <div key={i} className="flex items-center gap-3 p-2 border border-border rounded-lg mb-2">
             <Clock className="h-4 w-4 text-muted-foreground" />
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium">{String((m as { contactName?: string }).contactName || "Unknown")}</div>
               <div className="text-xs text-muted-foreground">{m.requestedDate ? new Date(String(m.requestedDate)).toDateString() : ""} at {String((m as { requestedTime?: string }).requestedTime || "")}</div>
             </div>
             <Badge variant="outline">{String(m.status || "new")}</Badge>
           </div>
         ))}
      </CardContent></Card>
    </div>
  );
}
