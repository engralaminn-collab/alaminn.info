"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Users, Search, Mail, Phone, Building2 } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/contacts")
      .then((d) => { if (d.success && d.data) setStudents((d.data as { contacts?: Record<string, unknown>[] }).contacts || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const name = String((s as { fullName?: string }).fullName || "").toLowerCase();
    const email = String((s as { email?: string }).email || "").toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student contacts and profiles</p>
        </div>
        <Button>Add Student</Button>
      </div>
      <Card><CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Users className="h-5 w-5"/></div>
        <div><div className="text-2xl font-bold tabular">{loading ? "..." : students.length}</div><div className="text-xs text-muted-foreground">Total Students</div></div>
      </CardContent></Card>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input type="text" className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardHeader><CardTitle>Student List</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
           filtered.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No students found.</div> :
           <div className="space-y-2">
             {filtered.slice(0, 30).map((s, i) => (
               <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{String((s as { fullName?: string }).fullName || "?").charAt(0)}</div>
                 <div className="flex-1 min-w-0">
                   <div className="font-medium text-sm">{String((s as { fullName?: string }).fullName || "Unknown")}</div>
                   <div className="flex items-center gap-3 text-xs text-muted-foreground">
                     {((s as { email?: string }).email) && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{String((s as { email?: string }).email)}</span>}
                     {((s as { phone?: string }).phone) && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{String((s as { phone?: string }).phone)}</span>}
                     {((s as { organization?: string }).organization) && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{String((s as { organization?: string }).organization)}</span>}
                   </div>
                 </div>
                 <Badge variant="outline">{String((s as { status?: string }).status || "active")}</Badge>
               </div>
             ))}
           </div>}
        </CardContent>
      </Card>
    </div>
  );
}
