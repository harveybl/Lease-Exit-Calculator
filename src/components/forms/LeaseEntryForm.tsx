"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseFormSchema, type LeaseFormData, checkLeaseWarnings } from "@/lib/validations/lease-schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EssentialFields } from "./EssentialFields";
import { OptionalFieldsSection } from "./OptionalFieldsSection";
import { useFormAutoSave } from "@/hooks/use-auto-save";
import { AlertCircle, CheckCircle, X } from "lucide-react";

/**
 * Main lease entry form component.
 * Orchestrates essential fields, optional fields section, auto-save, validation, and warnings.
 */
export function LeaseEntryForm() {
  const [showDraftRestored, setShowDraftRestored] = useState(false);
  const [warnings, setWarnings] = useState<Array<{ field: string; message: string }>>([]);

  const form = useForm({
    resolver: zodResolver(leaseFormSchema),
    mode: "onTouched" as const, // Hybrid validation: silent initially, validates after touch
    reValidateMode: "onChange" as const, // After first submit, validate on every change
    defaultValues: {
      monthlyPayment: "" as any, // Empty string for user to fill, will be coerced to number
      termMonths: 36, // Sensible default
      allowedMilesPerYear: 12000, // Common default
      residualValue: "" as any, // Empty string for user to fill, will be coerced to number
      currentMileage: "" as any, // Empty string for user to fill, will be coerced to number
      // Optional fields default to undefined/0
      downPayment: 0,
      dispositionFee: 0,
      purchaseFee: 0,
      overageFeePerMile: 0.25,
      monthsElapsed: 0,
    },
  });

  const { loadSaved, clearSaved, hasSavedDraft } = useFormAutoSave(
    form.watch,
    "lease-draft",
    500 // 500ms debounce
  );

  // Restore saved draft on mount (client-side only)
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      form.reset(saved as any);
      setShowDraftRestored(true);
      // Fade out the "Draft restored" indicator after 3 seconds
      setTimeout(() => setShowDraftRestored(false), 3000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for warnings when form data changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      const newWarnings = checkLeaseWarnings(data as any);
      setWarnings(newWarnings);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: any) => {
    // Temporary until Plan 03 wires server actions
    console.log("Form submitted with data:", data);
    console.log("Warnings (non-blocking):", warnings);

    // Clear draft on successful submission
    clearSaved();

    // TODO: Replace with server action in Plan 03
    alert("Form validation passed! (Server action integration coming in Plan 03)");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      {/* Draft restored indicator */}
      {showDraftRestored && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>Draft restored from previous session</span>
          </div>
          <button
            onClick={() => setShowDraftRestored(false)}
            className="text-primary hover:text-primary/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main form card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Enter Your Lease Details
            </h1>
            <p className="text-muted-foreground">
              Start with the basics — you can always add more details later.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Essential fields */}
              <EssentialFields />

              {/* Optional fields section */}
              <OptionalFieldsSection />

              {/* Warnings (amber/yellow, non-blocking) */}
              {warnings.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-warning-foreground mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-warning-foreground">
                        Double-check these values
                      </p>
                      <ul className="text-sm text-warning-foreground/90 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Validating..." : "Save Lease"}
              </Button>

              {/* Auto-save indicator */}
              {hasSavedDraft && !showDraftRestored && (
                <p className="text-xs text-muted-foreground">
                  Draft auto-saved to this device
                </p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
