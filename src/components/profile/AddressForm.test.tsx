/**
 * Unit tests for AddressForm validation and error handling
 * Feature: address-management-enhancement
 * Task 6: Form validation and error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddressForm } from "./AddressForm";
import { CountryProvider } from "@/contexts/CountryContext";
import * as addressesModule from "@/lib/supabase/addresses";

// Mock the addresses module
vi.mock("@/lib/supabase/addresses", () => ({
  createAddress: vi.fn(),
  updateAddress: vi.fn(),
}));

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<CountryProvider>{ui}</CountryProvider>);
};

describe("AddressForm - Validation and Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Real-time validation", () => {
    it("should validate phone number on blur", async () => {
      renderWithProviders(<AddressForm />);

      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);

      // Enter invalid phone number
      fireEvent.change(phoneInput, { target: { value: "invalid" } });
      fireEvent.blur(phoneInput);

      // Error should appear
      await waitFor(() => {
        expect(
          screen.getByText(/Phone number must be in format/i),
        ).toBeInTheDocument();
      });
    });

    it("should validate postal code on blur", async () => {
      renderWithProviders(<AddressForm />);

      const postalInput = screen.getByLabelText(/Poskod/i);

      // Enter invalid postal code
      fireEvent.change(postalInput, { target: { value: "123" } });
      fireEvent.blur(postalInput);

      // Error should appear
      await waitFor(() => {
        expect(
          screen.getByText(/Postal code must be in format/i),
        ).toBeInTheDocument();
      });
    });

    it("should validate on input change after field is touched", async () => {
      renderWithProviders(<AddressForm />);

      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);

      // Touch the field first
      fireEvent.blur(phoneInput);

      // Now type invalid value
      fireEvent.change(phoneInput, { target: { value: "abc" } });

      // Error should appear after debounce (300ms)
      await waitFor(
        () => {
          expect(
            screen.getByText(/Phone number must be in format/i),
          ).toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });
  });

  describe("Error message display - Requirement 12.1", () => {
    it("should display error messages below relevant fields", async () => {
      renderWithProviders(<AddressForm />);

      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);

      // Enter invalid phone
      fireEvent.change(phoneInput, { target: { value: "invalid" } });
      fireEvent.blur(phoneInput);

      // Error should appear below the field
      await waitFor(() => {
        const errorText = screen.getByText(/Phone number must be in format/i);
        expect(errorText).toBeInTheDocument();
        expect(errorText).toHaveClass("text-[#DC2626]");
      });
    });
  });

  describe("Form submission blocking - Requirements 1.4, 2.5, 11.3", () => {
    it("should prevent submission when validation errors exist", async () => {
      const mockOnSuccess = vi.fn();
      vi.mocked(addressesModule.createAddress).mockResolvedValue({} as any);

      renderWithProviders(<AddressForm onSuccess={mockOnSuccess} />);

      // Fill form with invalid data
      fireEvent.change(screen.getByLabelText(/Recipient Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Nombor Telefon/i), {
        target: { value: "invalid" },
      });
      fireEvent.change(screen.getByLabelText(/Address Line 1/i), {
        target: { value: "123 Main St" },
      });
      fireEvent.change(screen.getByLabelText(/Bandar/i), {
        target: { value: "BSB" },
      });
      fireEvent.change(screen.getByLabelText(/Daerah\/Mukim/i), {
        target: { value: "BM" },
      });
      fireEvent.change(screen.getByLabelText(/Poskod/i), {
        target: { value: "123" },
      });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /Add Address/i });
      fireEvent.click(submitButton);

      // Should not call createAddress
      await waitFor(() => {
        expect(addressesModule.createAddress).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      // Should show error message
      expect(
        screen.getByText(/Please correct the errors/i),
      ).toBeInTheDocument();
    });

    it("should highlight all fields with errors on submit attempt - Requirement 11.3", async () => {
      const { container } = renderWithProviders(<AddressForm />);

      // Find form element and submit directly using fireEvent
      const form = container.querySelector("form");
      expect(form).toBeTruthy();
      fireEvent.submit(form!);

      // Wait for the general error message to appear first
      await waitFor(
        () => {
          expect(
            screen.getByText(/Please correct the errors/i),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Now check for specific field error messages
      // Note: The errors appear below each field, so we need to check for them individually
      await waitFor(() => {
        // Check for required field errors - these should be visible in the DOM
        const allErrors = screen.getAllByText(/required/i);
        // Should have at least the required fields: recipient_name, phone, address_line1, city, state, postal_code
        // Note: country already has a default value ('BN'), so it won't show required error
        expect(allErrors.length).toBeGreaterThanOrEqual(6);
      });

      // Check that error styling is applied to inputs
      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);
      const postalInput = screen.getByLabelText(/Poskod/i);
      const recipientInput = screen.getByLabelText(/Recipient Name/i);

      expect(phoneInput.className).toContain("border-[#DC2626]");
      expect(postalInput.className).toContain("border-[#DC2626]");
      expect(recipientInput.className).toContain("border-[#DC2626]");
    });
  });

  describe("Error clearing on correction - Requirements 11.5, 12.5", () => {
    it("should clear error immediately when user corrects the error", async () => {
      renderWithProviders(<AddressForm />);

      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);

      // Enter invalid phone
      fireEvent.change(phoneInput, { target: { value: "invalid" } });
      fireEvent.blur(phoneInput);

      // Error should appear
      await waitFor(() => {
        expect(
          screen.getByText(/Phone number must be in format/i),
        ).toBeInTheDocument();
      });

      // Enter valid phone
      fireEvent.change(phoneInput, { target: { value: "123-4567" } });
      fireEvent.blur(phoneInput);

      // Error should disappear
      await waitFor(() => {
        expect(
          screen.queryByText(/Phone number must be in format/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should remove error styling when error is corrected", async () => {
      renderWithProviders(<AddressForm />);

      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);

      // Enter invalid phone
      fireEvent.change(phoneInput, { target: { value: "invalid" } });
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(phoneInput).toHaveClass("border-[#DC2626]");
      });

      // Correct the error
      fireEvent.change(phoneInput, { target: { value: "123-4567" } });
      fireEvent.blur(phoneInput);

      // Error styling should be removed
      await waitFor(() => {
        expect(phoneInput).not.toHaveClass("border-[#DC2626]");
      });
    });
  });

  describe("Multiple error display - Requirement 12.3", () => {
    it("should display all validation errors simultaneously", async () => {
      renderWithProviders(<AddressForm />);

      // Fill form with multiple invalid fields
      const phoneInput = screen.getByLabelText(/Nombor Telefon/i);
      const postalInput = screen.getByLabelText(/Poskod/i);

      fireEvent.change(phoneInput, { target: { value: "invalid" } });
      fireEvent.change(postalInput, { target: { value: "123" } });

      // Blur both fields
      fireEvent.blur(phoneInput);
      fireEvent.blur(postalInput);

      // Both errors should be visible
      await waitFor(() => {
        expect(
          screen.getByText(/Phone number must be in format/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Postal code must be in format/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Required field indicators - Requirement 11.1, 11.2", () => {
    it("should display asterisks next to required field labels", () => {
      renderWithProviders(<AddressForm />);

      // Check for asterisks in required fields
      expect(
        screen.getByText(/Recipient Name/i).parentElement?.textContent,
      ).toContain("*");
      expect(
        screen.getByText(/Nombor Telefon/i).parentElement?.textContent,
      ).toContain("*");
      expect(
        screen.getByText(/Address Line 1/i).parentElement?.textContent,
      ).toContain("*");
    });

    it("should display legend explaining required field markers", () => {
      renderWithProviders(<AddressForm />);

      expect(
        screen.getByText(/Fields marked with.*are required/i),
      ).toBeInTheDocument();
    });
  });

  describe("Helper text display - Requirements 6.1, 6.2", () => {
    it("should display helper text for phone number field", () => {
      renderWithProviders(<AddressForm />);

      expect(screen.getByText(/Format:.*\+673-XXX-XXXX/i)).toBeInTheDocument();
    });

    it("should display helper text for postal code field", () => {
      renderWithProviders(<AddressForm />);

      expect(screen.getByText(/Format:.*XX1234/i)).toBeInTheDocument();
    });
  });
});
