# MCP Servers for Inventory Management

This directory contains MCP (Model Context Protocol) servers for integrating with external services.

## Available MCP Servers

### Shopify MCP Server

The Shopify MCP server provides comprehensive inventory management integration with Shopify stores.

**Functions:**

- `shopify_configure`: Configure Shopify connection with store credentials
- `shopify_list_products`: List all products from Shopify store with pagination
- `shopify_get_product`: Get detailed information about a specific product
- `shopify_create_product`: Create a new product in Shopify
- `shopify_update_product`: Update an existing product
- `shopify_delete_product`: Delete a product from Shopify
- `shopify_update_inventory`: Update inventory levels for a product variant
- `shopify_bulk_sync`: Bulk sync products from local inventory to Shopify
- `shopify_get_orders`: Retrieve orders from Shopify
- `shopify_create_collection`: Create a product collection in Shopify
- `listWebhookSubscriptions`: List webhook subscriptions via Admin GraphQL
- `registerWebhookSubscription`: Register new webhook subscriptions via GraphQL
- `deleteWebhookSubscription`: Delete webhook subscriptions via GraphQL
- `getAppSubscriptionsFeed`: Retrieve active app subscription feed via GraphQL
- `createAppSubscription`: Create Shopify app subscriptions with confirmation URLs

**Setup:**

Get your Shopify Admin API access token from your Shopify admin panel. Configure the server:

```json
{
  "shopDomain": "your-store.myshopify.com",
  "accessToken": "your-access-token",
  "apiVersion": "2025-04"
}
```

### Google Sheets MCP Server

The Google Sheets MCP server enables inventory data management and reporting through Google Sheets.

**Functions:**

- `sheets_configure`: Configure Google Sheets connection with credentials
- `sheets_create_spreadsheet`: Create a new Google Sheets spreadsheet
- `sheets_export_inventory`: Export inventory data to Google Sheets
- `sheets_import_inventory`: Import inventory data from Google Sheets
- `sheets_update_product`: Update a single product in Google Sheets
- `sheets_bulk_update`: Bulk update multiple products
- `sheets_create_report`: Create inventory reports (low stock, category summary, etc.)
- `sheets_get_data`: Get data from a specific range
- `sheets_append_data`: Append data to the end of a sheet
- `sheets_clear_data`: Clear data from a specific range
- `sheets_create_pivot`: Create a pivot table for inventory analysis
- `sheets_format_sheet`: Apply formatting to inventory sheets

**Setup:**

Create a Google Cloud service account and download credentials JSON. Share your Google Sheet with the service account email. Configure the server:

```json
{
  "credentials": {
    "client_email": "service-account@project.iam.gserviceaccount.com",
    "private_key": "-----BEGIN PRIVATE KEY-----...",
    "project_id": "your-project"
  },
  "spreadsheetId": "your-spreadsheet-id"
}
```

## Running the MCP Servers

Install dependencies:

```bash
cd server/mcp
npm install
```

Run Shopify Server:

```bash
npm run shopify
```

Run Google Sheets Server:

```bash
npm run sheets
```

## Integration with Main Application

The MCP servers integrate with the main inventory management application through the integration settings stored in the database. The main application can:

- Store MCP server configuration in the integration settings
- Use the MCP servers to sync data between local inventory and external services
- Generate reports and export data to Google Sheets
- Keep Shopify products in sync with local inventory

## Example Usage

### Shopify Sync Example

```javascript
import { createShopifyClient } from './server/mcp/shopify.js';

// Set up webhook subscriptions using the GraphQL helpers
const shopify = createShopifyClient({
  shopDomain: 'mystore.myshopify.com',
  accessToken: 'shpat_xxx',
});

// Register a product update webhook
await shopify.registerWebhookSubscription({
  topic: 'PRODUCTS_UPDATE',
  callbackUrl: 'https://example.com/webhooks/shopify/products',
});

// Review webhook subscriptions
const webhookFeed = await shopify.listWebhookSubscriptions();
console.log(webhookFeed);

// Create an app subscription contract
const subscription = await shopify.createAppSubscription({
  name: 'Pro Plan',
  returnUrl: 'https://example.com/billing/complete',
  trialDays: 14,
  lineItems: [
    {
      plan: {
        appRecurringPricingDetails: {
          price: { amount: 29.0, currencyCode: 'USD' },
          interval: 'EVERY_30_DAYS',
        },
      },
    },
  ],
});
console.log(subscription.confirmationUrl);

// Configure Shopify
await mcpClient.call('shopify_configure', {
  shopDomain: 'mystore.myshopify.com',
  accessToken: 'shpat_xxx'
});
// Sync products
await mcpClient.call('shopify_bulk_sync', {
  products: [
    {
      local_id: 1,
      title: 'Product 1',
      price: '29.99',
      sku: 'SKU001',
      quantity: 100
    }
  ],
  sync_mode: 'upsert'
});
```

### Google Sheets Export Example

```javascript
// Configure Google Sheets
await mcpClient.call('sheets_configure', {
  credentials: serviceAccountCredentials,
  spreadsheetId: '1234567890'
});
// Export inventory
await mcpClient.call('sheets_export_inventory', {
  products: inventoryData,
  sheetName: 'Inventory',
  clearExisting: true
});
// Create low stock report
await mcpClient.call('sheets_create_report', {
  reportType: 'low_stock',
  data: {
    products: lowStockProducts
  }
});
```

## Security Notes

- Never commit API keys or credentials to version control
- Store sensitive credentials in environment variables
- Use the integration settings in the main app to securely store MCP configurations
- Rotate API keys regularly
- Limit permissions to only what's necessary

## Troubleshooting

### Shopify Connection Issues

- Ensure your access token has the necessary scopes
- Check that your API version is supported
- Verify your shop domain is correct

### Google Sheets Permission Issues

- Make sure the service account has edit access to the spreadsheet
- Verify the spreadsheet ID is correct
- Check that the Google Sheets API is enabled in your Google Cloud project
