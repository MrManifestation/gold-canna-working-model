import { paginate, clone } from './validation.js';

export class InventoryStore {
  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.collections = new Map();
    this.sheets = new Map();
    this.sequence = 1;
  }

  generateId(prefix = 'item') {
    return `${prefix}_${this.sequence++}`;
  }

  upsertProduct(product) {
    const id = product.id || this.generateId('prod');
    const existing = this.products.get(id) || {};
    const normalized = {
      id,
      title: product.title || existing.title || 'Untitled Product',
      price: Number(product.price ?? existing.price ?? 0),
      sku: product.sku || existing.sku || '',
      quantity: Number(product.quantity ?? existing.quantity ?? 0),
      variants: product.variants || existing.variants || [],
      collections: product.collections || existing.collections || [],
      metadata: { ...(existing.metadata || {}), ...(product.metadata || {}) },
    };

    this.products.set(id, normalized);
    return clone(normalized);
  }

  getProduct(id) {
    const product = this.products.get(id);
    return product ? clone(product) : null;
  }

  listProducts(pagination = {}) {
    return paginate([...this.products.values()].map(clone), pagination);
  }

  deleteProduct(id) {
    return this.products.delete(id);
  }

  updateInventory(productId, quantity) {
    const product = this.products.get(productId);
    if (!product) return null;
    const updated = { ...product, quantity: Number(quantity) };
    this.products.set(productId, updated);
    return clone(updated);
  }

  upsertCollection(collection) {
    const id = collection.id || this.generateId('col');
    const normalized = {
      id,
      title: collection.title || 'Untitled Collection',
      products: collection.products || [],
      handle: collection.handle || id,
    };
    this.collections.set(id, normalized);
    return clone(normalized);
  }

  recordOrder(order) {
    const id = order.id || this.generateId('order');
    const normalized = { id, ...order };
    this.orders.set(id, normalized);
    return clone(normalized);
  }

  listOrders(pagination = {}) {
    return paginate([...this.orders.values()].map(clone), pagination);
  }

  setSheet(name, rows = []) {
    this.sheets.set(name, rows.map((row) => [...row]));
    return this.getSheet(name);
  }

  getSheet(name) {
    return this.sheets.has(name) ? this.sheets.get(name).map((row) => [...row]) : [];
  }

  appendSheet(name, rows = []) {
    const sheet = this.getSheet(name);
    sheet.push(...rows.map((row) => [...row]));
    this.sheets.set(name, sheet);
    return this.getSheet(name);
  }

  clearSheet(name) {
    this.sheets.set(name, []);
    return [];
  }
}
