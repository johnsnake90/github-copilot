/**
 * Product payload generator for API tests
 * Provides factory functions to create test product data
 */

/**
 * Generates a random product title
 */
const generateRandomProductTitle = (): string => {
  const adjectives = [
    'Premium',
    'Deluxe',
    'Professional',
    'Luxury',
    'Ultra',
    'Smart',
    'Wireless',
    'Portable',
    'Advanced',
    'Compact',
  ];
  const products = [
    'Headphones',
    'Speaker',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Charger',
    'Cable',
    'Stand',
    'Adapter',
    'Hub',
  ];
  const suffix = [
    'Pro',
    'Max',
    'Plus',
    'Ultra',
    'V2',
    '3D',
    'HD',
    'X',
    '360',
    'Go',
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomProduct = products[Math.floor(Math.random() * products.length)];
  const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];

  return `${randomAdjective} ${randomProduct} ${randomSuffix}`;
};

export interface Product {
  id?: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

/**
 * Creates a valid product payload with default test data
 * @param overrides - Optional fields to override default values
 * @returns Product object with merged values
 */
export const createValidProduct = (overrides?: Partial<Product>): Product => ({
  title: generateRandomProductTitle(),
  price: 99.99,
  description: 'This is a test product description',
  category: 'electronics',
  image: 'https://example.com/image.jpg',
  ...overrides,
});

/**
 * Creates a product with minimal required fields
 */
export const createMinimalProduct = (): Product =>
  createValidProduct({
    title: 'Minimal Product',
    price: 1.0,
    description: 'Minimal description',
  });

/**
 * Creates a product with a specific category
 */
export const createProductByCategory = (category: string): Product =>
  createValidProduct({ category });

/**
 * Creates a product with a specific price
 */
export const createProductByPrice = (price: number): Product =>
  createValidProduct({ price });

/**
 * Creates multiple valid products
 */
export const createValidProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) =>
    createValidProduct({ title: `Test Product ${i + 1}` }),
  );

/**
 * Valid product categories from FakeStore API
 */
export const VALID_CATEGORIES = [
  'electronics',
  'jewelery',
  "men's clothing",
  "women's clothing",
];

/**
 * Sample prices for testing
 */
export const SAMPLE_PRICES = [0.01, 9.99, 99.99, 999.99, 9999.99];

/**
 * Sample image URLs for testing
 */
export const SAMPLE_IMAGE_URLS = [
  'https://example.com/image.jpg',
  'http://example.com/image.png',
  'https://cdn.example.com/path/to/image.webp',
  'https://example.com:8080/image.gif',
];

/**
 * XSS payload for security testing
 */
export const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  'javascript:alert("XSS")',
  '<img src=x onerror="alert(\'XSS\')">',
  '<svg onload="alert(\'XSS\')">',
];

/**
 * Unicode test strings
 */
export const UNICODE_STRINGS = {
  spanish: 'Producto Español',
  chinese: '中文产品',
  russian: 'Русский продукт',
  emoji: '🎉 🚀 ✨',
  mixed: 'Producto Español 中文 Русский',
};
