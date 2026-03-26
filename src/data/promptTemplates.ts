import type { PromptTemplate, Platform } from './types';

// ─── Shared field helpers ─────────────────────────────────────────────────

const appNameField = {
  id: 'appName',
  label: 'App / Project Name',
  placeholder: 'e.g. TaskFlow, ShopEasy, ClientPortal',
  type: 'text' as const,
  required: true,
};

const descriptionField = {
  id: 'description',
  label: 'What does the app do?',
  placeholder: 'Describe the core purpose and problem it solves…',
  type: 'textarea' as const,
  required: true,
};

const audienceField = {
  id: 'audience',
  label: 'Target Audience',
  placeholder: 'e.g. freelancers, HR teams, e-commerce store owners',
  type: 'text' as const,
  required: true,
};

const featuresField = {
  id: 'features',
  label: 'Key Features (one per line)',
  placeholder: 'User authentication\nDashboard with charts\nNotification system',
  type: 'textarea' as const,
  required: true,
};

// ─── Templates by category ────────────────────────────────────────────────

export const promptTemplates: PromptTemplate[] = [
  // ── AI App Generators ────────────────────────────────────────────────────
  {
    categoryId: 'AI App Generators',
    fields: [
      appNameField,
      descriptionField,
      audienceField,
      {
        id: 'appType',
        label: 'App Type',
        placeholder: '',
        type: 'select',
        options: ['SaaS product', 'Marketplace', 'Social platform', 'Internal tool', 'Portfolio', 'Landing page', 'Dashboard', 'E-commerce', 'Blog/CMS', 'Other'],
        required: true,
      },
      {
        id: 'pages',
        label: 'Pages / Screens (one per line)',
        placeholder: 'Landing page\nSign up / Login\nDashboard\nProfile settings',
        type: 'textarea',
        required: true,
      },
      featuresField,
      {
        id: 'design',
        label: 'Design Style',
        placeholder: '',
        type: 'select',
        options: ['Modern & minimal', 'Bold & colorful', 'Corporate/professional', 'Dark mode', 'Glassmorphism', 'Retro/playful'],
        required: false,
      },
      {
        id: 'auth',
        label: 'Authentication',
        placeholder: '',
        type: 'select',
        options: ['Email + password', 'Google OAuth', 'Magic link (passwordless)', 'No auth needed'],
        required: false,
      },
      {
        id: 'database',
        label: 'Data / Backend',
        placeholder: '',
        type: 'select',
        options: ['Supabase (PostgreSQL)', 'Firebase', 'PocketBase', 'Airtable', 'No backend needed'],
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build a ${v.appType || 'web app'} called "${v.appName}" using ${platform.name}.

## What it does
${v.description}

## Target users
${v.audience}

## Pages / Screens
${v.pages
  .split('\n')
  .filter(Boolean)
  .map((p) => `- ${p.trim()}`)
  .join('\n')}

## Core Features
${v.features
  .split('\n')
  .filter(Boolean)
  .map((f) => `- ${f.trim()}`)
  .join('\n')}

## Design
Style: ${v.design || 'Modern & minimal'}
Make the UI clean, responsive, and mobile-friendly.

## Auth
${v.auth || 'Email + password'} authentication

## Backend / Data
${v.database || 'Supabase (PostgreSQL)'}

## Instructions
- Start with the landing page / home screen
- Use consistent component naming
- Add loading and empty states for all data-driven views
- Ensure the app is fully responsive for desktop and mobile
- Add appropriate error handling throughout`,
  },

  // ── Full-Stack App Builders ───────────────────────────────────────────────
  {
    categoryId: 'Full-Stack App Builders',
    fields: [
      appNameField,
      descriptionField,
      audienceField,
      {
        id: 'dataTypes',
        label: 'Main Data Types / Entities (one per line)',
        placeholder: 'User\nProject (title, status, dueDate)\nComment (text, author)',
        type: 'textarea',
        required: true,
      },
      featuresField,
      {
        id: 'userRoles',
        label: 'User Roles',
        placeholder: 'Admin, Member, Guest',
        type: 'text',
        required: false,
      },
      {
        id: 'integrations',
        label: 'Integrations / APIs needed',
        placeholder: 'Stripe for payments, SendGrid for email, Google Maps',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build "${v.appName}" on ${platform.name}.

## Overview
${v.description}

## Users
Target audience: ${v.audience}
${v.userRoles ? `Roles: ${v.userRoles}` : ''}

## Data Model
${v.dataTypes
  .split('\n')
  .filter(Boolean)
  .map((d) => `- ${d.trim()}`)
  .join('\n')}

## Core Features
${v.features
  .split('\n')
  .filter(Boolean)
  .map((f) => `- ${f.trim()}`)
  .join('\n')}

${v.integrations ? `## Integrations\n${v.integrations}` : ''}

## Requirements
- Implement proper access control for each role
- Add data validation on all inputs
- Use responsive layouts for all pages
- Include a navigation sidebar or top bar
- Handle empty states and loading indicators`,
  },

  // ── Website Builders ─────────────────────────────────────────────────────
  {
    categoryId: 'Website Builders',
    fields: [
      { ...appNameField, label: 'Website / Brand Name' },
      {
        id: 'websiteType',
        label: 'Website Type',
        placeholder: '',
        type: 'select',
        options: ['Business/Corporate', 'Portfolio', 'Blog', 'Agency', 'Startup / Product', 'Personal brand', 'Non-profit', 'Restaurant/Local business'],
        required: true,
      },
      {
        id: 'description',
        label: 'What is the website about?',
        placeholder: 'Describe the brand, product or service…',
        type: 'textarea',
        required: true,
      },
      audienceField,
      {
        id: 'pages',
        label: 'Pages (one per line)',
        placeholder: 'Home\nAbout\nServices\nBlog\nContact',
        type: 'textarea',
        required: true,
      },
      {
        id: 'aesthetic',
        label: 'Visual Aesthetic',
        placeholder: '',
        type: 'select',
        options: ['Minimal & clean', 'Bold & editorial', 'Warm & organic', 'Dark & premium', 'Bright & playful', 'Classic & professional'],
        required: false,
      },
      {
        id: 'colors',
        label: 'Brand Colors',
        placeholder: 'e.g. Primary: #1A1A2E, Accent: #FF6B6B, Background: white',
        type: 'text',
        required: false,
      },
      {
        id: 'animations',
        label: 'Animations / Interactions',
        placeholder: 'Scroll fade-in, hover lift, hero parallax',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Design a ${v.websiteType || 'business'} website called "${v.appName}" in ${platform.name}.

## About
${v.description}

## Target audience
${v.audience}

## Pages
${v.pages
  .split('\n')
  .filter(Boolean)
  .map((p) => `- ${p.trim()}`)
  .join('\n')}

## Design
- Aesthetic: ${v.aesthetic || 'Minimal & clean'}
${v.colors ? `- Colors: ${v.colors}` : ''}
${v.animations ? `- Animations: ${v.animations}` : ''}

## Requirements
- Fully responsive (mobile, tablet, desktop)
- Fast-loading with optimized images
- Clear CTA (call-to-action) on every page
- SEO-friendly structure with proper headings
- Accessibility: alt text, keyboard navigation, sufficient contrast
${platform.id === 'webflow' ? '- Use reusable Symbols and defined CMS Collections where needed\n- Apply consistent class naming (BEM preferred)' : ''}
${platform.id === 'framer' ? '- Use Framer Motion for scroll-based and hover animations\n- Import Figma components where available' : ''}`,
  },

  // ── Mobile App Builders ───────────────────────────────────────────────────
  {
    categoryId: 'Mobile App Builders',
    fields: [
      appNameField,
      descriptionField,
      audienceField,
      {
        id: 'platforms',
        label: 'Target Platforms',
        placeholder: '',
        type: 'select',
        options: ['iOS only', 'Android only', 'iOS + Android', 'iOS + Android + Web'],
        required: true,
      },
      {
        id: 'screens',
        label: 'Screens (one per line)',
        placeholder: 'Splash / Onboarding\nHome feed\nProfile\nSettings\nDetail view',
        type: 'textarea',
        required: true,
      },
      featuresField,
      {
        id: 'dataSource',
        label: 'Data Source',
        placeholder: '',
        type: 'select',
        options: ['Built-in database', 'Google Sheets', 'Airtable', 'REST API', 'Firebase', 'Supabase'],
        required: false,
      },
      {
        id: 'monetization',
        label: 'Monetization (optional)',
        placeholder: 'In-app purchases, subscriptions, freemium',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build a mobile app called "${v.appName}" using ${platform.name}.

## App Description
${v.description}

## Audience
${v.audience}

## Platforms
${v.platforms}

## Screens
${v.screens
  .split('\n')
  .filter(Boolean)
  .map((s) => `- ${s.trim()}`)
  .join('\n')}

## Core Features
${v.features
  .split('\n')
  .filter(Boolean)
  .map((f) => `- ${f.trim()}`)
  .join('\n')}

## Data
${v.dataSource || 'Built-in database'}

${v.monetization ? `## Monetization\n${v.monetization}` : ''}

## Requirements
- Native look and feel on all target platforms
- Smooth navigation and transitions
- Handle offline/loading states gracefully
- Push notification support where relevant
- App Store / Play Store ready (icons, splash, permissions)`,
  },

  // ── Database & Internal Tools ─────────────────────────────────────────────
  {
    categoryId: 'Database & Internal Tools',
    fields: [
      { ...appNameField, label: 'Tool / Dashboard Name' },
      descriptionField,
      {
        id: 'userRoles',
        label: 'User Roles',
        placeholder: 'Admin, Editor, Viewer',
        type: 'text',
        required: false,
      },
      {
        id: 'dataSources',
        label: 'Data Sources (one per line)',
        placeholder: 'PostgreSQL users table\nStripe payments API\nGoogle Sheets inventory',
        type: 'textarea',
        required: true,
      },
      {
        id: 'views',
        label: 'Views / Pages (one per line)',
        placeholder: 'User management table\nRevenue dashboard\nOrder detail page',
        type: 'textarea',
        required: true,
      },
      {
        id: 'actions',
        label: 'Actions users can perform',
        placeholder: 'Create order, Update status, Export CSV, Send email',
        type: 'textarea',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build an internal tool called "${v.appName}" in ${platform.name}.

## Purpose
${v.description}

## Roles & Permissions
${v.userRoles || 'Admin (full access), Viewer (read-only)'}

## Data Sources
${v.dataSources
  .split('\n')
  .filter(Boolean)
  .map((d) => `- ${d.trim()}`)
  .join('\n')}

## Views / Pages
${v.views
  .split('\n')
  .filter(Boolean)
  .map((v2) => `- ${v2.trim()}`)
  .join('\n')}

${v.actions ? `## Actions\n${v.actions.split('\n').filter(Boolean).map((a) => `- ${a.trim()}`).join('\n')}` : ''}

## Requirements
- Role-based access control for each view
- Sortable and filterable tables
- Inline editing where appropriate
- Audit log / change history for sensitive data
- Export to CSV / PDF where relevant
- Responsive layout for laptop and desktop`,
  },

  // ── Workflow Automation ───────────────────────────────────────────────────
  {
    categoryId: 'Workflow Automation',
    fields: [
      { ...appNameField, label: 'Automation Name' },
      {
        id: 'trigger',
        label: 'Trigger (what starts the automation?)',
        placeholder: 'e.g. New row in Google Sheets, Form submitted in Typeform, New order in Shopify',
        type: 'textarea',
        required: true,
      },
      {
        id: 'triggerApp',
        label: 'Trigger App',
        placeholder: 'e.g. Google Sheets, Typeform, Shopify, Webhook',
        type: 'text',
        required: true,
      },
      {
        id: 'actions',
        label: 'Actions (what should happen? one per line)',
        placeholder: 'Send welcome email via SendGrid\nAdd contact to HubSpot CRM\nPost Slack notification to #sales',
        type: 'textarea',
        required: true,
      },
      {
        id: 'conditions',
        label: 'Conditions / Filters (optional)',
        placeholder: 'Only run if order value > $100\nOnly for customers in the US',
        type: 'textarea',
        required: false,
      },
      {
        id: 'frequency',
        label: 'Frequency',
        placeholder: '',
        type: 'select',
        options: ['Real-time (instant)', 'Every 15 minutes', 'Hourly', 'Daily', 'Weekly', 'Triggered by schedule'],
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Create an automation workflow called "${v.appName}" in ${platform.name}.

## Trigger
App: ${v.triggerApp}
Event: ${v.trigger}

## Actions
${v.actions
  .split('\n')
  .filter(Boolean)
  .map((a, i) => `${i + 1}. ${a.trim()}`)
  .join('\n')}

${v.conditions ? `## Conditions / Filters\n${v.conditions.split('\n').filter(Boolean).map((c) => `- ${c.trim()}`).join('\n')}` : ''}

## Frequency
${v.frequency || 'Real-time (instant)'}

## Error Handling
- Send an email or Slack alert if the automation fails
- Log failed executions for review
- Retry failed steps up to 3 times

## Notes
${platform.id === 'zapier' ? '- Use a Filter step before actions to enforce conditions\n- Use Formatter steps for any data transformations' : ''}
${platform.id === 'make' ? '- Use a Router module for conditional branching\n- Add an Error Handler route for each critical module' : ''}
${platform.id === 'n8n' ? '- Use IF nodes for conditional logic\n- Use the Code node for complex data transformations\n- Consider self-hosting for GDPR compliance' : ''}`,
  },

  // ── Enterprise Platforms ──────────────────────────────────────────────────
  {
    categoryId: 'Enterprise Platforms',
    fields: [
      appNameField,
      descriptionField,
      {
        id: 'department',
        label: 'Department / Business Unit',
        placeholder: 'HR, Finance, Sales, IT, Operations',
        type: 'text',
        required: true,
      },
      {
        id: 'process',
        label: 'Business Process to automate',
        placeholder: 'Employee onboarding, expense approval, customer escalation routing',
        type: 'textarea',
        required: true,
      },
      {
        id: 'integrations',
        label: 'Systems to integrate (one per line)',
        placeholder: 'Salesforce CRM\nSAP ERP\nMicrosoft Teams\nSharePoint',
        type: 'textarea',
        required: false,
      },
      {
        id: 'compliance',
        label: 'Compliance Requirements',
        placeholder: 'GDPR, HIPAA, SOC 2, ISO 27001',
        type: 'text',
        required: false,
      },
      {
        id: 'sla',
        label: 'SLA / Performance Requirements',
        placeholder: 'e.g. < 2s response time, 99.9% uptime, 10,000 daily users',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build an enterprise application called "${v.appName}" on ${platform.name}.

## Overview
${v.description}

## Department
${v.department}

## Process / Workflow to Digitize
${v.process}

${v.integrations ? `## System Integrations\n${v.integrations.split('\n').filter(Boolean).map((i) => `- ${i.trim()}`).join('\n')}` : ''}

${v.compliance ? `## Compliance & Security\n- Requirements: ${v.compliance}\n- Implement audit logging for all actions\n- Role-based access control with SSO support` : ''}

${v.sla ? `## Performance Requirements\n${v.sla}` : ''}

## Enterprise Requirements
- Admin console for user and permission management
- Full audit trail with timestamps and actor IDs
- Export capabilities (PDF, Excel, CSV)
- Notification system (email + in-app)
- Staging and production environment separation
- API documentation for future integrations`,
  },

  // ── Chatbot Builders ──────────────────────────────────────────────────────
  {
    categoryId: 'Chatbot Builders',
    fields: [
      { ...appNameField, label: 'Bot Name' },
      {
        id: 'purpose',
        label: 'Bot Purpose',
        placeholder: '',
        type: 'select',
        options: ['Customer support', 'Lead generation', 'Sales / product recommendation', 'Onboarding / FAQ', 'Appointment booking', 'Survey / feedback', 'Internal HR/IT helpdesk'],
        required: true,
      },
      {
        id: 'description',
        label: 'What should the bot do?',
        placeholder: 'Describe the conversations it should handle…',
        type: 'textarea',
        required: true,
      },
      {
        id: 'tone',
        label: 'Tone of Voice',
        placeholder: '',
        type: 'select',
        options: ['Professional & formal', 'Friendly & casual', 'Empathetic & supportive', 'Concise & direct', 'Fun & playful'],
        required: true,
      },
      {
        id: 'channels',
        label: 'Deployment Channels',
        placeholder: '',
        type: 'select',
        options: ['Website widget', 'WhatsApp', 'Facebook Messenger', 'Instagram DM', 'SMS', 'Multiple channels'],
        required: true,
      },
      {
        id: 'knowledgeBase',
        label: 'Knowledge Base / Data Sources',
        placeholder: 'Website FAQs, product catalog PDF, pricing page URL',
        type: 'textarea',
        required: false,
      },
      {
        id: 'integrations',
        label: 'CRM / Tool Integrations',
        placeholder: 'HubSpot, Salesforce, Zendesk, Calendly',
        type: 'text',
        required: false,
      },
      {
        id: 'fallback',
        label: 'Human Handoff / Escalation',
        placeholder: 'Escalate to live agent after 3 failed attempts',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build a chatbot called "${v.appName}" using ${platform.name}.

## Purpose
${v.purpose}

## What the bot does
${v.description}

## Tone of voice
${v.tone}

## Channels
${v.channels}

${v.knowledgeBase ? `## Knowledge Base\n${v.knowledgeBase.split('\n').filter(Boolean).map((k) => `- ${k.trim()}`).join('\n')}` : ''}

${v.integrations ? `## Integrations\n${v.integrations}` : ''}

## Conversation Flows
1. **Welcome message**: Greet the user, explain what the bot can help with
2. **Main menu**: Offer clear options (buttons preferred over open text)
3. **Intent handling**: Detect common intents and respond accurately
4. **Fallback**: If unrecognized input, ask to rephrase or offer menu
5. **Human handoff**: ${v.fallback || 'Offer live agent option after 3 unresolved turns'}

## Requirements
- Mobile-friendly chat UI
- Quick-reply buttons for common responses
- Data collection (name, email) where needed for lead capture
- GDPR-compliant data handling
- Analytics tracking for conversation completion rate`,
  },

  // ── Landing Page Builders ─────────────────────────────────────────────────
  {
    categoryId: 'Landing Page Builders',
    fields: [
      { ...appNameField, label: 'Page / Campaign Name' },
      {
        id: 'offer',
        label: 'What is the offer or goal?',
        placeholder: 'Sign up for free trial, Download e-book, Register for webinar, Buy now',
        type: 'textarea',
        required: true,
      },
      audienceField,
      {
        id: 'headline',
        label: 'Headline (or key message)',
        placeholder: 'e.g. "Ship 10x faster without writing code"',
        type: 'text',
        required: true,
      },
      {
        id: 'sections',
        label: 'Sections (one per line)',
        placeholder: 'Hero with CTA\nSocial proof / logos\nFeatures grid\nTestimonials\nPricing\nFAQ\nFinal CTA',
        type: 'textarea',
        required: true,
      },
      {
        id: 'cta',
        label: 'Primary CTA Button Text',
        placeholder: 'Start free trial, Get the guide, Book a demo',
        type: 'text',
        required: true,
      },
      {
        id: 'formFields',
        label: 'Form Fields to collect',
        placeholder: 'First name, Email, Company (optional)',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Design a high-converting landing page using ${platform.name}.

## Campaign: "${v.appName}"
**Offer:** ${v.offer}
**Target Audience:** ${v.audience}

## Headline
"${v.headline}"

## Page Sections
${v.sections
  .split('\n')
  .filter(Boolean)
  .map((s, i) => `${i + 1}. ${s.trim()}`)
  .join('\n')}

## Primary CTA
Button text: "${v.cta}"
${v.formFields ? `Form fields: ${v.formFields}` : ''}

## Conversion Optimization
- Use the headline above as the H1 — keep it benefit-focused
- Add urgency or scarcity element near the CTA
- Include at least 3 social proof elements (logos, stats, testimonials)
- Above-the-fold CTA — visible without scrolling
- Mobile-first layout — test on 375px wide viewport
- Page load < 2 seconds (compress all images)
${platform.id === 'unbounce' ? '- Enable Smart Traffic for automatic A/B winner selection\n- Connect to CRM via Zapier integration' : ''}
${platform.id === 'instapage' ? '- Set up heatmap tracking from day one\n- Use personalization tokens for ad source matching' : ''}`,
  },

  // ── E-Commerce ────────────────────────────────────────────────────────────
  {
    categoryId: 'E-Commerce',
    fields: [
      { ...appNameField, label: 'Store / Brand Name' },
      {
        id: 'description',
        label: 'What do you sell?',
        placeholder: 'Handmade candles, SaaS subscriptions, Digital courses, Fashion accessories…',
        type: 'textarea',
        required: true,
      },
      audienceField,
      {
        id: 'productCount',
        label: 'Number of Products / SKUs',
        placeholder: '',
        type: 'select',
        options: ['1–10 (small)', '11–100 (medium)', '100–1000 (large)', '1000+ (enterprise)'],
        required: true,
      },
      {
        id: 'pages',
        label: 'Store Pages (one per line)',
        placeholder: 'Homepage\nProduct collection\nProduct detail\nCart\nCheckout\nAbout\nContact',
        type: 'textarea',
        required: true,
      },
      {
        id: 'payment',
        label: 'Payment Methods',
        placeholder: 'Credit card, PayPal, Apple Pay, Buy Now Pay Later',
        type: 'text',
        required: false,
      },
      {
        id: 'features',
        label: 'Special Features',
        placeholder: 'Subscriptions, Bundles, Discount codes, Loyalty program, Reviews, Wishlist',
        type: 'textarea',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Build an e-commerce store called "${v.appName}" on ${platform.name}.

## Store Overview
${v.description}

## Target Customer
${v.audience}

## Catalog Size
${v.productCount}

## Store Pages
${v.pages
  .split('\n')
  .filter(Boolean)
  .map((p) => `- ${p.trim()}`)
  .join('\n')}

${v.payment ? `## Payment & Checkout\nAccept: ${v.payment}` : ''}

${v.features ? `## Special Features\n${v.features.split('\n').filter(Boolean).map((f) => `- ${f.trim()}`).join('\n')}` : ''}

## Requirements
- Mobile-first, fast-loading product pages
- High-quality image gallery with zoom
- Clear trust signals (reviews, security badges, return policy)
- Abandoned cart recovery emails
- SEO-optimized product URLs and meta descriptions
- Inventory tracking and low-stock alerts
${platform.id === 'shopify' ? '- Use Shopify Metafields for custom product attributes\n- Set up Shopify Analytics and Google Analytics 4' : ''}
${platform.id === 'woocommerce' ? '- Use WooCommerce Blocks for modern page layouts\n- Set up WooCommerce Subscriptions if recurring billing needed' : ''}`,
  },

  // ── Form Builders ─────────────────────────────────────────────────────────
  {
    categoryId: 'Form Builders',
    fields: [
      { ...appNameField, label: 'Form Name' },
      {
        id: 'purpose',
        label: 'Form Purpose',
        placeholder: '',
        type: 'select',
        options: ['Lead generation', 'Customer survey', 'Job application', 'Event registration', 'Product order', 'Feedback / NPS', 'Contact form', 'Onboarding questionnaire'],
        required: true,
      },
      audienceField,
      {
        id: 'fields',
        label: 'Fields to collect (one per line)',
        placeholder: 'Full name\nEmail address\nCompany size (dropdown)\nMain challenge (multi-select)\nMessage (paragraph)',
        type: 'textarea',
        required: true,
      },
      {
        id: 'logic',
        label: 'Conditional Logic (optional)',
        placeholder: 'Show "Budget" field only if Company Size > 50\nSkip to Thank You if user selects "Not interested"',
        type: 'textarea',
        required: false,
      },
      {
        id: 'thankYou',
        label: 'Thank You / Confirmation message',
        placeholder: "Thanks! We'll be in touch within 24 hours.",
        type: 'text',
        required: false,
      },
      {
        id: 'integrations',
        label: 'Where to send responses',
        placeholder: 'Email notification, Google Sheets, HubSpot CRM, Slack',
        type: 'text',
        required: false,
      },
    ],
    generate: (platform: Platform, v: Record<string, string>) => `Create a form called "${v.appName}" using ${platform.name}.

## Purpose
${v.purpose}

## Audience
${v.audience}

## Fields
${v.fields
  .split('\n')
  .filter(Boolean)
  .map((f, i) => `${i + 1}. ${f.trim()}`)
  .join('\n')}

${v.logic ? `## Conditional Logic\n${v.logic.split('\n').filter(Boolean).map((l) => `- ${l.trim()}`).join('\n')}` : ''}

## After Submission
- Thank you message: "${v.thankYou || 'Thank you! We\'ll be in touch soon.'}"
- ${v.integrations ? `Send to: ${v.integrations}` : 'Send email notification to admin'}

## Design Requirements
- Clean, minimal layout — one key question per screen if conversational
- Progress indicator for multi-step forms
- Mobile-optimized with large tap targets
- Field validation with helpful error messages
- Auto-save progress on multi-step forms
${platform.id === 'typeform' ? '- Use Typeform\'s conversational one-at-a-time format\n- Add a welcome screen with context before first question' : ''}
${platform.id === 'jotform' ? '- Use Jotform\'s conditional logic engine for branching\n- Enable spam protection with CAPTCHA' : ''}`,
  },
];

export const getTemplateForPlatform = (platform: Platform): PromptTemplate => {
  const template = promptTemplates.find(
    (t) => t.categoryId === platform.category
  );
  // Fall back to AI App Generators template as a generic default
  return template ?? promptTemplates[0];
};
