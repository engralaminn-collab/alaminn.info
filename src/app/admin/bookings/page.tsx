"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/meetings")
      .then((d) => { if (d.success && d.data) setBookings((d.data as { meetings?: Record<string, unknown>[] }).meetings || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Bookings</h1><p className="text-sm text-muted-foreground mt-1">Manage all meeting bookings from website visitors</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Calendar className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : bookings.length}</div><div className="text-xs text-muted-foreground">Total Bookings</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Clock className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : bookings.filter(b => String(b.status) === "new").length}</div><div className="text-xs text-muted-foreground">New</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><CheckCircle className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : bookings.filter(b => String(b.status) === "confirmed").length}</div><div className="text-xs text-muted-foreground">Confirmed</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Booking List</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         bookings.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No bookings found.</div> :
         <div className="space-y-2">{bookings.slice(0, 20).map((b, i) => (
           <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
             <div className="min-w-0">
               <div className="font-medium text-sm">{String((b as { contactName?: string }).contactName || "Unknown")}</div>
               <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                 <span className="capitalize">{String((b as { meetingType?: string }).meetingType || "meeting").replace(/-/g, " ")}</span>
                 <span>·</span>
                 <span>{b.requestedDate ? new Date(String(b.requestedDate)).toDateString() : "Date TBD"}</span>
                 {((b as { requestedTime?: string }).requestedTime) && <><span>·</span><span>{String((b as { requestedTime?: string }).requestedTime)}</span></>}
               </div>
             </div>
             <div className="flex items-center gap-2">
               {((b as { reference?: string }).reference) && <span className="text-xs text-muted-foreground font-mono">{String((b as { reference?: string }).reference)}</span>}
               <Badge variant="outline">{String(b.status || "new")}</Badge>
             </div>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
