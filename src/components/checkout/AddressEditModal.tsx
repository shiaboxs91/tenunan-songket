"use client";

/**
 * AddressEditModal component for inline address editing during checkout
 * Feature: address-management-enhancement
 * Task 10: Create AddressEditModal component for inline editing
 * 
 * Requirements:
 * - 4.2: Modal overlay with backdrop, close on Escape/click outside
 * - 4.5: Cancel preserves original data (unsaved changes warning)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/profile";
import { CountryProvider } from "@/contexts/CountryContext";
import type { Address, AddressInput } from "@/lib/supabase/addresses";
import { CountryCode } from "@/lib/validation/country-config";

interface AddressEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The address to edit (null for new address) */
  address?: Address | null;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when address is saved successfully */
  onSuccess?: (address: Address) => void;
}

/**
 * Modal component for editing addresses inline during checkout
 * Features:
 * - Full-screen on mobile, centered dialog on desktop (Requirement 4.2)
 * - Close on Escape key press
 * - Warning on click outside with unsaved changes (Requirement 4.5)
 * - Focus trap for accessibility
 */
export function AddressEditModal({
  isOpen,
  address,
  onClose,
  onSuccess,
}: AddressEditModalProps) {
  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  
  // Refs for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  
  /**
   * Handle escape key press - Requirement 4.2
   */
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCloseAttempt();
    }
  }, [hasUnsavedChanges]);
  
  /**
   * Handle close attempt with unsaved changes check - Requirement 4.5
   */
  const handleCloseAttempt = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);
  
  /**
   * Handle backdrop click - Requirement 4.2
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseAttempt();
    }
  };
  
  /**
   * Confirm close with unsaved changes
   */
  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    onClose();
  };
  
  /**
   * Cancel close warning and return to editing
   */
  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };
  
  /**
   * Handle form input change to track unsaved changes
   */
  const handleFormChange = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };
  
  /**
   * Handle successful address save
   */
  const handleSuccess = (savedAddress: Address) => {
    setHasUnsavedChanges(false);
    onSuccess?.(savedAddress);
    onClose();
  };
  
  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    handleCloseAttempt();
  };
  
  // Set up event listeners and focus trap
  useEffect(() => {
    if (isOpen) {
      // Save current focused element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add escape key listener
      document.addEventListener("keydown", handleEscapeKey);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      
      // Focus the first focusable element (close button)
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
      
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = "";
        
        // Restore focus to previous element
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, handleEscapeKey]);
  
  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab: go to last element if at first
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: go to first element if at last
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHasUnsavedChanges(false);
      setShowUnsavedWarning(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const initialCountry = (address?.country as CountryCode) || "BN";
  
  return (
    <>
      {/* Modal backdrop - Requirement 4.2 */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal content - Responsive: Full-screen mobile, centered desktop */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-edit-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
      >
        <div
          className={`
            bg-white dark:bg-gray-900 
            w-full h-full md:h-auto md:max-h-[90vh]
            md:w-full md:max-w-lg
            md:rounded-lg md:shadow-xl
            flex flex-col
            overflow-hidden
            animate-in fade-in-0 zoom-in-95 md:zoom-in-100
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <h2
              id="address-edit-modal-title"
              className="text-lg font-semibold"
            >
              {address ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h2>
            <Button
              ref={firstFocusableRef}
              variant="ghost"
              size="icon"
              onClick={handleCloseAttempt}
              className="h-8 w-8 rounded-full"
              aria-label="Tutup modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Form content - scrollable */}
          <div className="flex-1 overflow-y-auto p-4" onChange={handleFormChange}>
            <CountryProvider initialCountry={initialCountry}>
              <AddressForm
                address={address}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </CountryProvider>
          </div>
        </div>
      </div>
      
      {/* Unsaved changes warning dialog - Requirement 4.5 */}
      {showUnsavedWarning && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-warning-title"
            aria-describedby="unsaved-warning-description"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <h3 id="unsaved-warning-title" className="font-semibold text-lg">
                  Perubahan Belum Disimpan
                </h3>
              </div>
              <p id="unsaved-warning-description" className="text-muted-foreground mb-6">
                Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup tanpa menyimpan?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelClose}
                >
                  Kembali Mengedit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmClose}
                >
                  Buang Perubahan
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
