import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download, Edit, GraduationCap, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Enrollment {
    id: number;
    student_id: number;
    course_id: number;
    academic_year: string;
    semester: string;
    status: string;
    grade: number | null;
    student?: { nim: string; name: string };
    course?: { code: string; name: string };
}
interface Option {
    id: number;
    nim?: string;
    name?: string;
    code?: string;
}
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface Filters {
    search?: string;
    nim?: string;
    student_name?: string;
    course_code?: string;
    academic_year?: string;
    semester?: string;
    status?: string;
    filter_logic?: 'AND' | 'OR';
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    page_size?: number;
}
interface Props {
    enrollments: { data: Enrollment[]; links: PaginationLink[]; from: number | null };
    students: Option[];
    courses: Option[];
    filters?: Filters;
}
const selectClassName = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
const sortLabels: Record<string, string> = {
    nim: 'NIM',
    student_name: 'Nama',
    course_code: 'Kode MK',
    academic_year: 'Tahun',
    semester: 'Semester',
    status: 'Status',
    grade: 'Nilai',
};

export default function Index({ enrollments, students, courses, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [nim, setNim] = useState(filters?.nim ?? '');
    const [studentName, setStudentName] = useState(filters?.student_name ?? '');
    const [courseCode, setCourseCode] = useState(filters?.course_code ?? '');
    const [academicYear, setAcademicYear] = useState(filters?.academic_year ?? '');
    const [semester, setSemester] = useState(filters?.semester ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [logic, setLogic] = useState<'AND' | 'OR'>(filters?.filter_logic ?? 'AND');
    const [pageSize, setPageSize] = useState(filters?.page_size ?? 10);
    const form = useForm({ student_id: '', course_id: '', academic_year: '', semester: 'GANJIL', status: 'DRAFT', grade: '' });
    const firstSearch = useRef(true);

    const query = (overrides: Record<string, string | number> = {}) => ({
        search: '',
        nim,
        student_name: studentName,
        course_code: courseCode,
        academic_year: academicYear,
        semester,
        status,
        filter_logic: logic,
        page_size: pageSize,
        ...overrides,
    });
    const visit = (overrides: Record<string, string | number> = {}) =>
        router.get('/admin/enrollments', query(overrides), { preserveState: true, replace: true });

    useEffect(() => {
        if (firstSearch.current) {
            firstSearch.current = false;
            return;
        }
        const timer = window.setTimeout(() => visit({ filter_logic: 'AND', page: 1 }), 400);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nim, studentName, courseCode]);

    const openCreate = () => {
        setEditingEnrollment(null);
        form.reset();
        setOpen(true);
    };
    const openEdit = (enrollment: Enrollment) => {
        setEditingEnrollment(enrollment);
        form.setData({
            student_id: String(enrollment.student_id),
            course_id: String(enrollment.course_id),
            academic_year: enrollment.academic_year,
            semester: enrollment.semester,
            status: enrollment.status,
            grade: enrollment.grade === null ? '' : String(enrollment.grade),
        });
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                form.reset();
                setOpen(false);
                setEditingEnrollment(null);
            },
        };
        if (editingEnrollment) {
            form.put(`/admin/enrollments/${editingEnrollment.id}`, options);
        } else {
            form.post('/admin/enrollments', options);
        }
    };
    const submitFilters = (event: React.FormEvent) => {
        event.preventDefault();
        visit();
    };
    const sort = (column: string) =>
        visit({ sort_by: column, sort_direction: filters?.sort_by === column && filters?.sort_direction === 'asc' ? 'desc' : 'asc' });
    const exportData = () => {
        const params = new URLSearchParams(Object.entries(query()).map(([key, value]) => [key, String(value)]));
        window.location.href = `/admin/enrollments/export?${params.toString()}`;
    };
    const deleteEnrollment = (id: number) => {
        if (confirm('Yakin ingin menghapus enrollment ini?')) router.delete(`/admin/enrollments/${id}`);
    };

    return (
        <AppLayout>
            <Head title="Enrollment" />
            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data Enrollment</h1>
                        <p className="text-muted-foreground text-sm">Kelola data KRS dengan query server-side.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={exportData}>
                            <Download />
                            Export CSV
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreate}>
                                    <Plus />
                                    Tambah Enrollment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader>
                                    <DialogTitle>{editingEnrollment ? 'Edit Enrollment' : 'Tambah Enrollment'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-4 pt-4">
                                    <Field label="Mahasiswa">
                                        <select
                                            value={form.data.student_id}
                                            onChange={(e) => form.setData('student_id', e.target.value)}
                                            className={selectClassName}
                                            required
                                        >
                                            <option value="">Pilih mahasiswa</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.nim} - {student.name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.student_id && <ErrorText>{form.errors.student_id}</ErrorText>}
                                    </Field>
                                    <Field label="Mata Kuliah">
                                        <select
                                            value={form.data.course_id}
                                            onChange={(e) => form.setData('course_id', e.target.value)}
                                            className={selectClassName}
                                            required
                                        >
                                            <option value="">Pilih mata kuliah</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.course_id && <ErrorText>{form.errors.course_id}</ErrorText>}
                                    </Field>
                                    <Field label="Tahun Akademik">
                                        <Input
                                            placeholder="2025/2026"
                                            pattern="[0-9]{4}/[0-9]{4}"
                                            value={form.data.academic_year}
                                            onChange={(e) => form.setData('academic_year', e.target.value)}
                                            required
                                        />
                                        {form.errors.academic_year && <ErrorText>{form.errors.academic_year}</ErrorText>}
                                    </Field>
                                    <Field label="Semester">
                                        <select
                                            value={form.data.semester}
                                            onChange={(e) => form.setData('semester', e.target.value)}
                                            className={selectClassName}
                                            required
                                        >
                                            <option>GANJIL</option>
                                            <option>GENAP</option>
                                        </select>
                                    </Field>
                                    <Field label="Status">
                                        <select
                                            value={form.data.status}
                                            onChange={(e) => form.setData('status', e.target.value)}
                                            className={selectClassName}
                                            required
                                        >
                                            <option>DRAFT</option>
                                            <option>SUBMITTED</option>
                                            <option>APPROVED</option>
                                            <option>REJECTED</option>
                                        </select>
                                    </Field>
                                    <Field label="Nilai">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.data.grade}
                                            onChange={(e) => form.setData('grade', e.target.value)}
                                        />
                                    </Field>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={form.processing}>
                                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <form onSubmit={submitFilters} className="bg-card space-y-3 rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Field label="Cari NIM">
                            <Input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Contoh: 2026" />
                        </Field>
                        <Field label="Cari Nama Mahasiswa">
                            <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Contoh: Budi" />
                        </Field>
                        <Field label="Cari Kode MK">
                            <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} placeholder="Contoh: IF1" />
                        </Field>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="w-36">
                            <Label htmlFor="status">Status</Label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClassName}>
                                <option value="">Semua</option>
                                <option>DRAFT</option>
                                <option>SUBMITTED</option>
                                <option>APPROVED</option>
                                <option>REJECTED</option>
                            </select>
                        </div>
                        <div className="w-36">
                            <Label htmlFor="semester">Semester</Label>
                            <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} className={selectClassName}>
                                <option value="">Semua</option>
                                <option>GANJIL</option>
                                <option>GENAP</option>
                            </select>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setFiltersOpen(!filtersOpen)}>
                            {filtersOpen ? 'Sembunyikan Filter' : 'Advanced Filter'}
                        </Button>
                        <Button type="submit">Terapkan</Button>
                    </div>
                    {filtersOpen && (
                        <div className="grid gap-3 border-t pt-3 md:grid-cols-3">
                            <Field label="Logika">
                                <select value={logic} onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')} className={selectClassName}>
                                    <option>AND</option>
                                    <option>OR</option>
                                </select>
                            </Field>
                            <Field label="Tahun Akademik">
                                <Input placeholder="2025/2026" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                            </Field>
                            <Field label="Jumlah per halaman">
                                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={selectClassName}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </Field>
                        </div>
                    )}
                </form>

                <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <SortableHeader label="No" column="id" onSort={sort} />
                                    <SortableHeader label="NIM" column="nim" onSort={sort} />
                                    <SortableHeader label="Mahasiswa" column="student_name" onSort={sort} />
                                    <SortableHeader label="Kode MK" column="course_code" onSort={sort} />
                                    <SortableHeader label="Tahun" column="academic_year" onSort={sort} />
                                    <SortableHeader label="Semester" column="semester" onSort={sort} />
                                    <SortableHeader label="Status" column="status" onSort={sort} />
                                    <SortableHeader label="Nilai" column="grade" onSort={sort} />
                                    <th className="text-muted-foreground h-12 px-4 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.data.length ? (
                                    enrollments.data.map((enrollment, index) => (
                                        <tr key={enrollment.id} className="hover:bg-muted/50 border-b">
                                            <td className="p-4 font-medium">{(enrollments.from ?? 1) + index}</td>
                                            <td className="p-4">{enrollment.student?.nim}</td>
                                            <td className="p-4">{enrollment.student?.name}</td>
                                            <td className="p-4">{enrollment.course?.code}</td>
                                            <td className="p-4">{enrollment.academic_year}</td>
                                            <td className="p-4">{enrollment.semester}</td>
                                            <td className="p-4">{enrollment.status}</td>
                                            <td className="p-4">{enrollment.grade ?? '-'}</td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(enrollment)}
                                                        className="text-muted-foreground hover:bg-muted rounded-md p-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteEnrollment(enrollment.id)}
                                                        className="text-destructive hover:bg-destructive/10 rounded-md p-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="h-48 text-center">
                                            <GraduationCap className="text-muted-foreground mx-auto mb-2 h-10 w-10 opacity-50" />
                                            <p className="font-medium">Belum ada data enrollment</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                        <div className="flex gap-1">
                            {enrollments.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded-md border px-3 py-1 text-xs ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="text-muted-foreground rounded-md border px-3 py-1 text-xs opacity-40"
                                    />
                                ),
                            )}
                        </div>
                        <span className="text-muted-foreground text-xs">
                            Sort: {sortLabels[filters?.sort_by ?? 'id'] ?? 'ID'} ({filters?.sort_direction ?? 'desc'})
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            {children}
        </div>
    );
}
function ErrorText({ children }: { children: React.ReactNode }) {
    return <p className="text-destructive text-xs">{children}</p>;
}
function SortableHeader({ label, column, onSort }: { label: string; column: string; onSort: (column: string) => void }) {
    return (
        <th className="text-muted-foreground h-12 px-4 text-left font-medium">
            <button type="button" onClick={() => onSort(column)} className="hover:text-foreground">
                {label} ↕
            </button>
        </th>
    );
}
