import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Edit({ course }: { course: any }) {
    return (
        <AppLayout>
            <Head title="Edit Mata Kuliah" />

            <div className="p-4 max-w-xl">
                <h1 className="text-xl font-semibold">Edit Mata Kuliah</h1>
                <form method="post" action={`/admin/courses/${course.id}`} className="mt-4 space-y-2">
                    <input type="hidden" name="_method" value="put" />
                    <div>
                        <label className="block text-sm">Kode</label>
                        <input name="code" defaultValue={course.code} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-sm">Nama</label>
                        <input name="name" defaultValue={course.name} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-sm">SKS</label>
                        <input name="credits" defaultValue={course.credits} type="number" required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
