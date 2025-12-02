import { strict as assert } from 'node:assert';
import test from 'node:test';
import {
  shopify_configure,
  shopify_create_product,
  shopify_list_products,
  shopify_update_inventory,
  shopify_bulk_sync,
  sheets_configure,
  sheets_export_inventory,
  sheets_import_inventory,
  sheets_create_report,
  sheets_append_data,
  sheets_get_data,
} from '../src/index.js';

test('Shopify service supports creation, listing, and inventory updates', () => {
  shopify_configure({ shopDomain: 'example.myshopify.com', accessToken: 'token' });
  const created = shopify_create_product({ title: 'Product 1', price: 10, sku: 'SKU1', quantity: 5 });
  assert.equal(created.title, 'Product 1');

  const listed = shopify_list_products({ pageSize: 10 });
  assert.equal(listed.total, 1);

  const updated = shopify_update_inventory({ productId: created.id, quantity: 3 });
  assert.equal(updated.quantity, 3);
});

test('Bulk sync deduplicates products by upserting', () => {
  const results = shopify_bulk_sync({
    products: [
      { id: 'prod_a', title: 'A', price: 5 },
      { id: 'prod_a', title: 'A updated', price: 6, quantity: 2 },
    ],
  });

  assert.equal(results.length, 2);
  const { items } = shopify_list_products();
  const product = items.find((item) => item.id === 'prod_a');
  assert.equal(product.title, 'A updated');
  assert.equal(product.price, 6);
  assert.equal(product.quantity, 2);
});

test('Google Sheets service exports and imports inventory rows', () => {
  sheets_configure({ credentials: { client_email: 'service@example.com' }, spreadsheetId: 'sheet_1' });
  const exported = sheets_export_inventory({
    products: [
      { sku: 'SKU1', title: 'Product 1', quantity: 3, price: 10 },
      { sku: 'SKU2', title: 'Product 2', quantity: 1, price: 20 },
    ],
  });

  assert.equal(exported.length, 2);
  const imported = sheets_import_inventory({});
  assert.equal(imported.length, 2);
  assert.equal(imported[0].sku, 'SKU1');
});

test('Google Sheets reports and append operations reuse shared store', () => {
  const report = sheets_create_report({
    reportType: 'low_stock',
    data: { threshold: 2, products: [{ sku: 'SKU1', title: 'Product 1', quantity: 1 }] },
  });
  assert.equal(report.rows.length, 1);

  sheets_append_data({ sheetName: 'Custom', rows: [['x', 'y']] });
  const rows = sheets_get_data({ sheetName: 'Custom' });
  assert.deepEqual(rows, [['x', 'y']]);
});
