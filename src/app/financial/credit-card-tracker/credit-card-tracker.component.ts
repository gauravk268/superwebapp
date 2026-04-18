import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';
import { CreditCardStorageService } from '../../services/credit-card-storage.service';
import { NotificationService } from '../../services/notification.service';
import {
  CreditCard,
  CardColor,
  CARD_COLOR_MAP,
  AppReminder,
} from '../../models/credit-card.model';

type View = 'loading' | 'setup' | 'locked' | 'unlocked';

interface CardForm {
  cardName: string;
  billingDay: number;
  paymentDueDay: number;
  color: CardColor;
  notes: string;
}

const BLANK_FORM: CardForm = {
  cardName: '',
  billingDay: 1,
  paymentDueDay: 20,
  color: 'violet',
  notes: '',
};

@Component({
  selector: 'app-credit-card-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-card-tracker.component.html',
  styleUrl: './credit-card-tracker.component.css',
})
export class CreditCardTrackerComponent implements OnInit {
  private cryptoSvc  = inject(CryptoService);
  private storageSvc = inject(CreditCardStorageService);
  notifSvc           = inject(NotificationService);

  // ── View state ─────────────────────────────────────────────────────────
  view       = signal<View>('loading');
  isWorking  = signal(false); // spinner for async ops
  errorMsg   = signal('');

  // ── Password screens ───────────────────────────────────────────────────
  passwordInput   = '';
  confirmPassword = '';
  showPassword    = signal(false);

  // ── Card data ──────────────────────────────────────────────────────────
  cards     = signal<CreditCard[]>([]);
  reminders = computed<AppReminder[]>(() =>
    this.notifSvc.computeReminders(this.cards()),
  );

  // ── Modal ──────────────────────────────────────────────────────────────
  showModal    = signal(false);
  editingId    = signal<string | null>(null);
  form         = signal<CardForm>({ ...BLANK_FORM });
  deleteTarget = signal<CreditCard | null>(null);

  // ── Notification panel ─────────────────────────────────────────────────
  showNotifPanel = signal(false);

  // ── Constants exposed to template ─────────────────────────────────────
  readonly CARD_COLOR_MAP = CARD_COLOR_MAP;
  readonly COLOR_OPTS: CardColor[] = [
    'violet', 'blue', 'emerald', 'rose', 'amber', 'cyan', 'slate',
  ];
  readonly DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    if (this.cryptoSvc.hasMasterPassword()) {
      this.view.set('locked');
    } else {
      this.view.set('setup');
    }
  }

  // ── Password actions ───────────────────────────────────────────────────
  async setupPassword(): Promise<void> {
    if (!this.passwordInput || this.passwordInput.length < 6) {
      this.errorMsg.set('Password must be at least 6 characters.');
      return;
    }
    if (this.passwordInput !== this.confirmPassword) {
      this.errorMsg.set('Passwords do not match.');
      return;
    }
    this.isWorking.set(true);
    try {
      await this.cryptoSvc.setupPassword(this.passwordInput);
      await this.loadCards();
      this.view.set('unlocked');
    } catch (e) {
      this.errorMsg.set('Failed to set up password. Try again.');
    } finally {
      this.isWorking.set(false);
      this.clearPasswordFields();
    }
  }

  async unlock(): Promise<void> {
    if (!this.passwordInput) {
      this.errorMsg.set('Please enter your password.');
      return;
    }
    this.isWorking.set(true);
    try {
      const ok = await this.cryptoSvc.unlock(this.passwordInput);
      if (ok) {
        await this.loadCards();
        this.view.set('unlocked');
        await this.notifSvc.checkAndNotify(this.cards());
        this.errorMsg.set('');
      } else {
        this.errorMsg.set('Incorrect password. Please try again.');
      }
    } catch {
      this.errorMsg.set('An error occurred. Please try again.');
    } finally {
      this.isWorking.set(false);
      this.clearPasswordFields();
    }
  }

  lock(): void {
    this.cryptoSvc.lock();
    this.cards.set([]);
    this.view.set('locked');
    this.showModal.set(false);
  }

  // ── Card CRUD ──────────────────────────────────────────────────────────
  async loadCards(): Promise<void> {
    const list = await this.storageSvc.getCards();
    this.cards.set(list);
  }

  openAddModal(): void {
    this.form.set({ ...BLANK_FORM });
    this.editingId.set(null);
    this.showModal.set(true);
    this.errorMsg.set('');
  }

  openEditModal(card: CreditCard): void {
    this.form.set({
      cardName:     card.cardName,
      billingDay:   card.billingDay,
      paymentDueDay: card.paymentDueDay,
      color:        card.color,
      notes:        card.notes,
    });
    this.editingId.set(card.id);
    this.showModal.set(true);
    this.errorMsg.set('');
  }

  async saveCard(): Promise<void> {
    const f = this.form();
    if (!f.cardName.trim()) {
      this.errorMsg.set('Card name is required.');
      return;
    }
    this.isWorking.set(true);
    try {
      if (this.editingId()) {
        await this.storageSvc.updateCard(this.editingId()!, f);
      } else {
        await this.storageSvc.addCard(f);
      }
      await this.loadCards();
      this.showModal.set(false);
    } catch (e) {
      this.errorMsg.set('Failed to save card. Try again.');
    } finally {
      this.isWorking.set(false);
    }
  }

  confirmDelete(card: CreditCard): void {
    this.deleteTarget.set(card);
  }

  async deleteCard(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;
    this.isWorking.set(true);
    try {
      await this.storageSvc.deleteCard(target.id);
      await this.loadCards();
    } finally {
      this.isWorking.set(false);
      this.deleteTarget.set(null);
    }
  }

  // ── Notifications ──────────────────────────────────────────────────────
  async requestNotifPermission(): Promise<void> {
    await this.notifSvc.requestPermission();
    await this.notifSvc.checkAndNotify(this.cards());
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  setFormField<K extends keyof CardForm>(key: K, value: CardForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
  }

  daysUntilDay(targetDay: number): number {
    const today = new Date().getDate();
    if (targetDay >= today) return targetDay - today;
    return 30 - today + targetDay;
  }

  urgencyClass(daysLeft: number): string {
    if (daysLeft === 0) return 'text-rose-400 font-bold';
    if (daysLeft <= 3)  return 'text-amber-400 font-semibold';
    if (daysLeft <= 7)  return 'text-yellow-400';
    return 'text-emerald-400';
  }

  private clearPasswordFields(): void {
    this.passwordInput   = '';
    this.confirmPassword = '';
  }
}
