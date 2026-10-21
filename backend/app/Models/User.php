<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'email_verified_at',
        'status',
        'is_approved',
        'is_disabled',
        'id_proof_path',
        'admin_notes',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_approved' => 'boolean',
            'is_disabled' => 'boolean',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function designs()
    {
        return $this->hasMany(CustomerDesign::class);
    }

    /**
     * Check if user has administrative privileges.
     */
    public function isAdmin(): bool
    {
        $adminRoles = ['super_admin', 'admin', 'manager', 'operations', 'production', 'finance', 'logistics'];
        return in_array(strtolower($this->role ?? ''), $adminRoles);
    }

    /**
     * Check specific role or list of roles.
     */
    public function hasRole(array|string $roles): bool
    {
        $roleList = is_array($roles) ? $roles : [$roles];
        if (in_array('*', $roleList) || strtolower($this->role ?? '') === 'super_admin') {
            return true;
        }
        return in_array(strtolower($this->role ?? ''), array_map('strtolower', $roleList));
    }

    /**
     * Check permission based on role.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'super_admin') {
            return true;
        }

        $rolePermissions = [
            'admin' => ['*'],
            'manager' => ['products', 'masters', 'gold_rates', 'orders', 'customers', 'appointments', 'reports'],
            'operations' => ['orders', 'customers', 'appointments', 'logistics'],
            'sales' => ['orders', 'customers', 'appointments'],
            'production' => ['orders', 'products', 'masters'],
            'finance' => ['orders', 'payments', 'gold_rates', 'reports'],
            'logistics' => ['orders', 'logistics'],
            'customer' => [],
            'user' => [],
        ];

        $perms = $rolePermissions[strtolower($this->role ?? '')] ?? [];
        return in_array('*', $perms) || in_array($permission, $perms);
    }
}
