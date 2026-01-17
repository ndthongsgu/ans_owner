import type { BaseDto } from "./base.dto";

export interface CustomerDto extends BaseDto {
  code: string;
  name: string;
  email: string;
  phone: string;
  customerType: null;
  description: null;
}
