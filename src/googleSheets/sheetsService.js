import { requireFields, sanitizeString, clone } from '../common/validation.js';

export class SheetsService {
  constructor(store) {
    this.store = store;
    this.config = null;
  }

  configure(config) {
    requireFields(config, ['credentials', 'spreadsheetId'], 'Sheets configuration');
    this.config = {
      credentials: clone(config.credentials),
      spreadsheetId: sanitizeString(config.spreadsheetId),
      defaultSheet: sanitizeString(config.defaultSheet || 'Inventory'),
    };
    return clone(this.config);
  }

  ensureConfigured() {
    if (!this.config) throw new Error('Google Sheets service not configured. Call sheets_configure first.');
  }

  createSpreadsheet({ title }) {
    this.ensureConfigured();
    const id = `sheet_${Date.now()}`;
    this.config.spreadsheetId = id;
    this.config.defaultSheet = title || this.config.defaultSheet;
    this.store.setSheet(this.config.defaultSheet, [['SKU', 'Title', 'Quantity', 'Price']]);
    return clone({ spreadsheetId: id, title: this.config.defaultSheet });
  }

  exportInventory({ products = [], sheetName, clearExisting = true }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    if (clearExisting) this.store.clearSheet(name);
    const rows = products.map((product) => [product.sku, product.title, product.quantity, product.price]);
    this.store.appendSheet(name, rows);
    return this.store.getSheet(name);
  }

  importInventory({ sheetName }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    const rows = this.store.getSheet(name);
    return rows.map(([sku, title, quantity, price]) => ({ sku, title, quantity: Number(quantity), price: Number(price) }));
  }

  updateProduct(product) {
    this.ensureConfigured();
    requireFields(product, ['sku'], 'Sheets product update');
    const sheet = this.store.getSheet(this.config.defaultSheet);
    const index = sheet.findIndex((row) => row[0] === product.sku);
    if (index === -1) {
      sheet.push([product.sku, product.title, product.quantity, product.price]);
    } else {
      sheet[index] = [product.sku, product.title, product.quantity, product.price];
    }
    this.store.setSheet(this.config.defaultSheet, sheet);
    return this.store.getSheet(this.config.defaultSheet);
  }

  bulkUpdate({ products = [] }) {
    this.ensureConfigured();
    products.forEach((product) => this.updateProduct(product));
    return this.store.getSheet(this.config.defaultSheet);
  }

  createReport({ reportType, data = {} }) {
    this.ensureConfigured();
    if (reportType === 'low_stock') {
      const threshold = Number(data.threshold ?? 5);
      const lowStock = (data.products || []).filter((product) => Number(product.quantity) <= threshold);
      const name = `${this.config.defaultSheet}-low-stock`;
      this.store.setSheet(name, lowStock.map((product) => [product.sku, product.title, product.quantity]));
      return { report: name, rows: this.store.getSheet(name) };
    }

    const name = `${this.config.defaultSheet}-report`;
    this.store.setSheet(name, []);
    return { report: name, rows: [] };
  }

  getData({ sheetName }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    return this.store.getSheet(name);
  }

  appendData({ sheetName, rows = [] }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    return this.store.appendSheet(name, rows);
  }

  clearData({ sheetName }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    return this.store.clearSheet(name);
  }

  createPivot({ sourceSheet, targetSheet }) {
    this.ensureConfigured();
    const source = this.store.getSheet(sourceSheet || this.config.defaultSheet);
    const target = targetSheet || `${sourceSheet}-pivot`;
    this.store.setSheet(target, source);
    return { targetSheet: target, rows: this.store.getSheet(target) };
  }

  formatSheet({ sheetName, header = true }) {
    this.ensureConfigured();
    const name = sanitizeString(sheetName || this.config.defaultSheet);
    const rows = this.store.getSheet(name);
    if (header && rows.length) {
      rows[0] = rows[0].map((value) => sanitizeString(value).toUpperCase());
    }
    this.store.setSheet(name, rows);
    return this.store.getSheet(name);
  }
}
