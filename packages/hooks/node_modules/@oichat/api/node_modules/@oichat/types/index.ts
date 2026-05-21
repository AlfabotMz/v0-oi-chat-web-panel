export interface User {
  id: string;
  name?: string;
  email?: string;
}

export type PromptType = "dropshipper" | "support" | "personalizado";

export interface Agent {
  id: string;
  name: string;
  personality?: string;
  instructions?: string;
  prompt_type?: PromptType;
  product_name?: string;
  product_amount?: string;
  audience?: string;
  tone?: string;
  product_description?: string;
  is_active?: boolean;
}

export interface PromptVariables {
   product_name: string;
   product_price: string;
   audience: string;
   tone: string;
   product_description: string;
}
