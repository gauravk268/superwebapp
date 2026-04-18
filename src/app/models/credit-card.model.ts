export type CardColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'slate' | 'cyan';

export interface CreditCard {
  id: string;
  cardName: string;       // e.g. "HDFC Regalia"
  billingDay: number;     // day-of-month bill is generated (1–31)
  paymentDueDay: number;  // day-of-month payment is due (1–31)
  color: CardColor;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppReminder {
  cardId: string;
  cardName: string;
  type: 'billing' | 'payment';
  daysLeft: number;
  dueDay: number;
  message: string;
}

export const CARD_COLOR_MAP: Record<CardColor, { gradient: string; text: string; glow: string }> = {
  violet:  { gradient: 'from-violet-600 to-purple-700',  text: 'text-violet-200',  glow: 'shadow-violet-500/30' },
  blue:    { gradient: 'from-blue-600 to-indigo-700',    text: 'text-blue-200',    glow: 'shadow-blue-500/30' },
  emerald: { gradient: 'from-emerald-600 to-teal-700',   text: 'text-emerald-200', glow: 'shadow-emerald-500/30' },
  rose:    { gradient: 'from-rose-600 to-pink-700',      text: 'text-rose-200',    glow: 'shadow-rose-500/30' },
  amber:   { gradient: 'from-amber-500 to-orange-600',   text: 'text-amber-200',   glow: 'shadow-amber-500/30' },
  slate:   { gradient: 'from-slate-600 to-slate-800',    text: 'text-slate-300',   glow: 'shadow-slate-500/20' },
  cyan:    { gradient: 'from-cyan-600 to-sky-700',       text: 'text-cyan-200',    glow: 'shadow-cyan-500/30' },
};
