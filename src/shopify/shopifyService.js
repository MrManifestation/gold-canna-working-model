import { requireFields, paginate, sanitizeString, clone } from '../common/validation.js';

export class ShopifyService {
  constructor(store) {
    this.store = store;
    this.config = null;
  }

  configure(config) {
    requireFields(config, ['shopDomain', 'accessToken'], 'Shopify configuration');
    this.config = {
      shopDomain: sanitizeString(config.shopDomain),
      accessToken: sanitizeString(config.accessToken),
      apiVersion: sanitizeString(config.apiVersion || '2025-04'),
    };
    return clone(this.config);
  }

  ensureConfigured() {
    if (!this.config) {
      throw new Error('Shopify service not configured. Call shopify_configure first.');
    }
  }

  listProducts(options = {}) {
    this.ensureConfigured();
    return paginate(this.store.listProducts().items, options);
  }

  getProduct(id) {
    this.ensureConfigured();
    const product = this.store.getProduct(id);
    if (!product) throw new Error(`Product ${id} not found`);
    return product;
  }

  createProduct(payload) {
    this.ensureConfigured();
    requireFields(payload, ['title', 'price'], 'Create product payload');
    return this.store.upsertProduct({ ...payload, id: payload.id });
  }

  updateProduct(id, updates) {
    this.ensureConfigured();
    const product = this.getProduct(id);
    return this.store.upsertProduct({ ...product, ...updates, id });
  }

  deleteProduct(id) {
    this.ensureConfigured();
    const deleted = this.store.deleteProduct(id);
    if (!deleted) throw new Error(`Product ${id} not found`);
    return true;
  }

  updateInventory({ productId, quantity }) {
    this.ensureConfigured();
    requireFields({ productId, quantity }, ['productId', 'quantity'], 'Inventory update');
    const product = this.store.updateInventory(productId, quantity);
    if (!product) throw new Error(`Product ${productId} not found`);
    return product;
  }

  bulkSync({ products = [], syncMode = 'upsert' }) {
    this.ensureConfigured();
    if (!Array.isArray(products)) throw new Error('Products must be an array');

    const results = products.map((product) => {
      if (syncMode === 'delete') {
        this.store.deleteProduct(product.id);
        return null;
      }
      return this.store.upsertProduct(product);
    });

    return results.filter(Boolean);
  }

  getOrders(options = {}) {
    this.ensureConfigured();
    return paginate(this.store.listOrders().items, options);
  }

  createCollection(payload) {
    this.ensureConfigured();
    requireFields(payload, ['title'], 'Collection payload');
    return this.store.upsertCollection(payload);
  }
}
