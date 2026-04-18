import { Injectable, inject } from '@angular/core';
import { CryptoService } from './crypto.service';
import { CreditCard } from '../models/credit-card.model';

@Injectable({ providedIn: 'root' })
export class CreditCardStorageService {
  private crypto = inject(CryptoService);

  private readonly KEY = 'sa_cc_data';

  async getCards(): Promise<CreditCard[]> {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return [];
    return this.crypto.decrypt<CreditCard[]>(raw);
  }

  async saveCards(cards: CreditCard[]): Promise<void> {
    const encrypted = await this.crypto.encrypt(cards);
    localStorage.setItem(this.KEY, encrypted);
  }

  async addCard(card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreditCard> {
    const cards = await this.getCards();
    const newCard: CreditCard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveCards([...cards, newCard]);
    return newCard;
  }

  async updateCard(id: string, updates: Partial<Omit<CreditCard, 'id' | 'createdAt'>>): Promise<void> {
    const cards = await this.getCards();
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Card not found');
    cards[idx] = { ...cards[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.saveCards(cards);
  }

  async deleteCard(id: string): Promise<void> {
    const cards = await this.getCards();
    await this.saveCards(cards.filter((c) => c.id !== id));
  }
}
