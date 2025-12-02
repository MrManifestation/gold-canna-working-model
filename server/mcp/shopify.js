/**
 * Lightweight helpers for interacting with Shopify's Admin GraphQL API.
 * These utilities focus on webhook subscriptions and app subscription feeds
 * to keep the MCP server examples concise while remaining production-ready.
 */

const SHOPIFY_DEFAULT_API_VERSION = "2025-04";

function assertConfig(config) {
  const missing = ["shopDomain", "accessToken"].filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Missing Shopify config values: ${missing.join(", ")}`);
  }
}

function buildGraphQLClient({ shopDomain, accessToken, apiVersion = SHOPIFY_DEFAULT_API_VERSION }) {
  assertConfig({ shopDomain, accessToken });
  const endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;

  return async function graphqlRequest(query, variables = {}) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Shopify GraphQL error (${response.status}): ${message}`);
    }

    const payload = await response.json();
    if (payload.errors) {
      throw new Error(`Shopify GraphQL returned errors: ${JSON.stringify(payload.errors)}`);
    }

    return payload.data;
  };
}

export function createShopifyClient(config) {
  const graphql = buildGraphQLClient(config);

  return {
    /**
     * List webhook subscriptions for the shop.
     */
    async listWebhookSubscriptions({ limit = 50 } = {}) {
      const query = `
        query webhookSubscriptions($first: Int!) {
          webhookSubscriptions(first: $first) {
            edges {
              node {
                id
                topic
                format
                callbackUrl
                createdAt
              }
            }
          }
        }
      `;

      const data = await graphql(query, { first: Math.min(limit, 250) });
      return data.webhookSubscriptions.edges.map((edge) => edge.node);
    },

    /**
     * Register a webhook subscription using the Admin GraphQL API.
     */
    async registerWebhookSubscription({ topic, callbackUrl, format = "JSON" }) {
      if (!topic || !callbackUrl) {
        throw new Error("Both topic and callbackUrl are required to register a webhook.");
      }

      const mutation = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!, $format: WebhookSubscriptionFormat!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: { callbackUrl: $callbackUrl, format: $format }) {
            userErrors { field message }
            webhookSubscription { id topic format callbackUrl createdAt }
          }
        }
      `;

      const data = await graphql(mutation, { topic, callbackUrl, format });
      const result = data.webhookSubscriptionCreate;
      if (result.userErrors?.length) {
        throw new Error(`Webhook subscription error: ${JSON.stringify(result.userErrors)}`);
      }

      return result.webhookSubscription;
    },

    /**
     * Remove an existing webhook subscription.
     */
    async deleteWebhookSubscription(id) {
      if (!id) throw new Error("Webhook subscription id is required.");

      const mutation = `
        mutation webhookSubscriptionDelete($id: ID!) {
          webhookSubscriptionDelete(id: $id) {
            userErrors { field message }
            deletedWebhookSubscriptionId
          }
        }
      `;

      const data = await graphql(mutation, { id });
      const result = data.webhookSubscriptionDelete;
      if (result.userErrors?.length) {
        throw new Error(`Delete webhook error: ${JSON.stringify(result.userErrors)}`);
      }

      return result.deletedWebhookSubscriptionId;
    },

    /**
     * Retrieve a feed of app subscription contracts for billing visibility.
     */
    async getAppSubscriptionsFeed({ limit = 25 } = {}) {
      const query = `
        query appSubscriptions($first: Int!) {
          appSubscriptions(first: $first) {
            edges {
              node {
                id
                name
                status
                test
                trialDays
                createdAt
                currentPeriodEnd
                lineItems {
                  plan {
                    pricingDetails {
                      __typename
                      ... on AppSubscriptionPlanFixedPricing {
                        price {
                          amount
                          currencyCode
                        }
                        interval
                      }
                      ... on AppSubscriptionPlanUsagePricing {
                        cappedAmount {
                          amount
                          currencyCode
                        }
                        terms
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const data = await graphql(query, { first: Math.min(limit, 250) });
      return data.appSubscriptions.edges.map((edge) => edge.node);
    },

    /**
     * Create an app subscription contract using GraphQL.
     */
    async createAppSubscription({ name, lineItems, returnUrl, trialDays = 0, test = false }) {
      if (!name || !lineItems?.length || !returnUrl) {
        throw new Error("name, lineItems, and returnUrl are required to create an app subscription.");
      }

      const mutation = `
        mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!, $trialDays: Int, $test: Boolean) {
          appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
            userErrors { field message }
            confirmationUrl
            appSubscription { id name status trialDays test }
          }
        }
      `;

      const variables = { name, returnUrl, lineItems, trialDays, test };
      const data = await graphql(mutation, variables);
      const result = data.appSubscriptionCreate;
      if (result.userErrors?.length) {
        throw new Error(`App subscription error: ${JSON.stringify(result.userErrors)}`);
      }

      return {
        confirmationUrl: result.confirmationUrl,
        subscription: result.appSubscription,
      };
    },
  };
}

/**
 * Example usage for local testing: `node shopify.js`
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Shopify client helpers are ready. Import createShopifyClient in your MCP server.");
}
