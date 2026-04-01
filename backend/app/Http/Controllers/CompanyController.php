<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function publicIndex()
    {
        return response()->json(
            Company::query()
                ->select('id', 'company_name')
                ->orderBy('company_name')
                ->get()
        );
    }

    protected function canView($user)
    {
        return $user && in_array($user->role, ['admin', 'employer', 'manager', 'super_admin']);
    }

    protected function canManage($user)
    {
        return $user && in_array($user->role, ['employer', 'super_admin']);
    }

    public function index(Request $request)
    {
        abort_unless($this->canView($request->user()), 403, 'Forbidden');

        return response()->json(Company::with('teams', 'employees')->get());
    }

    public function store(Request $request)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:companies',
        ]);

        $company = Company::create([
            ...$validated,
            'owner_id' => auth()->id(),
        ]);

        return response()->json($company, 201);
    }

    public function show(Company $company)
    {
        abort_unless($this->canView(request()->user()), 403, 'Forbidden');

        return response()->json($company->load('teams', 'employees', 'owner'));
    }

    public function update(Request $request, Company $company)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        $validated = $request->validate([
            'company_name' => 'string|max:255|unique:companies,company_name,' . $company->id,
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    public function destroy(Company $company)
    {
        abort_unless($this->canManage(request()->user()), 403, 'Forbidden');

        $company->delete();
        return response()->json(['message' => 'Company deleted']);
    }
}
