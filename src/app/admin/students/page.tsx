"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";

type Student = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string | null;
  country: string | null;
  status: string;
  updatedAt: string;
  referralCount: number;
  inquiryCount: number;
  studyLevel: string | null;
  destination: string | null;
  intake: string | null;
  latestReference: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<Student[]>("/api/v1/admin/students")
      .then((response) => setStudents(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load students."))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Students" subtitle="Real CRM contacts with education-advisory or referral evidence" />
      <Card><CardContent className="p-0">
        {loading ? <p className="p-8 text-sm text-muted-foreground">Loading students…</p> : students.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No student contact or referral records are stored.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Study context</th><th className="px-4 py-3">CRM evidence</th><th className="px-4 py-3">Updated</th></tr></thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3"><Link href={`/admin/contacts?q=${encodeURIComponent(student.email)}`} className="font-medium text-blue-700 hover:underline">{student.fullName}</Link><div className="text-xs text-muted-foreground">{student.email}</div><div className="text-xs text-muted-foreground">{student.whatsapp || "No WhatsApp"} · {student.country || "Country not provided"}</div></td>
                    <td className="px-4 py-3"><div>{student.studyLevel || "Study level not provided"}</div><div className="text-xs text-muted-foreground">{student.destination || "Destination not provided"}{student.intake ? ` · ${student.intake}` : ""}</div></td>
                    <td className="px-4 py-3"><Badge variant="outline">{student.status}</Badge><div className="mt-1 text-xs text-muted-foreground">{student.inquiryCount} inquiries · {student.referralCount} referrals</div>{student.latestReference && <div className="font-mono text-[11px] text-muted-foreground">{student.latestReference}</div>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(student.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
