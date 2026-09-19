import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BookOpen, Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Course { id: number; code: string; name: string; credits: number; }
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface Props { courses: { data: Course[]; links: PaginationLink[]; from: number | null }; filters?: { search?: string }; }

export default function Index({ courses, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const form = useForm({ code: '', name: '', credits: 3 });

    const openCreate = () => { setEditingCourse(null); form.reset(); form.setData('credits', 3); setOpen(true); };
    const openEdit = (course: Course) => { setEditingCourse(course); form.setData({ code: course.code, name: course.name, credits: course.credits }); setOpen(true); };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { onSuccess: () => { form.reset(); setOpen(false); setEditingCourse(null); } };
        editingCourse ? form.put(`/admin/courses/${editingCourse.id}`, options) : form.post('/admin/courses', options);
    };
    const searchCourses = (event: React.FormEvent) => { event.preventDefault(); router.get('/admin/courses', { search }, { preserveState: true, replace: true }); };
    const deleteCourse = (id: number) => { if (confirm('Yakin ingin menghapus mata kuliah ini?')) router.delete(`/admin/courses/${id}`); };

    return (
        <AppLayout>
            <Head title="Mata Kuliah" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Data Mata Kuliah</h1><p className="text-sm text-muted-foreground">Kelola mata kuliah yang tersedia.</p></div>
                    <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={openCreate}><Plus />Tambah Mata Kuliah</Button></DialogTrigger><DialogContent className="sm:max-w-[480px]"><DialogHeader><DialogTitle>{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle></DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-4"><div className="space-y-2"><Label htmlFor="code">Kode</Label><Input id="code" placeholder="IF101" value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toUpperCase())} required />{form.errors.code && <p className="text-xs text-destructive">{form.errors.code}</p>}</div><div className="space-y-2"><Label htmlFor="name">Nama</Label><Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} minLength={3} maxLength={120} required />{form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="credits">SKS</Label><Input id="credits" type="number" min="1" max="6" value={form.data.credits} onChange={(e) => form.setData('credits', Number(e.target.value))} required />{form.errors.credits && <p className="text-xs text-destructive">{form.errors.credits}</p>}</div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</Button></div></form>
                    </DialogContent></Dialog>
                </div>
                <form onSubmit={searchCourses} className="flex w-full max-w-md gap-2"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Cari kode atau nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Cari mata kuliah" /></div><Button type="submit" variant="outline">Cari</Button></form>
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm"><div className="overflow-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="h-12 px-4 text-left font-medium text-muted-foreground">No</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Kode</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">Nama</th><th className="h-12 px-4 text-left font-medium text-muted-foreground">SKS</th><th className="h-12 px-4 text-right font-medium text-muted-foreground">Aksi</th></tr></thead><tbody>{courses.data.length > 0 ? courses.data.map((course, index) => <tr key={course.id} className="border-b hover:bg-muted/50"><td className="p-4 font-medium">{(courses.from ?? 1) + index}</td><td className="p-4">{course.code}</td><td className="p-4 font-medium">{course.name}</td><td className="p-4">{course.credits}</td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(course)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Edit className="h-4 w-4" /></button><button type="button" onClick={() => deleteCourse(course.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></div></td></tr>) : <tr><td colSpan={5} className="h-48 text-center"><BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-50" /><p className="font-medium">Belum ada data mata kuliah</p></td></tr>}</tbody></table></div>
                    {courses.links.length > 3 && <div className="flex gap-1 border-t bg-muted/20 px-4 py-3">{courses.links.map((link, index) => link.url ? <Link key={index} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} className={`rounded-md border px-3 py-1 text-xs ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`} /> : <span key={index} dangerouslySetInnerHTML={{ __html: link.label }} className="rounded-md border px-3 py-1 text-xs text-muted-foreground opacity-40" />)}</div>}
                </div>
            </div>
        </AppLayout>
    );
}
