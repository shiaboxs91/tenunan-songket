import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validateAddress } from "@/components/checkout/AddressForm";
import { ShippingAddress } from "@/lib/types";

/**
 * Feature: tenunan-songket-store, Property 7: Checkout form validation rejects incomplete data
 * Validates: Requirements 6.6
 *
 * For any checkout form submission with missing required fields
 * (fullName, phone, address, city, province, postalCode),
 * validation SHALL fail and prevent progression to the next step.
 */
describe("Property 7: Checkout form validation rejects incomplete data", () => {
  // Generator for valid address
  const validAddressArb = fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    phone: fc.stringOf(fc.constantFrom("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"), {
      minLength: 10,
      maxLength: 15,
    }),
    address: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    city: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    province: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    postalCode: fc.stringOf(fc.constantFrom("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"), {
      minLength: 5,
      maxLength: 5,
    }),
  });

  // Generator for empty/whitespace strings
  const emptyOrWhitespaceArb = fc.constantFrom("", " ", "  ", "\t", "\n");

  it("should reject when fullName is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, fullName: emptyValue };
        const errors = validateAddress(address);
        expect(errors.fullName).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject when phone is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, phone: emptyValue };
        const errors = validateAddress(address);
        expect(errors.phone).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject when address is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, address: emptyValue };
        const errors = validateAddress(address);
        expect(errors.address).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject when city is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, city: emptyValue };
        const errors = validateAddress(address);
        expect(errors.city).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject when province is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, province: emptyValue };
        const errors = validateAddress(address);
        expect(errors.province).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject when postalCode is missing", () => {
    fc.assert(
      fc.property(validAddressArb, emptyOrWhitespaceArb, (validAddress, emptyValue) => {
        const address = { ...validAddress, postalCode: emptyValue };
        const errors = validateAddress(address);
        expect(errors.postalCode).toBeDefined();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject invalid phone format", () => {
    fc.assert(
      fc.property(
        validAddressArb,
        fc.string({ minLength: 1, maxLength: 9 }), // Too short
        (validAddress, invalidPhone) => {
          const address = { ...validAddress, phone: invalidPhone };
          const errors = validateAddress(address);
          // Either missing or invalid format
          expect(errors.phone).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject invalid postalCode format", () => {
    fc.assert(
      fc.property(
        validAddressArb,
        fc.stringOf(fc.constantFrom("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"), {
          minLength: 1,
          maxLength: 4, // Too short
        }),
        (validAddress, invalidPostalCode) => {
          const address = { ...validAddress, postalCode: invalidPostalCode };
          const errors = validateAddress(address);
          expect(errors.postalCode).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should accept valid complete address", () => {
    fc.assert(
      fc.property(validAddressArb, (validAddress) => {
        const errors = validateAddress(validAddress);
        expect(Object.keys(errors).length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should reject completely empty form", () => {
    const emptyAddress: Partial<ShippingAddress> = {};
    const errors = validateAddress(emptyAddress);

    // All fields should have errors
    expect(errors.fullName).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.address).toBeDefined();
    expect(errors.city).toBeDefined();
    expect(errors.province).toBeDefined();
    expect(errors.postalCode).toBeDefined();
    expect(Object.keys(errors).length).toBe(6);
  });

  it("should reject when multiple fields are missing", () => {
    fc.assert(
      fc.property(
        validAddressArb,
        fc.subarray(["fullName", "phone", "address", "city", "province", "postalCode"] as const, {
          minLength: 2,
          maxLength: 5,
        }),
        (validAddress, fieldsToRemove) => {
          const address = { ...validAddress };
          for (const field of fieldsToRemove) {
            (address as Record<string, string>)[field] = "";
          }

          const errors = validateAddress(address);

          // Should have at least as many errors as removed fields
          expect(Object.keys(errors).length).toBeGreaterThanOrEqual(fieldsToRemove.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
