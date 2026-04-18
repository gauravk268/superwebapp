import { Injectable, signal } from '@angular/core';
import { CreditCard, AppReminder } from '../models/credit-card.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** In-app toast/notification queue */
  toasts = signal<{ id: string; type: 'billing' | 'payment'; message: string; cardName: string }[]>([]);

  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  get permission(): NotificationPermission {
    return this.isSupported ? Notification.permission : 'denied';
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  /**
   * Compute upcoming reminders for all cards.
   * - 1 day before billing date  → billing reminder
   * - 3 days before payment due  → payment reminder
   */
  computeReminders(cards: CreditCard[]): AppReminder[] {
    const today = new Date();
    const todayDay = today.getDate();
    const reminders: AppReminder[] = [];

    for (const card of cards) {
      const daysLeftBilling = this.daysUntilNextOccurrence(card.billingDay, todayDay);
      const daysLeftPayment = this.daysUntilNextOccurrence(card.paymentDueDay, todayDay);

      if (daysLeftBilling <= 1) {
        reminders.push({
          cardId: card.id,
          cardName: card.cardName,
          type: 'billing',
          daysLeft: daysLeftBilling,
          dueDay: card.billingDay,
          message: daysLeftBilling === 0
            ? `💳 ${card.cardName} bill is generated TODAY (day ${card.billingDay})`
            : `💳 ${card.cardName} bill generates TOMORROW (day ${card.billingDay})`,
        });
      }

      if (daysLeftPayment <= 3) {
        const label = daysLeftPayment === 0
          ? 'TODAY'
          : daysLeftPayment === 1
          ? 'TOMORROW'
          : `in ${daysLeftPayment} days`;

        reminders.push({
          cardId: card.id,
          cardName: card.cardName,
          type: 'payment',
          daysLeft: daysLeftPayment,
          dueDay: card.paymentDueDay,
          message: `⚠️ ${card.cardName} payment due ${label} (day ${card.paymentDueDay})`,
        });
      }
    }

    return reminders;
  }

  /**
   * Fire browser notifications for imminent reminders and push in-app toasts.
   */
  async checkAndNotify(cards: CreditCard[]): Promise<void> {
    const reminders = this.computeReminders(cards);
    for (const r of reminders) {
      this.addToast(r);
      if (this.isSupported && Notification.permission === 'granted') {
        new Notification(r.type === 'billing' ? '💳 Bill Reminder – SuperApp' : '⚠️ Payment Due – SuperApp', {
          body: r.message,
          icon: '/favicon.ico',
          tag: `${r.cardId}-${r.type}`, // dedup same notification
        });
      }
    }
  }

  dismissToast(id: string): void {
    this.toasts.update((t) => t.filter((n) => n.id !== id));
  }

  // ── private ────────────────────────────────────────────────────────────

  private addToast(r: AppReminder): void {
    const id = `${r.cardId}-${r.type}`;
    this.toasts.update((t) => {
      if (t.find((n) => n.id === id)) return t; // already exists
      return [{ id, type: r.type, message: r.message, cardName: r.cardName }, ...t];
    });
  }

  /**
   * Days from today's day-of-month until the next occurrence of targetDay.
   * Treats every month as 30 days for simplicity.
   */
  private daysUntilNextOccurrence(targetDay: number, todayDay: number): number {
    if (targetDay >= todayDay) return targetDay - todayDay;
    return 30 - todayDay + targetDay; // wraps to next month
  }
}
