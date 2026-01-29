"use client";

import { HelpCircle, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fieldTooltips } from "@/lib/content/field-tooltips";

interface FieldTooltipProps {
  fieldName: string;
}

/**
 * Educational tooltip component with two-layer system:
 * - Short hint always visible in FormDescription
 * - Detailed popover on (?) icon click with explanation, location guide, and learn more link
 */
export function FieldTooltip({ fieldName }: FieldTooltipProps) {
  const content = fieldTooltips[fieldName];

  if (!content) {
    console.warn(`No tooltip content found for field: ${fieldName}`);
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-1 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Help for ${content.title}`}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help for {content.title}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-4 rounded-xl">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{content.title}</h4>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {content.description}
          </p>

          {content.whereToFind && (
            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium mb-1">Where to find this:</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {content.whereToFind}
              </p>
            </div>
          )}

          {content.example && (
            <div className="text-xs">
              <span className="font-medium">Example: </span>
              <code className="text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded">
                {content.example}
              </code>
            </div>
          )}

          {content.learnMoreUrl && (
            <a
              href={content.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
