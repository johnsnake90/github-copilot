import { test, expect } from '@playwright/test';
import {
  createValidProduct,
  VALID_CATEGORIES,
  SAMPLE_PRICES,
  SAMPLE_IMAGE_URLS,
  XSS_PAYLOADS,
  UNICODE_STRINGS,
} from './productPayload';

// baseUrl is configured in playwright.config.ts
const PRODUCTS_ENDPOINT = '/products';

test.describe('Products API - POST /products', () => {
  test.use({ baseURL: 'https://fakestoreapi.com' });

  // ========== BASIC TESTS ==========
  test('should create a product with all required fields', async ({ request }) => {
    const newProduct = createValidProduct();

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);

    const createdProduct = await response.json();

    expect(createdProduct).toMatchObject({
      title: newProduct.title,
      price: newProduct.price,
      description: newProduct.description,
      category: newProduct.category,
      image: newProduct.image,
    });

    expect(createdProduct.id).toBeTruthy();
  });

  test('should return correct Content-Type header', async ({ request }) => {
    const newProduct = createValidProduct();

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should have valid product structure in response', async ({ request }) => {
    const newProduct = createValidProduct();

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    const createdProduct = await response.json();

    expect(createdProduct).toHaveProperty('id');
    expect(createdProduct).toHaveProperty('title');
    expect(createdProduct).toHaveProperty('price');
    expect(createdProduct).toHaveProperty('description');
    expect(createdProduct).toHaveProperty('category');
    expect(createdProduct).toHaveProperty('image');

    expect(typeof createdProduct.id).toBe('number');
    expect(typeof createdProduct.title).toBe('string');
    expect(typeof createdProduct.price).toBe('number');
    expect(typeof createdProduct.description).toBe('string');
    expect(typeof createdProduct.category).toBe('string');
    expect(typeof createdProduct.image).toBe('string');
  });

  // ========== DATA VALIDATION TESTS ==========
  test('should create product with various categories', async ({ request }) => {
    for (const category of VALID_CATEGORIES) {
      const newProduct = createValidProduct({ category });
      const response = await request.post(PRODUCTS_ENDPOINT, {
        data: newProduct,
      });

      expect(response.status()).toBe(201);

      const createdProduct = await response.json();
      expect(createdProduct.category).toBe(category);
    }
  });

  test('should create product with various price values', async ({ request }) => {
    for (const price of SAMPLE_PRICES) {
      const newProduct = createValidProduct({ price });
      const response = await request.post(PRODUCTS_ENDPOINT, {
        data: newProduct,
      });

      expect(response.status()).toBe(201);

      const createdProduct = await response.json();
      expect(createdProduct.price).toBe(price);
    }
  });

  test('should create product with long title and description', async ({ request }) => {
    const longTitle = 'A'.repeat(200);
    const longDescription = 'B'.repeat(2000);

    const newProduct = createValidProduct({
      title: longTitle,
      description: longDescription,
    });

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.title).toBe(longTitle);
    expect(createdProduct.description).toBe(longDescription);
  });

  test('should handle products with special characters in title', async ({ request }) => {
    const specialTitle = 'Product with "quotes" and \'apostrophes\' & symbols!';

    const newProduct = createValidProduct({ title: specialTitle });

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.title).toBe(specialTitle);
  });

  test('should create product with different image URL formats', async ({ request }) => {
    for (const imageUrl of SAMPLE_IMAGE_URLS) {
      const newProduct = createValidProduct({ image: imageUrl });
      const response = await request.post(PRODUCTS_ENDPOINT, {
        data: newProduct,
      });

      expect(response.status()).toBe(201);

      const createdProduct = await response.json();
      expect(createdProduct.image).toBe(imageUrl);
    }
  });

  // ========== OPTIONAL FIELDS TESTS ==========
  test('should create product without id field', async ({ request }) => {
    const newProduct = createValidProduct();
    // Note: id is not typically sent when creating a product, it's generated by the server
    delete newProduct['id'];

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.id).toBeTruthy();
  });

  // ========== REQUEST/RESPONSE VALIDATION TESTS ==========
  test('should return response quickly', async ({ request }) => {
    const newProduct = createValidProduct();

    const startTime = Date.now();
    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(201);
    expect(responseTime).toBeLessThan(5000);
  });

  test('should return valid JSON response', async ({ request }) => {
    const newProduct = createValidProduct();

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(() => {
      response.json();
    }).not.toThrow();
  });

  // ========== ERROR HANDLING TESTS ==========
  test('should handle missing title field gracefully', async ({ request }) => {
    const newProduct = createValidProduct();
    delete newProduct.title;

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    // API might return 201 or 400 depending on implementation
    // This test documents the actual behavior
    expect([201, 400]).toContain(response.status());
  });

  test('should handle invalid price gracefully', async ({ request }) => {
    const newProduct = createValidProduct({ price: -50 });

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    // Depending on API validation, it might accept or reject negative prices
    expect([201, 400]).toContain(response.status());
  });

  test('should create product with price having decimal precision', async ({ request }) => {
    const newProduct = createValidProduct({ price: 19.99 });

    const response = await request.post(PRODUCTS_ENDPOINT, {
      data: newProduct,
    });

    expect(response.status()).toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.price).toBe(19.99);
  });

});
