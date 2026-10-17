"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { AlertCircle, CheckCircle2, Mail, RotateCcw } from "lucide-react";

type EmailDelivery = {
  student?: "sent" | "failed" | "preview_only";
  admin?: "sent" | "failed" | "preview_only";
};

type Booking = {
  id: string;
  reference: string;
  contactName: string;
  contactEmail: string;
  meetingType: string;
  requestedTime: string;
  timezone: string;
  requestedDate: string;
  status: string;
  createdAt: string;
  emailDelivery: EmailDelivery | null;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<Booking[]>("/api/v1/admin/meetings?pageSize=100")
      .then((response) => setBookings(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <ErrorState message={error} />;

  const sentCount = bookings.filter((booking) => booking.emailDelivery?.student === "sent" && booking.emailDelivery?.admin === "sent").length;
  const attentionCount = bookings.filter((booking) => booking.emailDelivery && (booking.emailDelivery.student !== "sent" || booking.emailDelivery.admin !== "sent")).length;

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Meeting booking records, database references, and durable delivery evidence" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Total records" value={bookings.length} />
        <Metric label="Both emails sent" value={sentCount} />
        <Metric label="Email attention" value={attentionCount} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-sm text-muted-foreground">Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground">No meeting bookings are stored.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Requested slot</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Email evidence</th><th className="px-4 py-3">Created</th></tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/meetings?q=${encodeURIComponent(booking.reference)}`} className="font-medium text-blue-700 hover:underline">{booking.contactName}</Link>
                        <div className="text-xs text-muted-foreground">{booking.contactEmail}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{booking.reference}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{fmtDate(booking.requestedDate)}</div>
                        <div className="text-xs text-muted-foreground">{booking.requestedTime} · {booking.timezone}</div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline">{booking.status}</Badge></td>
                      <td className="px-4 py-3"><Delivery delivery={booking.emailDelivery} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtDate(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="h-3 w-3" /> Automatic retries are in-process only; durable manual replay remains blocked until an EmailDelivery queue model is migrated.</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></CardContent></Card>;
}

function Delivery({ delivery }: { delivery: EmailDelivery | null }) {
  if (!delivery) return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />No delivery record</span>;
  const okay = delivery.student === "sent" && delivery.admin === "sent";
  return (
    <div className={`flex items-start gap-1 text-xs ${okay ? "text-emerald-700" : "text-amber-800"}`}>
      {okay ? <CheckCircle2 className="mt-0.5 h-3 w-3" /> : <AlertCircle className="mt-0.5 h-3 w-3" />}
      <span>Student: {delivery.student || "unknown"}<br />Admin: {delivery.admin || "unknown"}</span>
    </div>
  );
}
