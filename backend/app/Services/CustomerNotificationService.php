<?php

namespace App\Services;

use App\Mail\AccountCreatedMail;
use App\Mail\AccountDeletedMail;
use App\Mail\EmailAddressChangedMail;
use App\Mail\EmailVerificationLinkMail;
use App\Mail\EmailVerificationOtpMail;
use App\Mail\ManufacturingInitiatedMail;
use App\Mail\OrderCancelledMail;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderDelayMail;
use App\Mail\OrderDeliveredMail;
use App\Mail\OrderDispatchedMail;
use App\Mail\PasswordChangedMail;
use App\Mail\PasswordResetMail;
use App\Mail\RefundProcessedMail;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CustomerNotificationService
{
    /* =========================================================================
     | SECTION A: ORDER & DELIVERY NOTIFICATIONS
     | ========================================================================= */

    /**
     * A-1: Send Order Confirmation Email.
     */
    public static function sendOrderConfirmation(Order $order, string $currency = '₹', array $addressLines = []): bool
    {
        $recipient = $order->customer_email;
        if (empty($recipient)) {
            Log::warning("[CustomerNotificationService] Order #{$order->order_number} has no customer_email.");
            return false;
        }

        try {
            Mail::to($recipient)->send(new OrderConfirmationMail($order, $currency, $addressLines));
            self::logDispatch('order_confirmation_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send OrderConfirmationMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-2: Send Manufacturing Initiated Email.
     */
    public static function sendManufacturingInitiated(Order $order): bool
    {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new ManufacturingInitiatedMail($order));
            self::logDispatch('manufacturing_initiated_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send ManufacturingInitiatedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-3: Send Order Dispatched Email.
     */
    public static function sendOrderDispatched(
        Order $order,
        ?string $courierName = null,
        ?string $trackingNumber = null,
        ?string $estimatedDelivery = null
    ): bool {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new OrderDispatchedMail($order, $courierName, $trackingNumber, $estimatedDelivery));
            self::logDispatch('order_dispatched_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'courier' => $courierName ?: $order->courier_partner,
                'tracking' => $trackingNumber ?: $order->docket_number,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send OrderDispatchedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-4: Send Order Delivered Email.
     */
    public static function sendOrderDelivered(Order $order, ?string $viewOrderUrl = null): bool
    {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new OrderDeliveredMail($order, $viewOrderUrl));
            self::logDispatch('order_delivered_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send OrderDeliveredMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-5: Send Order Cancellation Confirmed Email.
     */
    public static function sendOrderCancelled(Order $order): bool
    {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new OrderCancelledMail($order));
            self::logDispatch('order_cancelled_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send OrderCancelledMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-6: Send Refund Processed Email.
     */
    public static function sendRefundProcessed(
        Order $order,
        ?string $refundAmount = null,
        ?string $refundReference = null,
        ?string $refundDate = null,
        string $currency = '₹'
    ): bool {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new RefundProcessedMail($order, $refundAmount, $refundReference, $refundDate, $currency));
            self::logDispatch('refund_processed_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'amount' => $refundAmount ?: $order->total_amount,
                'reference' => $refundReference,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send RefundProcessedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * A-7: Send Manufacturing or Delivery Delay Email.
     */
    public static function sendOrderDelay(
        Order $order,
        ?string $delayReason = null,
        ?string $revisedCompletionDate = null
    ): bool {
        $recipient = $order->customer_email;
        if (empty($recipient)) return false;

        try {
            Mail::to($recipient)->send(new OrderDelayMail($order, $delayReason, $revisedCompletionDate));
            self::logDispatch('order_delay_sent', $order->id, 'Order', [
                'order_number' => $order->order_number,
                'reason' => $delayReason,
                'revised_date' => $revisedCompletionDate,
                'recipient' => $recipient,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send OrderDelayMail: " . $e->getMessage());
            return false;
        }
    }

    /* =========================================================================
     | SECTION B: ACCOUNT & SECURITY NOTIFICATIONS
     | ========================================================================= */

    /**
     * B-1: Send Email Verification Link.
     */
    public static function sendEmailVerificationLink(string $email, string $verificationUrl, int $expiryMinutes = 60): bool
    {
        try {
            Mail::to($email)->send(new EmailVerificationLinkMail($verificationUrl, $expiryMinutes));
            self::logDispatch('verification_link_sent', null, 'User', ['email' => $email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send EmailVerificationLinkMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-2: Send Email Verification Code / OTP.
     */
    public static function sendEmailVerificationOtp(string $email, string $code, int $expiryMinutes = 10): bool
    {
        try {
            Mail::to($email)->send(new EmailVerificationOtpMail($code, $expiryMinutes));
            self::logDispatch('verification_otp_sent', null, 'User', ['email' => $email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send EmailVerificationOtpMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-3: Send Password Reset Link / Code.
     */
    public static function sendPasswordReset(string $email, string $resetUrl, ?string $resetCode = null, int $expiryMinutes = 60): bool
    {
        try {
            Mail::to($email)->send(new PasswordResetMail($resetUrl, $resetCode, $expiryMinutes));
            self::logDispatch('password_reset_sent', null, 'User', ['email' => $email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send PasswordResetMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-4: Send Password Changed Notification.
     */
    public static function sendPasswordChanged(User $user, ?string $secureAccountUrl = null): bool
    {
        try {
            Mail::to($user->email)->send(new PasswordChangedMail($user, $secureAccountUrl));
            self::logDispatch('password_changed_notification_sent', $user->id, 'User', ['email' => $user->email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send PasswordChangedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-5: Send Email Address Changed Notification.
     */
    public static function sendEmailAddressChanged(string $targetEmail, string $newEmailAddress, ?User $user = null): bool
    {
        try {
            Mail::to($targetEmail)->send(new EmailAddressChangedMail($newEmailAddress, $user));
            self::logDispatch('email_changed_notification_sent', $user?->id, 'User', [
                'target_email' => $targetEmail,
                'new_email' => $newEmailAddress,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send EmailAddressChangedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-6: Send Account Created (Welcome) Email.
     */
    public static function sendAccountCreated(User $user, ?string $viewAccountUrl = null): bool
    {
        try {
            Mail::to($user->email)->send(new AccountCreatedMail($user, $viewAccountUrl));
            self::logDispatch('welcome_account_created_sent', $user->id, 'User', ['email' => $user->email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send AccountCreatedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * B-7: Send Account Deletion Confirmed Email.
     */
    public static function sendAccountDeleted(string $email, string $name = 'Client'): bool
    {
        try {
            Mail::to($email)->send(new AccountDeletedMail($email, $name));
            self::logDispatch('account_deleted_confirmation_sent', null, 'User', ['email' => $email]);
            return true;
        } catch (\Throwable $e) {
            Log::error("[CustomerNotificationService] Failed to send AccountDeletedMail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper to log dispatching into AuditLog if model exists.
     */
    protected static function logDispatch(string $action, ?int $entityId, ?string $entityType, array $payload = []): void
    {
        try {
            if (class_exists(AuditLog::class)) {
                AuditLog::log($action, $entityType, $entityId, null, $payload);
            }
        } catch (\Throwable $e) {
            // Silently ignore audit log issues
        }
    }
}
