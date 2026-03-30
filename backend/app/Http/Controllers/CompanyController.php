<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {
        return response()->json(Company::with('teams', 'employees')->get());
    }

    public function store(Request $request)
    {
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
        return response()->json($company->load('teams', 'employees', 'owner'));
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'company_name' => 'string|max:255|unique:companies,company_name,' . $company->id,
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    public function destroy(Company $company)
    {
        $company->delete();
        return response()->json(['message' => 'Company deleted']);
    }
}
