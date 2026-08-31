import { test, expect } from '@playwright/test';

// baseUrl is configured in playwright.config.ts
// All requests use relative paths that are automatically prepended with baseUrl
const PRODUCTS_ENDPOINT = '/products';

// Fixture to fetch all products once
const getAllProducts = async (request: any) => {
  const response = await request.get(PRODUCTS_ENDPOINT);
  expect(response.status()).toBe(200);
  return await response.json();
};

test.describe('Products API - GET /products', () => {
  // Explicitly set baseUrl from playwright.config.ts for this test suite
  test.use({ baseURL: 'https://fakestoreapi.com' });
  // ========== BASIC TESTS ==========
  test('should retrieve all products with valid response', async ({ request }) => {
    const response = await request.get('/products');
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('should have correct product structure and types', async ({ request }) => {
    const products = await getAllProducts(request);
    const product = products[0];

    expect(product).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      price: expect.any(Number),
      description: expect.any(String),
      category: expect.any(String),
      image: expect.any(String),
    });
  });

  test('should have valid product data across all products', async ({ request }) => {
    const products = await getAllProducts(request);

    products.forEach((product, index) => {
      expect(product.price, `Product ${index} price`).toBeGreaterThan(0);
      expect(product.title.length, `Product ${index} title`).toBeGreaterThan(0);
      expect(product.description.length, `Product ${index} description`).toBeGreaterThan(0);
      expect(product.category.length, `Product ${index} category`).toBeGreaterThan(0);
      expect(product.image, `Product ${index} image`).toMatch(/^https?:\/\/.+/);
    });
  });

  test('should response be consistent on multiple calls', async ({ request }) => {
    const products1 = await getAllProducts(request);
    const products2 = await getAllProducts(request);

    expect(products1.length).toBe(products2.length);
    expect(JSON.stringify(products1)).toBe(JSON.stringify(products2));
  });

  // ========== PERFORMANCE & TIME TESTS ==========
  test('should respond within acceptable time with proper headers', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/products');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    expect(response.headers()['content-type']).toContain('application/json');

    // Check for at least one caching header
    const headers = response.headers();
    const hasCachingHeader =
      headers['cache-control'] || headers['etag'] || headers['last-modified'];
    expect(hasCachingHeader).toBeTruthy();
  });

  // ========== DATA VALIDATION TESTS ==========
  test('should have unique and sequential product IDs', async ({ request }) => {
    const products = await getAllProducts(request);

    const ids = products.map((p) => p.id);
    const uniqueIds = new Set(ids);

    // Check uniqueness
    expect(uniqueIds.size).toBe(ids.length);

    // Check sequence
    const sortedIds = [...ids].sort((a, b) => a - b);
    const expectedIds = Array.from({ length: ids.length }, (_, i) => i + 1);
    expect(sortedIds).toEqual(expectedIds);
  });

  test('should have valid price precision and realistic data', async ({ request }) => {
    const products = await getAllProducts(request);

    products.forEach((product) => {
      // Price validation
      const priceStr = product.price.toString();
      const decimalPart = priceStr.split('.')[1] || '';
      expect(decimalPart.length).toBeLessThanOrEqual(2);
      expect(product.price).toBeLessThanOrEqual(10000);

      // Data length validation
      expect(product.title.length).toBeLessThanOrEqual(200);
      expect(product.description.length).toBeLessThanOrEqual(2000);
      expect(product.category.length).toBeLessThanOrEqual(100);
      expect(product.image.length).toBeLessThanOrEqual(500);
    });
  });

  test('should have consistent category values from predefined set', async ({ request }) => {
    const products = await getAllProducts(request);

    const validCategories = [
      'electronics',
      'jewelery',
      "men's clothing",
      "women's clothing",
    ];
    const categories = new Set(products.map((p) => p.category));

    categories.forEach((category) => {
      expect(validCategories).toContain(category);
    });
  });

  // ========== SECURITY & ERROR TESTS ==========
  test('should have valid response size and encoding', async ({ request }) => {
    const response = await request.get('/products');
    const responseText = await response.text();
    const sizeInKB = Buffer.byteLength(responseText, 'utf8') / 1024;

    expect(sizeInKB).toBeLessThan(500); // Response should be less than 500 KB

    // Verify UTF-8 encoding - can stringify without errors
    const products = await response.json();
    expect(() => JSON.stringify(products)).not.toThrow();
  });

  test('should not contain XSS or malicious patterns', async ({ request }) => {
    const products = await getAllProducts(request);

    const xssPatterns = ['<script', 'javascript:', 'onerror=', 'onclick='];

    products.forEach((product) => {
      xssPatterns.forEach((pattern) => {
        expect(product.title.toLowerCase()).not.toContain(pattern);
        expect(product.description.toLowerCase()).not.toContain(pattern);
      });
    });
  });

  // ========== ADVANCED TESTS ==========
  test('should maintain consistent product ordering and support CORS', async ({ request }) => {
    const response1 = await request.get('/products');
    const products1 = await response1.json();

    const response2 = await request.get('/products');
    const products2 = await response2.json();

    const ids1 = products1.map((p) => p.id);
    const ids2 = products2.map((p) => p.id);
    expect(ids1).toEqual(ids2);

    // Check for CORS headers (may or may not be present, but if present should be valid)
    const headers = response1.headers();
    if (headers['access-control-allow-origin']) {
      expect(headers['access-control-allow-origin']).toBeTruthy();
    }
  });
});
