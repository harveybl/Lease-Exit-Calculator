"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { leaseFormSchema, type LeaseFormData, checkLeaseWarnings } from "@/lib/validations/lease-schema";
import { createLease, updateLease } from "@/app/lease/actions";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EssentialFields } from "./EssentialFields";
import { OptionalFieldsSection } from "./OptionalFieldsSection";
import { useFormAutoSave } from "@/hooks/use-auto-save";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Decimal } from "@/lib/decimal";

interface LeaseEntryFormProps {
  leaseId?: string;
  initialData?: LeaseFormData;
}

/**
 * Main lease entry form component.
 * Orchestrates essential fields, optional fields section, auto-save, validation, and warnings.
 */
export function LeaseEntryForm({ leaseId, initialData }: LeaseEntryFormProps = {}) {
  const router = useRouter();
  const [showDraftRestored, setShowDraftRestored] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [warnings, setWarnings] = useState<Array<{ field: string; message: string }>>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!leaseId;

  const form = useForm({
    resolver: zodResolver(leaseFormSchema),
    mode: "onTouched" as const, // Hybrid validation: silent initially, validates after touch
    reValidateMode: "onChange" as const, // After first submit, validate on every change
    defaultValues: initialData ?? {
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
  // Only restore if NOT editing an existing lease
  useEffect(() => {
    if (!isEditing) {
      const saved = loadSaved();
      if (saved) {
        form.reset(saved as any);
        setShowDraftRestored(true);
        // Fade out the "Draft restored" indicator after 3 seconds
        setTimeout(() => setShowDraftRestored(false), 3000);
      }
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for warnings when form data changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      const newWarnings = checkLeaseWarnings(data as any);
      setWarnings(newWarnings);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: LeaseFormData) => {
    setServerError(null);
    setSaveSuccess(false);

    try {
      const result = isEditing
        ? await updateLease(leaseId!, data)
        : await createLease(data);

      if (result.success) {
        if (isEditing) {
          // Show success message for edits
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          // Clear draft and redirect to list for new leases
          clearSaved();
          router.push('/lease');
        }
      } else {
        // Handle validation or server errors
        setServerError(result.error);

        // Map field errors back to form
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as any, {
              type: "server",
              message: messages[0],
            });
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setServerError("An unexpected error occurred. Please try again.");
    }
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

      {/* Save success indicator (edit mode) */}
      {saveSuccess && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>Changes saved successfully</span>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-primary hover:text-primary/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Server error indicator */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{serverError}</span>
          </div>
          <button
            onClick={() => setServerError(null)}
            className="text-destructive hover:text-destructive/80"
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
              {isEditing ? "Edit Lease Details" : "Enter Your Lease Details"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update your lease information below."
                : "Start with the basics — you can always add more details later."}
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
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Save Lease"}
              </Button>

              {/* Auto-save indicator (only for new leases) */}
              {!isEditing && hasSavedDraft && !showDraftRestored && (
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
