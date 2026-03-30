<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WinController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;

// Public auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);
Route::get('public/companies', [CompanyController::class, 'publicIndex']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('user',    [AuthController::class, 'user']);
    Route::match(['put', 'post'], 'user/profile', [AuthController::class, 'updateProfile']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('users', [UserController::class, 'index']);

    // Membership management
    Route::get('pending-memberships', [AuthController::class, 'getPendingMemberships']);
    Route::put('memberships/{user}/respond', [AuthController::class, 'respondToMembership']);
    Route::put('memberships/respond-bulk', [AuthController::class, 'bulkRespondToMemberships']);

    Route::get('admin/overview', [AdminController::class, 'overview']);
    Route::get('admin/notification-channels', [AdminController::class, 'notificationChannels']);
    Route::get('admin/notification-deliveries', [AdminController::class, 'notificationDeliveries']);
    Route::put('admin/notification-channels', [AdminController::class, 'updateNotificationChannels']);
    Route::post('admin/notification-channels/test-smtp', [AdminController::class, 'testSmtpConnection']);
    Route::post('admin/notification-channels/test-arkesel', [AdminController::class, 'testArkeselConnection']);
    Route::get('admin/users', [AdminController::class, 'users']);
    Route::post('admin/users', [AdminController::class, 'storeUser']);
    Route::get('admin/users/{user}', [AdminController::class, 'showUser']);
    Route::put('admin/users/{user}', [AdminController::class, 'updateUser']);
    Route::put('admin/users/{user}/role', [AdminController::class, 'updateUserRole']);
    Route::delete('admin/users/{user}', [AdminController::class, 'deleteUser']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);

    // Reports
    Route::apiResource('reports', ReportController::class);
    Route::put('reports/{report}/status', [ReportController::class, 'updateStatus']);

    // Wins
    Route::apiResource('wins', WinController::class);

    // Companies
    Route::apiResource('companies', CompanyController::class);

    // Teams
    Route::apiResource('teams', TeamController::class);

    // Notifications
    Route::put('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::apiResource('notifications', NotificationController::class);
});

