import { NextRequest, NextResponse } from 'next/server';

type ServerFunction = {
  name: string;
  description: string;
};

type ServerInfo = {
  id: string;
  name: string;
  description: string;
  functions: ServerFunction[];
};

const servers: ServerInfo[] = [
  {
    id: 'shopify',
    name: 'Shopify MCP Server',
    description: 'Provides Shopify inventory management and synchronization capabilities.',
    functions: [
      { name: 'shopify_configure', description: 'Configure Shopify connection with store credentials.' },
      { name: 'shopify_list_products', description: 'List all products from the Shopify store with pagination.' },
      { name: 'shopify_get_product', description: 'Retrieve detailed information for a specific product.' },
      { name: 'shopify_create_product', description: 'Create a new product in the Shopify store.' },
      { name: 'shopify_update_product', description: 'Update an existing Shopify product.' },
      { name: 'shopify_delete_product', description: 'Delete a product from Shopify.' },
      { name: 'shopify_update_inventory', description: 'Update inventory levels for a product variant.' },
      { name: 'shopify_bulk_sync', description: 'Bulk sync products from local inventory to Shopify.' },
      { name: 'shopify_get_orders', description: 'Retrieve orders from Shopify.' },
      { name: 'shopify_create_collection', description: 'Create a product collection in Shopify.' },
    ],
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets MCP Server',
    description: 'Enables inventory data management and reporting through Google Sheets.',
    functions: [
      { name: 'sheets_configure', description: 'Configure Google Sheets connection with credentials.' },
      { name: 'sheets_create_spreadsheet', description: 'Create a new Google Sheets spreadsheet.' },
      { name: 'sheets_export_inventory', description: 'Export inventory data to Google Sheets.' },
      { name: 'sheets_import_inventory', description: 'Import inventory data from Google Sheets.' },
      { name: 'sheets_update_product', description: 'Update a single product in Google Sheets.' },
      { name: 'sheets_bulk_update', description: 'Bulk update multiple products in a sheet.' },
      { name: 'sheets_create_report', description: 'Create inventory reports such as low stock summaries.' },
      { name: 'sheets_get_data', description: 'Get data from a specific range in a sheet.' },
      { name: 'sheets_append_data', description: 'Append data to the end of a sheet.' },
      { name: 'sheets_clear_data', description: 'Clear data from a specified range.' },
      { name: 'sheets_create_pivot', description: 'Create a pivot table for inventory analysis.' },
      { name: 'sheets_format_sheet', description: 'Apply formatting to inventory sheets.' },
    ],
  },
];

function buildServerSummary(serverList: ServerInfo[]) {
  return serverList.map(({ id, name, description, functions }) => ({
    id,
    name,
    description,
    functions: functions.map(({ name: functionName, description: functionDescription }) => ({
      name: functionName,
      description: functionDescription,
    })),
  }));
}

export function GET(_request: NextRequest): NextResponse {
  const body = {
    status: 'ok',
    servers: buildServerSummary(servers),
  };

  return NextResponse.json(body, { status: 200 });
}

export function HEAD(_request: NextRequest): NextResponse {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
