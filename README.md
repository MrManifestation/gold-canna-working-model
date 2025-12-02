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

## Running the MCP Utilities Locally

Install dependencies (Node.js 18+):

```bash
npm install
npm test
```

### Quick Start

```javascript
import {
  shopify_configure,
  shopify_create_product,
  shopify_list_products,
  sheets_configure,
  sheets_export_inventory,
  sheets_import_inventory,
} from './src/index.js';

shopify_configure({ shopDomain: 'example.myshopify.com', accessToken: 'token' });
const created = shopify_create_product({ title: 'Product 1', price: 10, sku: 'SKU1', quantity: 5 });
const inventory = shopify_list_products();

sheets_configure({ credentials: { client_email: 'service@example.com' }, spreadsheetId: 'sheet_1' });
sheets_export_inventory({ products: inventory.items });
const imported = sheets_import_inventory({});
```

These utilities are backed by a shared in-memory store to keep the Shopify and Google Sheets flows aligned during local development and testing.

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
