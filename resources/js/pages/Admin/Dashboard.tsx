import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ClipboardList, GraduationCap, Users } from 'lucide-react';

interface RecentEnrollment {
    id: number;
    academic_year: string;
    semester: string;
    status: string;
    student?: { nim: string; name: string };
    course?: { code: string; name: string };
}

interface Props {
    summary: { students: number; courses: number; enrollments: number; pendingEnrollments: number };
    statusCounts: { draft: number; submitted: number; approved: number; rejected: number };
    recentEnrollments: RecentEnrollment[];
}

const statusStyles: Record<string, string> = {
    DRAFT: 'bg-muted text-muted-foreground',
    SUBMITTED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export default function Dashboard({ summary, statusCounts, recentEnrollments }: Props) {
    return (
        <AppLayout>
            <Head title="Dashboard Admin" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
                    <p className="text-sm text-muted-foreground">Ringkasan data akademik dan aktivitas KRS terbaru.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Mahasiswa" value={summary.students} icon={<Users />} href="/admin/mahasiswa" />
                    <StatCard label="Total Mata Kuliah" value={summary.courses} icon={<BookOpen />} href="/admin/courses" />
                    <StatCard label="Total Enrollment" value={summary.enrollments} icon={<GraduationCap />} href="/admin/enrollments" />
                    <StatCard label="KRS Draft" value={summary.pendingEnrollments} icon={<ClipboardList />} href="/admin/enrollments?search=DRAFT" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b p-4">
                            <div><h2 className="font-semibold">Enrollment Terbaru</h2><p className="text-sm text-muted-foreground">Aktivitas KRS paling baru.</p></div>
                            <Button asChild variant="outline" size="sm"><Link href="/admin/enrollments">Kelola</Link></Button>
                        </div>
                        <div className="overflow-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/40"><tr><th className="px-4 py-3 text-left font-medium text-muted-foreground">Mahasiswa</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Mata Kuliah</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Periode</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th></tr></thead><tbody>{recentEnrollments.length ? recentEnrollments.map((enrollment) => <tr key={enrollment.id} className="border-b last:border-0 hover:bg-muted/40"><td className="p-4"><div className="font-medium">{enrollment.student?.name ?? '-'}</div><div className="text-xs text-muted-foreground">{enrollment.student?.nim}</div></td><td className="p-4"><div className="font-medium">{enrollment.course?.name ?? '-'}</div><div className="text-xs text-muted-foreground">{enrollment.course?.code}</div></td><td className="p-4">{enrollment.academic_year}<br /><span className="text-xs text-muted-foreground">{enrollment.semester}</span></td><td className="p-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[enrollment.status] ?? statusStyles.DRAFT}`}>{enrollment.status}</span></td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada aktivitas enrollment.</td></tr>}</tbody></table></div>
                    </section>

                    <section className="rounded-lg border bg-card p-5 shadow-sm"><h2 className="font-semibold">Status KRS</h2><p className="mt-1 text-sm text-muted-foreground">Distribusi status enrollment saat ini.</p><div className="mt-5 space-y-4"><StatusRow label="Draft" value={statusCounts.draft} color="bg-slate-400" /><StatusRow label="Submitted" value={statusCounts.submitted} color="bg-amber-500" /><StatusRow label="Approved" value={statusCounts.approved} color="bg-emerald-500" /><StatusRow label="Rejected" value={statusCounts.rejected} color="bg-red-500" /></div></section>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value, icon, href }: { label: string; value: number; icon: React.ReactNode; href: string }) {
    return <Link href={href} className="group rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/30"><div className="flex items-center justify-between"><span className="rounded-md bg-primary/10 p-2 text-primary">{icon}</span><span className="text-3xl font-bold tabular-nums">{value.toLocaleString('id-ID')}</span></div><p className="mt-4 text-sm text-muted-foreground group-hover:text-foreground">{label}</p></Link>;
}

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
    return <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${color}`} />{label}</div><span className="font-semibold tabular-nums">{value.toLocaleString('id-ID')}</span></div>;
}
