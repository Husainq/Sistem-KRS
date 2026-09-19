import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Edit({ student }: { student: any }) {
    return (
        <AppLayout>
            <Head title="Edit Mahasiswa" />

            <div className="p-4 max-w-xl">
                <h1 className="text-xl font-semibold">Edit Mahasiswa</h1>
                <form method="post" action={`/admin/mahasiswa/${student.id}`} className="mt-4 space-y-2">
                    <input type="hidden" name="_method" value="put" />
                    <div>
                        <label className="block text-sm">NIM</label>
                        <input name="nim" defaultValue={student.nim} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-sm">Nama</label>
                        <input name="name" defaultValue={student.name} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-sm">Email</label>
                        <input name="email" defaultValue={student.email} type="email" required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
