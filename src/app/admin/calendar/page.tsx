"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { CalendarDays, Clock } from "lucide-react";

type Meeting = {
  id: string;
  reference: string;
  contactName: string;
  contactEmail: string;
  meetingType: string;
  requestedDate: string;
  requestedTime: string;
  timezone: string;
  status: string;
};

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  useEffect(() => {
    adminFetch<Meeting[]>("/api/v1/admin/meetings?pageSize=100")
      .then((response) => {
        setNow(Date.now());
        setMeetings(response.data);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load calendar."))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(
    () => meetings
      .filter((meeting) => {
        return new Date(meeting.requestedDate).getTime() >= now - 24 * 60 * 60_000 && !["cancelled", "declined"].includes(meeting.status);
      })
      .sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime()),
    [meetings, now]
  );

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Upcoming meeting requests from the database · Asia/Dhaka unless the booking records another timezone"
      />
      {loading ? (
        <p className="py-16 text-sm text-muted-foreground">Loading calendar…</p>
      ) : upcoming.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-14 text-center"><CalendarDays className="mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No upcoming meetings</p><p className="text-sm text-muted-foreground">New booking requests will appear here after their database transaction succeeds.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {upcoming.map((meeting) => {
            const when = new Date(meeting.requestedDate);
            return (
              <Card key={meeting.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {when.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}
                      </p>
                      <CardTitle className="mt-1 text-base">{meeting.contactName}</CardTitle>
                    </div>
                    <Badge variant="outline">{meeting.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{meeting.requestedTime} · {meeting.timezone}</span>
                  <span>{meeting.meetingType.replaceAll("-", " ")}</span>
                  <span className="text-muted-foreground">{meeting.reference}</span>
                  <Link href={`/admin/meetings?q=${encodeURIComponent(meeting.reference)}`} className="ml-auto text-blue-700 hover:underline">Open booking</Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
