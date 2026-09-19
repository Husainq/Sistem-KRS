import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ClipboardList, GraduationCap } from 'lucide-react';

interface Enrollment { id: number; academic_year: string; semester: string; status: string; course?: { code: string; name: string; credits: number }; }
interface Props { student: { nim: string; name: string }; summary: { totalCredits: number; totalEnrollments: number; draftCount: number }; recentEnrollments: Enrollment[]; }

export default function MahasiswaDashboard({ student, summary, recentEnrollments }: Props) {
    return (
        <AppLayout>
            <Head title="Dashboard Mahasiswa" />
            <div className="space-y-6 p-6">
                <div><p className="text-sm text-muted-foreground">Selamat datang</p><h1 className="text-2xl font-bold">{student.name}</h1><p className="text-sm text-muted-foreground">NIM {student.nim}</p></div>
                <div className="grid gap-4 md:grid-cols-3"><div className="rounded-lg border bg-card p-5"><BookOpen className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Total SKS</p><p className="text-2xl font-bold">{summary.totalCredits}</p></div><div className="rounded-lg border bg-card p-5"><GraduationCap className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Mata Kuliah Diambil</p><p className="text-2xl font-bold">{summary.totalEnrollments}</p></div><div className="rounded-lg border bg-card p-5"><ClipboardList className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">KRS Draft</p><p className="text-2xl font-bold">{summary.draftCount}</p></div></div>
                <div className="overflow-hidden rounded-lg border bg-card"><div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">KRS Terbaru</h2><Button asChild variant="outline" size="sm"><Link href="/mahasiswa/enrollments">Lihat Semua</Link></Button></div><div className="divide-y">{recentEnrollments.length ? recentEnrollments.map((enrollment) => <div key={enrollment.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{enrollment.course?.name}</p><p className="text-sm text-muted-foreground">{enrollment.course?.code} · {enrollment.course?.credits} SKS · {enrollment.academic_year}</p></div><span className="text-sm text-muted-foreground">{enrollment.status}</span></div>) : <p className="p-6 text-sm text-muted-foreground">Belum ada data KRS.</p>}</div></div>
            </div>
        </AppLayout>
    );
}
