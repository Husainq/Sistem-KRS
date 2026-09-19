import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, UserX, Search } from 'lucide-react';

interface Mahasiswa {
    id: number;
    nim: string;
    name: string;
    email: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    mahasiswa: {
        data: Mahasiswa[];
        links: PaginationLink[];
        from: number; // Dipakai untuk kalkulasi nomor urut
    };
    filters?: {
        search?: string;
    };
}

export default function Index({ mahasiswa, filters }: Props) {
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');

    // Form untuk Tambah
    const addForm = useForm({
        nim: '',
        name: '',
        email: '',
        password: '',
    });

    // Form untuk Edit
    const editForm = useForm({
        nim: '',
        name: '',
        email: '',
        password: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/mahasiswa', {
            onSuccess: () => {
                addForm.reset();
                setOpenAdd(false);
            },
        });
    };

    const handleOpenEdit = (m: Mahasiswa) => {
        setSelectedMahasiswa(m);
        editForm.setData({
            nim: m.nim,
            name: m.name,
            email: m.email,
            password: '',
        });
        setOpenEdit(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMahasiswa) return;

        editForm.put(`/admin/mahasiswa/${selectedMahasiswa.id}`, {
            onSuccess: () => {
                editForm.reset();
                setOpenEdit(false);
                setSelectedMahasiswa(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data mahasiswa ini?')) {
            router.delete(`/admin/mahasiswa/${id}`);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.get('/admin/mahasiswa', { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Daftar Mahasiswa" />

            <div className="p-6 space-y-6">
                {/* Header Page & Button Tambah */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Data Mahasiswa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data mahasiswa terdaftar di sistem.
                        </p>
                    </div>

                    {/* Modal Tambah Mahasiswa */}
                    <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Mahasiswa
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Tambah Mahasiswa Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nim">NIM</Label>
                                    <Input
                                        id="nim"
                                        placeholder="Masukkan NIM"
                                        value={addForm.data.nim}
                                        onChange={(e) => addForm.setData('nim', e.target.value)}
                                    />
                                    {addForm.errors.nim && (
                                        <span className="text-xs text-destructive">{addForm.errors.nim}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        placeholder="Masukkan nama lengkap"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                    />
                                    {addForm.errors.name && (
                                        <span className="text-xs text-destructive">{addForm.errors.name}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@domain.com"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                    />
                                    {addForm.errors.email && (
                                        <span className="text-xs text-destructive">{addForm.errors.email}</span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={addForm.data.password}
                                        onChange={(e) => addForm.setData('password', e.target.value)}
                                    />
                                    {addForm.errors.password && (
                                        <span className="text-xs text-destructive">{addForm.errors.password}</span>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpenAdd(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={addForm.processing}>
                                        {addForm.processing ? 'Menyimpan...' : 'Simpan Data'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Modal Edit Mahasiswa */}
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Data Mahasiswa</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nim">NIM</Label>
                                <Input
                                    id="edit-nim"
                                    value={editForm.data.nim}
                                    onChange={(e) => editForm.setData('nim', e.target.value)}
                                />
                                {editForm.errors.nim && (
                                    <span className="text-xs text-destructive">{editForm.errors.nim}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Lengkap</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && (
                                    <span className="text-xs text-destructive">{editForm.errors.name}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                />
                                {editForm.errors.email && (
                                    <span className="text-xs text-destructive">{editForm.errors.email}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password (Opsional)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    placeholder="Kosongkan jika tidak diubah"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                />
                                {editForm.errors.password && (
                                    <span className="text-xs text-destructive">{editForm.errors.password}</span>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenEdit(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Perbarui...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari NIM, nama, atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                            aria-label="Cari mahasiswa"
                        />
                    </div>
                    <Button type="submit" variant="outline">
                        Cari
                    </Button>
                </form>

                {/* Tabel Mahasiswa */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b bg-muted/50">
                                <tr className="border-b transition-colors">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">
                                        No
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        NIM
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Nama
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Email
                                    </th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[120px]">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {mahasiswa.data && mahasiswa.data.length > 0 ? (
                                    mahasiswa.data.map((m, index) => (
                                        <tr
                                            key={m.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">{(mahasiswa.from ?? 1) + index}</td>
                                            <td className="p-4 align-middle">{m.nim}</td>
                                            <td className="p-4 align-middle font-medium">{m.name}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{m.email}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(m)}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(m.id)}
                                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="h-48 text-center align-middle">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <UserX className="h-10 w-10 mb-2 opacity-50" />
                                                <p className="text-base font-medium">Belum ada data mahasiswa</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Klik tombol di atas untuk menambahkan mahasiswa baru.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mahasiswa.links && mahasiswa.links.length > 3 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                            <div className="flex gap-1">
                                {mahasiswa.links.map((link, idx) =>
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background hover:bg-muted text-foreground'
                                            }`}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="px-3 py-1 text-xs rounded-md border text-muted-foreground opacity-40 cursor-not-allowed"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}   