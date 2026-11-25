<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category',
        'subject',
        'body_html',
        'variables_hint',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Replace {{variable}} placeholders in text.
     */
    public static function replaceVariables(string $text, array $vars = []): string
    {
        foreach ($vars as $key => $val) {
            if (is_scalar($val) || is_null($val)) {
                $text = str_replace(['{{' . $key . '}}', '{{ ' . $key . ' }}'], (string) ($val ?? ''), $text);
            }
        }
        return $text;
    }

    /**
     * Ensure all built-in system templates exist in the database so Admin can edit them.
     */
    public static function ensureDefaultsExist(): void
    {
        $defaults = [
            [
                'slug' => 'account_created',
                'name' => 'Welcome / Account Created',
                'category' => 'auth',
                'subject' => 'Welcome to PINTAARA',
                'variables_hint' => 'customer_name, customer_email, action_url',
                'body_html' => '<h2 class="h1-title">Welcome to PINTAARA.</h2>
<p>Dear {{customer_name}},</p>
<p>You can now manage your details, view your orders and access your purchase records in one place.</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VIEW YOUR ACCOUNT</a></div>
<div class="note-box">Your PINTAARA client profile provides lifetime access to your jewelry certificates, HUID verification reports, and private commissions.</div>',
            ],
            [
                'slug' => 'email_verification_otp',
                'name' => 'Email Verification OTP',
                'category' => 'auth',
                'subject' => 'Your PINTAARA verification code',
                'variables_hint' => 'customer_name, otp, expires_minutes',
                'body_html' => '<h2 class="h1-title">Verify your email address.</h2>
<p>Dear {{customer_name}},</p>
<p>Use the verification code below to complete your PINTAARA verification:</p>
<div style="text-align:center; margin: 24px 0;"><span style="display:inline-block; font-size:28px; font-weight:700; letter-spacing:8px; padding:14px 28px; background:#FAF9F5; border:1px solid #EAE6DF; border-radius:6px;">{{otp}}</span></div>
<p>This code expires in {{expires_minutes}} minutes.</p>',
            ],
            [
                'slug' => 'email_verification_link',
                'name' => 'Email Verification Link',
                'category' => 'auth',
                'subject' => 'Verify your PINTAARA email address',
                'variables_hint' => 'customer_name, action_url',
                'body_html' => '<h2 class="h1-title">Verify your email address.</h2>
<p>Dear {{customer_name}},</p>
<p>Please click the button below to verify your email address for your PINTAARA account.</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VERIFY EMAIL</a></div>',
            ],
            [
                'slug' => 'password_reset',
                'name' => 'Password Reset',
                'category' => 'auth',
                'subject' => 'Reset your PINTAARA password',
                'variables_hint' => 'customer_name, action_url, otp',
                'body_html' => '<h2 class="h1-title">Password Reset Request.</h2>
<p>Dear {{customer_name}},</p>
<p>We received a request to reset the password for your PINTAARA account. Use the button or code below to set a new password:</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">RESET PASSWORD</a></div>
<p>If you did not request a password reset, you can safely ignore this email.</p>',
            ],
            [
                'slug' => 'password_changed',
                'name' => 'Password Changed',
                'category' => 'auth',
                'subject' => 'PINTAARA | Password updated',
                'variables_hint' => 'customer_name, customer_email',
                'body_html' => '<h2 class="h1-title">Your password has been updated.</h2>
<p>Dear {{customer_name}},</p>
<p>This is a confirmation that the password for your PINTAARA account ({{customer_email}}) was recently changed.</p>
<div class="note-box">If you did not make this change, please contact our concierge immediately.</div>',
            ],
            [
                'slug' => 'email_address_changed',
                'name' => 'Email Address Changed',
                'category' => 'auth',
                'subject' => 'PINTAARA | Email address updated',
                'variables_hint' => 'customer_name, customer_email',
                'body_html' => '<h2 class="h1-title">Email address updated.</h2>
<p>Dear {{customer_name}},</p>
<p>Your PINTAARA account email address has been updated to {{customer_email}}.</p>',
            ],
            [
                'slug' => 'account_deleted',
                'name' => 'Account Deleted',
                'category' => 'auth',
                'subject' => 'Your PINTAARA account has been closed',
                'variables_hint' => 'customer_name, customer_email',
                'body_html' => '<h2 class="h1-title">Account closed.</h2>
<p>Dear {{customer_name}},</p>
<p>Your PINTAARA account ({{customer_email}}) has been closed as requested. Thank you for being with us.</p>',
            ],
            [
                'slug' => 'order_confirmation',
                'name' => 'Order Confirmation',
                'category' => 'orders',
                'subject' => 'PINTAARA | Order {{order_number}} confirmed',
                'variables_hint' => 'customer_name, order_number, total_amount, action_url',
                'body_html' => '<h2 class="h1-title">Thank you for your order.</h2>
<p>Dear {{customer_name}},</p>
<p>Your PINTAARA order <strong>#{{order_number}}</strong> for <strong>{{total_amount}}</strong> has been confirmed and is entering our production workflow.</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VIEW ORDER DETAILS</a></div>',
            ],
            [
                'slug' => 'manufacturing_initiated',
                'name' => 'Manufacturing Initiated',
                'category' => 'orders',
                'subject' => 'PINTAARA | Manufacturing initiated for Order {{order_number}}',
                'variables_hint' => 'customer_name, order_number, action_url',
                'body_html' => '<h2 class="h1-title">Craftsmanship has begun.</h2>
<p>Dear {{customer_name}},</p>
<p>Master artisans at PINTAARA have begun crafting your piece(s) for order <strong>#{{order_number}}</strong>.</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">TRACK YOUR ORDER</a></div>',
            ],
            [
                'slug' => 'order_dispatched',
                'name' => 'Order Dispatched',
                'category' => 'orders',
                'subject' => 'PINTAARA | Order {{order_number}} dispatched',
                'variables_hint' => 'customer_name, order_number, courier_name, tracking_number, estimated_delivery, action_url',
                'body_html' => '<h2 class="h1-title">Your order is on its way.</h2>
<p>Dear {{customer_name}},</p>
<p>Order <strong>#{{order_number}}</strong> has been dispatched via <strong>{{courier_name}}</strong>.</p>
<p>Tracking / Docket Number: <strong>{{tracking_number}}</strong><br>Estimated Delivery: {{estimated_delivery}}</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">TRACK SHIPMENT</a></div>',
            ],
            [
                'slug' => 'order_delivered',
                'name' => 'Order Delivered',
                'category' => 'orders',
                'subject' => 'PINTAARA | Order {{order_number}} delivered',
                'variables_hint' => 'customer_name, order_number, action_url',
                'body_html' => '<h2 class="h1-title">Your PINTAARA piece has arrived.</h2>
<p>Dear {{customer_name}},</p>
<p>Order <strong>#{{order_number}}</strong> has been delivered. We hope your piece brings lasting joy.</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VIEW YOUR COLLECTION</a></div>',
            ],
            [
                'slug' => 'order_delay',
                'name' => 'Order Delay Update',
                'category' => 'orders',
                'subject' => 'PINTAARA | Update on Order {{order_number}}',
                'variables_hint' => 'customer_name, order_number, delay_reason, new_estimate, action_url',
                'body_html' => '<h2 class="h1-title">Update regarding your order.</h2>
<p>Dear {{customer_name}},</p>
<p>We wanted to share an update regarding order <strong>#{{order_number}}</strong>. {{delay_reason}}</p>
<p>Updated Estimate: <strong>{{new_estimate}}</strong></p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VIEW ORDER</a></div>',
            ],
            [
                'slug' => 'order_cancelled',
                'name' => 'Order Cancelled',
                'category' => 'orders',
                'subject' => 'PINTAARA | Order {{order_number}} cancelled',
                'variables_hint' => 'customer_name, order_number, cancel_reason, action_url',
                'body_html' => '<h2 class="h1-title">Order cancelled.</h2>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>#{{order_number}}</strong> has been cancelled. {{cancel_reason}}</p>
<div class="btn-container"><a href="{{action_url}}" class="btn-primary">VIEW ACCOUNT</a></div>',
            ],
            [
                'slug' => 'refund_processed',
                'name' => 'Refund Processed',
                'category' => 'orders',
                'subject' => 'PINTAARA | Refund processed for Order {{order_number}}',
                'variables_hint' => 'customer_name, order_number, refund_amount, action_url',
                'body_html' => '<h2 class="h1-title">Refund processed.</h2>
<p>Dear {{customer_name}},</p>
<p>A refund of <strong>{{refund_amount}}</strong> for order <strong>#{{order_number}}</strong> has been processed and will reflect in your original payment method within 5–7 business days.</p>',
            ],
            [
                'slug' => 'appointment_confirmation',
                'name' => 'Appointment Booking Confirmed',
                'category' => 'custom',
                'subject' => 'PINTAARA | Appointment Confirmed for {{appointment_date}}',
                'variables_hint' => 'customer_name, appointment_date, appointment_time, appointment_purpose, action_url',
                'body_html' => '<h2 class="h1-title">Your studio appointment is confirmed.</h2>
<p>Dear {{customer_name}},</p>
<p>We look forward to welcoming you to our Vadodara studio.</p>
<div class="note-box"><strong>Date:</strong> {{appointment_date}}<br><strong>Time:</strong> {{appointment_time}}<br><strong>Purpose:</strong> {{appointment_purpose}}</div>
<p>Studio Address: Shop 1, GF, Suvarnraj Complex, Shamal Bechar Pole, Mandvi, M.G. Road, Vadodara, GJ - 390001.</p>',
            ],
            [
                'slug' => 'appointment_updated',
                'name' => 'Appointment Time / Status Updated',
                'category' => 'custom',
                'subject' => 'PINTAARA | Your Appointment Has Been Updated ({{appointment_date}})',
                'variables_hint' => 'customer_name, appointment_date, appointment_time, appointment_status, appointment_purpose, admin_note, action_url',
                'body_html' => '<h2 class="h1-title">Your studio appointment has been updated.</h2>
<p>Dear {{customer_name}},</p>
<p>Your appointment details have been updated by our team:</p>
<div class="note-box"><strong>Date:</strong> {{appointment_date}}<br><strong>Time:</strong> {{appointment_time}}<br><strong>Status:</strong> {{appointment_status}}<br><strong>Purpose:</strong> {{appointment_purpose}}<br>{{admin_note}}</div>
<p>If you need any further adjustments, please reply to this email or contact our studio.</p>',
            ],
        ];

        foreach ($defaults as $item) {
            self::firstOrCreate(
                ['slug' => $item['slug']],
                array_merge($item, ['is_system' => true, 'is_active' => true])
            );
        }
    }
}
