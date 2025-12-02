import { InventoryStore } from './common/memoryStore.js';
import { ShopifyService } from './shopify/shopifyService.js';
import { SheetsService } from './googleSheets/sheetsService.js';

const sharedStore = new InventoryStore();
const shopifyService = new ShopifyService(sharedStore);
const sheetsService = new SheetsService(sharedStore);

export const shopify_configure = (config) => shopifyService.configure(config);
export const shopify_list_products = (options) => shopifyService.listProducts(options);
export const shopify_get_product = (id) => shopifyService.getProduct(id);
export const shopify_create_product = (payload) => shopifyService.createProduct(payload);
export const shopify_update_product = (id, updates) => shopifyService.updateProduct(id, updates);
export const shopify_delete_product = (id) => shopifyService.deleteProduct(id);
export const shopify_update_inventory = (payload) => shopifyService.updateInventory(payload);
export const shopify_bulk_sync = (payload) => shopifyService.bulkSync(payload);
export const shopify_get_orders = (options) => shopifyService.getOrders(options);
export const shopify_create_collection = (payload) => shopifyService.createCollection(payload);

export const sheets_configure = (config) => sheetsService.configure(config);
export const sheets_create_spreadsheet = (payload) => sheetsService.createSpreadsheet(payload);
export const sheets_export_inventory = (payload) => sheetsService.exportInventory(payload);
export const sheets_import_inventory = (payload) => sheetsService.importInventory(payload);
export const sheets_update_product = (payload) => sheetsService.updateProduct(payload);
export const sheets_bulk_update = (payload) => sheetsService.bulkUpdate(payload);
export const sheets_create_report = (payload) => sheetsService.createReport(payload);
export const sheets_get_data = (payload) => sheetsService.getData(payload);
export const sheets_append_data = (payload) => sheetsService.appendData(payload);
export const sheets_clear_data = (payload) => sheetsService.clearData(payload);
export const sheets_create_pivot = (payload) => sheetsService.createPivot(payload);
export const sheets_format_sheet = (payload) => sheetsService.formatSheet(payload);

export { InventoryStore, ShopifyService, SheetsService };
