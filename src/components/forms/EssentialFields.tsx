"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldTooltip } from "./FieldTooltip";
import { fieldTooltips } from "@/lib/content/field-tooltips";
import { type LeaseFormData } from "@/lib/validations/lease-schema";

/**
 * The 5 essential lease fields that appear on initial form load.
 * Each field includes label, tooltip, short hint, input, and validation message.
 */
export function EssentialFields() {
  const { control } = useFormContext<LeaseFormData>();

  return (
    <div className="space-y-6">
      {/* Monthly Payment */}
      <FormField
        control={control}
        name="monthlyPayment"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Monthly Payment
              <FieldTooltip fieldName="monthlyPayment" />
            </FormLabel>
            <FormDescription>
              {fieldTooltips.monthlyPayment.shortHint}
            </FormDescription>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="450"
                  className="pl-7"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Lease Term */}
      <FormField
        control={control}
        name="termMonths"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Lease Term
              <FieldTooltip fieldName="termMonths" />
            </FormLabel>
            <FormDescription>
              {fieldTooltips.termMonths.shortHint}
            </FormDescription>
            <FormControl>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="36"
                  className="pr-20"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  months
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Annual Mileage Allowance */}
      <FormField
        control={control}
        name="allowedMilesPerYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Annual Mileage Allowance
              <FieldTooltip fieldName="allowedMilesPerYear" />
            </FormLabel>
            <FormDescription>
              {fieldTooltips.allowedMilesPerYear.shortHint}
            </FormDescription>
            <FormControl>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="12000"
                  className="pr-24"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  miles/year
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Residual Value */}
      <FormField
        control={control}
        name="residualValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Residual Value
              <FieldTooltip fieldName="residualValue" />
            </FormLabel>
            <FormDescription>
              {fieldTooltips.residualValue.shortHint}
            </FormDescription>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="18000"
                  className="pl-7"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Current Mileage */}
      <FormField
        control={control}
        name="currentMileage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Current Mileage
              <FieldTooltip fieldName="currentMileage" />
            </FormLabel>
            <FormDescription>
              {fieldTooltips.currentMileage.shortHint}
            </FormDescription>
            <FormControl>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="15000"
                  className="pr-16"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  miles
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
