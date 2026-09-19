import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import React, { useState } from 'react';

interface Enrollment { id: number; academic_year: string; semester: string; status: string; grade: number | null; course?: { code: string; name: string; credits: number }; }
interface Course { id: number; code: string; name: string; credits: number; }
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface Props { student: { nim: string; name: string }; courses: Course[]; enrollments: { data: Enrollment[]; links: PaginationLink[]; from: number | null }; filters?: { search?: string }; }

export default function Index({ student, courses, enrollments, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [open, setOpen] = useState(false);
    const form = useForm({ course_id: '', academic_year: '', semester: 'GANJIL' });
    const submitSearch = (event: React.FormEvent) => { event.preventDefault(); router.get('/mahasiswa/enrollments', { search }, { preserveState: true, replace: true }); };
    const submitEnrollment = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/mahasiswa/enrollments', { onSuccess: () => { form.reset(); setOpen(false); } });
    };

    return (
        <AppLayout>
            <Head title="KRS Saya" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">KRS Saya</h1><p className="text-sm text-muted-foreground">{student.name} · NIM {student.nim}</p></div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={() => { form.reset(); setOpen(true); }}><Plus />Tambah KRS</Button></DialogTrigger><DialogContent className="sm:max-w-[460px]"><DialogHeader><DialogTitle>Tambah KRS</DialogTitle></DialogHeader><form onSubmit={submitEnrollment} className="space-y-4 pt-4"><div className="space-y-2"><label htmlFor="course_id" className="text-sm font-medium">Mata Kuliah</label><select id="course_id" value={form.data.course_id} onChange={(event) => form.setData('course_id', event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required><option value="">Pilih mata kuliah</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name} ({course.credits} SKS)</option>)}</select>{form.errors.course_id && <p className="text-xs text-destructive">{form.errors.course_id}</p>}</div><div className="space-y-2"><label htmlFor="academic_year" className="text-sm font-medium">Tahun Akademik</label><Input id="academic_year" placeholder="2025/2026" pattern="[0-9]{4}/[0-9]{4}" value={form.data.academic_year} onChange={(event) => form.setData('academic_year', event.target.value)} required />{form.errors.academic_year && <p className="text-xs text-destructive">{form.errors.academic_year}</p>}</div><div className="space-y-2"><label htmlFor="semester" className="text-sm font-medium">Semester</label><select id="semester" value={form.data.semester} onChange={(event) => form.setData('semester', event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required><option value="GANJIL">GANJIL</option><option value="GENAP">GENAP</option></select>{form.errors.semester && <p className="text-xs text-destructive">{form.errors.semester}</p>}</div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan KRS'}</Button></div></form></DialogContent></Dialog></div>
                <form onSubmit={submitSearch} className="flex w-full max-w-md gap-2"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mata kuliah, tahun, atau status..." className="pl-9" aria-label="Cari KRS" /></div><button type="submit" className="rounded-md border px-4 text-sm hover:bg-muted">Cari</button></form>
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm"><div className="overflow-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="h-12 px-4 text-left font-medium text-muted-foreground">No</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Mata Kuliah</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">SKS</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Tahun Akademik</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Semester</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Nilai</th></tr></thead><tbody>{enrollments.data.length ? enrollments.data.map((enrollment, index) => <tr key={enrollment.id} className="border-b hover:bg-muted/50"><td className="p-4 font-medium">{(enrollments.from ?? 1) + index}</td><td className="p-4"><div className="font-medium">{enrollment.course?.name ?? '-'}</div><div className="text-xs text-muted-foreground">{enrollment.course?.code}</div></td><td className="p-4">{enrollment.course?.credits ?? '-'}</td><td className="p-4">{enrollment.academic_year}</td><td className="p-4">{enrollment.semester}</td><td className="p-4">{enrollment.status}</td><td className="p-4">{enrollment.grade ?? '-'}</td></tr>) : <tr><td colSpan={7} className="h-48 text-center text-muted-foreground">Belum ada data KRS.</td></tr>}</tbody></table></div>{enrollments.links.length > 3 && <div className="flex gap-1 border-t bg-muted/20 px-4 py-3">{enrollments.links.map((link, index) => link.url ? <Link key={index} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} className={`rounded-md border px-3 py-1 text-xs ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`} /> : <span key={index} dangerouslySetInnerHTML={{ __html: link.label }} className="rounded-md border px-3 py-1 text-xs text-muted-foreground opacity-40" />)}</div>}</div>
            </div>
        </AppLayout>
    );
}
