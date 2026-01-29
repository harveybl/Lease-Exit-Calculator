import { customType } from 'drizzle-orm/pg-core';
import { Decimal } from '@/lib/decimal';

export const decimalNumber = customType<{
  data: Decimal;
  driverData: string;
  config: { precision?: number; scale?: number };
}>({
  dataType(config) {
    const precision = config?.precision ?? 10;
    const scale = config?.scale ?? 2;
    return `numeric(${precision}, ${scale})`;
  },
  toDriver(value: Decimal): string {
    return value.toFixed();
  },
  fromDriver(value: string): Decimal {
    return new Decimal(value);
  },
});
