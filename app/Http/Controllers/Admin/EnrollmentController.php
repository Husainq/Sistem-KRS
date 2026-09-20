<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courses;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $pageSize = min(max((int) $request->input('page_size', 10), 10), 100);
        $page = max((int) $request->input('page', 1), 1);
        $query = $this->filteredQuery($filters);

        $paginator = $query
            ->simplePaginate($pageSize, ['enrollments.*'], 'page', $page)
            ->withQueryString();

        $paginator = $paginator->through(fn ($row) => [
            'id' => $row->id,
            'student_id' => $row->student_id,
            'course_id' => $row->course_id,
            'academic_year' => $row->academic_year,
            'semester' => $row->semester,
            'status' => $row->status,
            'grade' => $row->grade,
            'student' => ['nim' => $row->student_nim, 'name' => $row->student_name],
            'course' => ['code' => $row->course_code, 'name' => $row->course_name],
        ]);

        $enrollments = [
            'data' => $paginator->items(),
            'from' => $paginator->firstItem(),
            'links' => [
                [
                    'url' => $paginator->previousPageUrl(),
                    'label' => '&laquo; Sebelumnya',
                    'active' => false,
                ],
                [
                    'url' => $paginator->nextPageUrl(),
                    'label' => 'Berikutnya &raquo;',
                    'active' => false,
                ],
            ],
        ];

        return inertia('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'students' => Student::query()->orderBy('name')->get(['id', 'nim', 'name']),
            'courses' => Courses::query()->orderBy('code')->get(['id', 'code', 'name']),
            'filters' => [...$filters, 'page_size' => $pageSize],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->filteredQuery($this->filters($request));
        $filename = 'enrollments-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', 'NIM', 'Nama Mahasiswa', 'Kode MK', 'Nama MK', 'Tahun Akademik', 'Semester', 'Status', 'Nilai']);

            $query->orderBy('enrollments.id')->chunkById(5000, function ($rows) use ($output): void {
                foreach ($rows as $row) {
                    fputcsv($output, [$row->id, $row->student_nim, $row->student_name, $row->course_code, $row->course_name, $row->academic_year, $row->semester, $row->status, $row->grade]);
                }
            }, 'enrollments.id', 'id');

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request)
    {
        Enrollment::create($this->validateEnrollment($request));

        return back()->with('success', 'Enrollment ditambahkan.');
    }

    public function storeKrs(Request $request)
    {
        $validated = $request->validate([
            'nim' => ['required', 'regex:/^[0-9]{8,12}$/', 'unique:students,nim'],
            'student_name' => ['required', 'string', 'max:100'],
            'student_email' => ['required', 'email', 'unique:users,email'],
            'course_code' => ['required', 'regex:/^[A-Z]{2,4}[0-9]{3}$/', 'unique:courses,code'],
            'course_name' => ['required', 'string', 'min:3', 'max:120'],
            'credits' => ['required', 'integer', 'min:1', 'max:6'],
            'academic_year' => ['required', 'regex:/^\d{4}\/\d{4}$/'],
            'semester' => ['required', 'in:GANJIL,GENAP'],
            'status' => ['required', 'in:DRAFT,SUBMITTED,APPROVED,REJECTED'],
        ]);

        DB::transaction(function () use ($validated): void {
            $user = User::create([
                'name' => $validated['student_name'],
                'email' => $validated['student_email'],
                'password' => Hash::make(Str::random(40)),
                'role' => 'mahasiswa',
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'nim' => $validated['nim'],
                'name' => $validated['student_name'],
                'email' => $validated['student_email'],
            ]);

            $course = Courses::create([
                'code' => $validated['course_code'],
                'name' => $validated['course_name'],
                'credits' => $validated['credits'],
            ]);

            Enrollment::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'academic_year' => $validated['academic_year'],
                'semester' => $validated['semester'],
                'status' => $validated['status'],
            ]);
        });

        return back()->with('success', 'Mahasiswa, mata kuliah, dan enrollment berhasil dibuat.');
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $enrollment->update($this->validateEnrollment($request));

        return back()->with('success', 'Enrollment diperbarui.');
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('success', 'Enrollment dihapus.');
    }

    private function validateEnrollment(Request $request): array
    {
        return $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'academic_year' => ['required', 'regex:/^\d{4}\/\d{4}$/'],
            'semester' => ['required', 'in:GANJIL,GENAP'],
            'status' => ['required', 'in:DRAFT,SUBMITTED,APPROVED,REJECTED'],
            'grade' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'nim' => trim((string) $request->input('nim', '')),
            'student_name' => trim((string) $request->input('student_name', '')),
            'course_code' => trim((string) $request->input('course_code', '')),
            'academic_year' => trim((string) $request->input('academic_year', '')),
            'semester' => $request->input('semester', ''),
            'status' => $request->input('status', ''),
            'filter_logic' => strtoupper($request->input('filter_logic', 'AND')) === 'OR' ? 'OR' : 'AND',
            'sort_by' => $request->input('sort_by', 'id'),
            'sort_direction' => strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc',
        ];
    }

    private function filteredQuery(array $filters)
    {
        $sortColumns = [
            'id' => 'enrollments.id',
            'nim' => 'students.nim',
            'student_name' => 'students.name',
            'course_code' => 'courses.code',
            'academic_year' => 'enrollments.academic_year',
            'semester' => 'enrollments.semester',
            'status' => 'enrollments.status',
            'grade' => 'enrollments.grade',
        ];
        $query = DB::table('enrollments')
            ->join('students', 'students.id', '=', 'enrollments.student_id')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->select('enrollments.*', 'students.nim as student_nim', 'students.name as student_name', 'courses.code as course_code', 'courses.name as course_name');

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($query) use ($search): void {
                $query->where('students.nim', 'like', "%{$search}%")
                    ->orWhere('students.name', 'like', "%{$search}%")
                    ->orWhere('courses.code', 'like', "%{$search}%");
            });
        }

        $advanced = [];

        if ($filters['nim'] !== '') {
            $advanced[] = [
                'in',
                'enrollments.student_id',
                Student::query()->where('nim', 'like', $filters['nim'].'%')->select('id'),
            ];
        }

        if ($filters['student_name'] !== '') {
            $advanced[] = [
                'in',
                'enrollments.student_id',
                Student::query()->where('name', 'like', '%'.$filters['student_name'].'%')->select('id'),
            ];
        }

        if ($filters['course_code'] !== '') {
            $advanced[] = [
                'in',
                'enrollments.course_id',
                Courses::query()->where('code', 'like', $filters['course_code'].'%')->select('id'),
            ];
        }

        foreach ([
            ['enrollments.academic_year', $filters['academic_year']],
            ['enrollments.semester', $filters['semester']],
            ['enrollments.status', $filters['status']],
        ] as [$column, $value]) {
            if ($value !== '') {
                $advanced[] = ['like', $column, $value];
            }
        }

        if ($advanced !== []) {
            $method = $filters['filter_logic'] === 'OR' ? 'where' : 'where';
            $query->{$method}(function ($query) use ($advanced, $filters): void {
                foreach ($advanced as $index => [$type, $column, $value]) {
                    $operator = $index === 0 ? 'where' : ($filters['filter_logic'] === 'OR' ? 'orWhere' : 'where');

                    if ($type === 'in') {
                        $query->{$operator.'In'}($column, $value);
                    } else {
                        $query->{$operator}($column, 'like', "%{$value}%");
                    }
                }
            });
        }

        return $query->orderBy($sortColumns[$filters['sort_by']] ?? $sortColumns['id'], $filters['sort_direction']);
    }
}
