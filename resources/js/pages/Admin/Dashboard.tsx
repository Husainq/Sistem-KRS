import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, ClipboardList, GraduationCap, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';

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
    success?: string;
}

const statusStyles: Record<string, string> = {
    DRAFT: 'bg-muted text-muted-foreground',
    SUBMITTED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export default function Dashboard({ summary, statusCounts, recentEnrollments, success }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        nim: '',
        student_name: '',
        student_email: '',
        course_code: '',
        course_name: '',
        credits: '3',
        academic_year: '',
        semester: 'GANJIL',
        status: 'DRAFT',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/admin/krs', {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard Admin" />
            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
                        <p className="text-sm text-muted-foreground">Ringkasan data akademik dan aktivitas KRS terbaru.</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" onClick={() => { form.reset(); setOpen(true); }}><Plus />Create KRS</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
                            <DialogHeader>
                                <DialogTitle>Create KRS Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-5 pt-4">
                                <section className="space-y-3">
                                    <div><h3 className="font-semibold">Data Mahasiswa</h3><p className="text-sm text-muted-foreground">Akun mahasiswa dibuat otomatis untuk data baru ini.</p></div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="NIM"><Input value={form.data.nim} onChange={(event) => form.setData('nim', event.target.value)} required />{form.errors.nim && <ErrorText>{form.errors.nim}</ErrorText>}</Field>
                                        <Field label="Nama"><Input value={form.data.student_name} onChange={(event) => form.setData('student_name', event.target.value)} required />{form.errors.student_name && <ErrorText>{form.errors.student_name}</ErrorText>}</Field>
                                    </div>
                                    <Field label="Email"><Input type="email" value={form.data.student_email} onChange={(event) => form.setData('student_email', event.target.value)} required />{form.errors.student_email && <ErrorText>{form.errors.student_email}</ErrorText>}</Field>
                                </section>
                                <section className="space-y-3 border-t pt-4">
                                    <div><h3 className="font-semibold">Data Mata Kuliah</h3><p className="text-sm text-muted-foreground">Masukkan mata kuliah yang akan diambil.</p></div>
                                    <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                                        <Field label="Kode"><Input value={form.data.course_code} onChange={(event) => form.setData('course_code', event.target.value.toUpperCase())} placeholder="IF101" required />{form.errors.course_code && <ErrorText>{form.errors.course_code}</ErrorText>}</Field>
                                        <Field label="Nama Mata Kuliah"><Input value={form.data.course_name} onChange={(event) => form.setData('course_name', event.target.value)} required />{form.errors.course_name && <ErrorText>{form.errors.course_name}</ErrorText>}</Field>
                                    </div>
                                    <Field label="SKS"><Input type="number" min="1" max="6" value={form.data.credits} onChange={(event) => form.setData('credits', event.target.value)} required />{form.errors.credits && <ErrorText>{form.errors.credits}</ErrorText>}</Field>
                                </section>
                                <section className="space-y-3 border-t pt-4">
                                    <div><h3 className="font-semibold">Data Enrollment</h3><p className="text-sm text-muted-foreground">Semua data akan disimpan dalam satu transaksi.</p></div>
                                    <Field label="Tahun Akademik"><Input placeholder="2025/2026" pattern="[0-9]{4}/[0-9]{4}" value={form.data.academic_year} onChange={(event) => form.setData('academic_year', event.target.value)} required />{form.errors.academic_year && <ErrorText>{form.errors.academic_year}</ErrorText>}</Field>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="Semester"><Select value={form.data.semester} onChange={(value) => form.setData('semester', value)} options={['GANJIL', 'GENAP']} /></Field>
                                        <Field label="Status"><Select value={form.data.status} onChange={(value) => form.setData('status', value)} options={['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']} /></Field>
                                    </div>
                                </section>
                                <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan Semua Data'}</Button></div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {success && <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{success}</div>}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
    return <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-destructive">{children}</p>;
}
