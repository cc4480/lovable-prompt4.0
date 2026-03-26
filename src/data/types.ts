export type Category =
  | 'AI App Generators'
  | 'Full-Stack App Builders'
  | 'Website Builders'
  | 'Mobile App Builders'
  | 'Database & Internal Tools'
  | 'Workflow Automation'
  | 'Enterprise Platforms'
  | 'Chatbot Builders'
  | 'Landing Page Builders'
  | 'E-Commerce'
  | 'Form Builders';

export const ALL_CATEGORIES: Category[] = [
  'AI App Generators',
  'Full-Stack App Builders',
  'Website Builders',
  'Mobile App Builders',
  'Database & Internal Tools',
  'Workflow Automation',
  'Enterprise Platforms',
  'Chatbot Builders',
  'Landing Page Builders',
  'E-Commerce',
  'Form Builders',
];

export interface Platform {
  id: string;
  name: string;
  category: Category;
  description: string;
  url: string;
  tags: string[];
  color: string;
  textColor: string;
}

export interface PromptField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  required: boolean;
}

export interface PromptTemplate {
  categoryId: Category;
  platformOverrides?: string[]; // platform ids that use this exact template
  fields: PromptField[];
  generate: (platform: Platform, values: Record<string, string>) => string;
}

export interface GeneratedPrompt {
  id: string;
  platformId: string;
  platformName: string;
  content: string;
  createdAt: Date;
}
