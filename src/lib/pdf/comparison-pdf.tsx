'use client';

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

// ── Serializable Data Types ────────────────────────────────────────

/**
 * Line item with pre-formatted currency strings.
 * Used in PDF generation where Decimal cannot be serialized.
 */
export interface PDFLineItem {
  label: string;
  amount: string; // pre-formatted currency string
  description: string;
  type: string;
}

/**
 * Scenario data with pre-formatted currency strings.
 * Used in PDF generation where Decimal cannot be serialized.
 */
export interface PDFScenarioData {
  type: string;
  name: string; // formatted display name
  netCost: string; // pre-formatted currency
  totalCost: string;
  lineItems: PDFLineItem[];
  warnings: string[];
  incomplete?: boolean;
}

/**
 * Complete comparison data ready for PDF export.
 * All monetary values are pre-formatted strings.
 */
export interface PDFComparisonData {
  heading: string; // vehicle name
  bestOptionName: string;
  savingsDescription: string;
  scenarios: PDFScenarioData[];
  disclaimers: string[];
  generatedDate: string;
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica', // built-in font - no loading required
    fontSize: 10,
    color: '#000000',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #0d9488',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488', // teal
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#0d9488', // teal
  },
  recommendation: {
    backgroundColor: '#f0fdfa', // teal-50
    padding: 10,
    marginBottom: 15,
    borderLeft: '3pt solid #0d9488',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 10,
    color: '#333333',
  },
  scenarioSection: {
    marginBottom: 15,
    borderBottom: '0.5pt solid #e5e5e5',
    paddingBottom: 10,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: '1pt solid #d1d5db',
  },
  scenarioName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scenarioNameIncomplete: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
  },
  netCost: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  lineItemsHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e5e5e5',
    paddingVertical: 4,
    marginBottom: 4,
  },
  lineItemsHeaderLabel: {
    width: '60%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
  },
  lineItemsHeaderValue: {
    width: '40%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
    textAlign: 'right',
  },
  lineItemRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #f3f4f6',
    paddingVertical: 3,
  },
  lineItemLabel: {
    width: '60%',
    fontSize: 10,
  },
  lineItemValue: {
    width: '40%',
    fontSize: 10,
    textAlign: 'right',
  },
  warning: {
    fontSize: 9,
    color: '#d97706', // amber-600
    marginTop: 4,
    fontStyle: 'italic',
  },
  disclaimerSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1pt solid #d1d5db',
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#666666',
  },
  disclaimer: {
    fontSize: 7,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  footer: {
    fontSize: 8,
    color: '#999999',
    marginTop: 15,
    textAlign: 'center',
  },
});

// ── Component ───────────────────────────────────────────────────────

interface ComparisonPDFProps {
  data: PDFComparisonData;
}

/**
 * PDF document component for lease comparison export.
 * Uses @react-pdf/renderer to generate a downloadable PDF with:
 * - Vehicle heading and recommendation
 * - All scenario options with line items
 * - Disclaimers and warnings
 */
export function ComparisonPDF({ data }: ComparisonPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lease Comparison Summary</Text>
          <Text style={styles.subtitle}>{data.heading}</Text>
          <Text style={styles.subtitle}>Generated {data.generatedDate}</Text>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>
            Best Move: {data.bestOptionName}
          </Text>
          <Text style={styles.recommendationText}>
            {data.savingsDescription}
          </Text>
        </View>

        {/* Scenarios */}
        <Text style={styles.heading}>Your Options</Text>
        {data.scenarios.map((scenario, index) => (
          <View key={index} style={styles.scenarioSection}>
            {/* Scenario Header */}
            <View style={styles.scenarioHeader}>
              <Text
                style={
                  scenario.incomplete
                    ? styles.scenarioNameIncomplete
                    : styles.scenarioName
                }
              >
                {scenario.name}
                {scenario.incomplete && ' (Incomplete)'}
              </Text>
              <Text style={styles.netCost}>{scenario.netCost}</Text>
            </View>

            {/* Line Items */}
            {scenario.lineItems.length > 0 && (
              <>
                <View style={styles.lineItemsHeader}>
                  <Text style={styles.lineItemsHeaderLabel}>Item</Text>
                  <Text style={styles.lineItemsHeaderValue}>Amount</Text>
                </View>
                {scenario.lineItems.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.lineItemRow}>
                    <Text style={styles.lineItemLabel}>{item.label}</Text>
                    <Text style={styles.lineItemValue}>{item.amount}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Warnings */}
            {scenario.warnings.map((warning, warnIndex) => (
              <Text key={warnIndex} style={styles.warning}>
                ⚠ {warning}
              </Text>
            ))}
          </View>
        ))}

        {/* Disclaimers */}
        {data.disclaimers.length > 0 && (
          <View style={styles.disclaimerSection}>
            <Text style={styles.disclaimerTitle}>Important Notes</Text>
            {data.disclaimers.map((disclaimer, index) => (
              <Text key={index} style={styles.disclaimer}>
                • {disclaimer}
              </Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This comparison is for informational purposes. Always verify with your lender.
        </Text>
      </Page>
    </Document>
  );
}
