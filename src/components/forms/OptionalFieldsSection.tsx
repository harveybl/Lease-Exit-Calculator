"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldTooltip } from "./FieldTooltip";
import { fieldTooltips } from "@/lib/content/field-tooltips";
import { type LeaseFormData } from "@/lib/validations/lease-schema";

/**
 * Progressive disclosure section for optional lease details.
 * Tracks completion count and shows grouped optional fields when expanded.
 */
export function OptionalFieldsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { control } = useFormContext<LeaseFormData>();

  // Watch specific optional fields to track completeness
  // Using useWatch for performance (not form.watch() at root level)
  const optionalValues = useWatch({
    control,
    name: [
      "make",
      "model",
      "year",
      "msrp",
      "netCapCost",
      "residualPercent",
      "moneyFactor",
      "downPayment",
      "dispositionFee",
      "purchaseFee",
      "overageFeePerMile",
      "monthsElapsed",
      "stateCode",
      "startDate",
      "endDate",
    ],
  });

  // Count how many optional fields have values
  const completedCount = optionalValues.filter((value) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "number" && value === 0) return false; // Don't count default zeros
    return true;
  }).length;

  const totalOptionalFields = 15;

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span>
          Add more details
          {completedCount > 0 && ` (${completedCount} of ${totalOptionalFields} added)`}
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {!isExpanded && (
        <p className="text-sm text-muted-foreground text-center">
          More details improve accuracy
        </p>
      )}

      {isExpanded && (
        <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Vehicle Information</h3>

            <FormField
              control={control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Make
                    <FieldTooltip fieldName="make" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.make.shortHint}</FormDescription>
                  <FormControl>
                    <Input placeholder="Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Model
                    <FieldTooltip fieldName="model" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.model.shortHint}</FormDescription>
                  <FormControl>
                    <Input placeholder="Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Year
                    <FieldTooltip fieldName="year" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.year.shortHint}</FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2023"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Financial Details</h3>

            <FormField
              control={control}
              name="msrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    MSRP
                    <FieldTooltip fieldName="msrp" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.msrp.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="45000"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="netCapCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Net Capitalized Cost
                    <FieldTooltip fieldName="netCapCost" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.netCapCost.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="42500"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="residualPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Residual Percentage
                    <FieldTooltip fieldName="residualPercent" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.residualPercent.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="58"
                        className="pr-8"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="moneyFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Money Factor
                    <FieldTooltip fieldName="moneyFactor" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.moneyFactor.shortHint}</FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00125"
                      step="0.00001"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="downPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Down Payment
                    <FieldTooltip fieldName="downPayment" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.downPayment.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="2500"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Fees</h3>

            <FormField
              control={control}
              name="dispositionFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Disposition Fee
                    <FieldTooltip fieldName="dispositionFee" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.dispositionFee.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="395"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="purchaseFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Purchase Option Fee
                    <FieldTooltip fieldName="purchaseFee" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.purchaseFee.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="350"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="overageFeePerMile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Overage Fee Per Mile
                    <FieldTooltip fieldName="overageFeePerMile" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.overageFeePerMile.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.25"
                        className="pl-7"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Lease Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Lease Timeline</h3>

            <FormField
              control={control}
              name="monthsElapsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Months Into Lease
                    <FieldTooltip fieldName="monthsElapsed" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.monthsElapsed.shortHint}</FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="12"
                        className="pr-20"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
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

            <FormField
              control={control}
              name="stateCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    State
                    <FieldTooltip fieldName="stateCode" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.stateCode.shortHint}</FormDescription>
                  <FormControl>
                    <Input
                      placeholder="CA"
                      maxLength={2}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Lease Start Date
                    <FieldTooltip fieldName="startDate" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.startDate.shortHint}</FormDescription>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Lease End Date
                    <FieldTooltip fieldName="endDate" />
                  </FormLabel>
                  <FormDescription>{fieldTooltips.endDate.shortHint}</FormDescription>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
