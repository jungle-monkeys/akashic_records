# Textom Book – Personalized eTextbook Platform

## Project Rules for Next.js-based eTextbook Service Development

---

## 📁 Project Structure & Architecture

- All page routing must be created under the `src/app/` directory.
- Common/shared resources should be placed in centralized folders:
    - `src/components/` → **Global UI components**
    - `src/apis/` → **Shared API functions**
    - `src/constants/` → **Global constants**
    - `src/utils/` → **Common utility functions (grouped by functionality)**

- Route-specific or feature-specific resources should be placed in underscore-prefixed folders within their respective route directories:
    - `src/app/textbooks/_components/` → **Page-specific components**
    - `src/app/reader/_lib/` → **Page-specific utility functions**
    - `src/app/search/_apis/` → **Page-specific API functions**

- Use `[id]` folder naming convention for dynamic routes.
- Define domain models in `src/types/` for type safety (e.g., `Textbook.ts`, `User.ts`, `Subscription.ts`).

---

## 🎨 Design System & Styling

### UI Component Library

- **Primary**: Use **shadcn/ui** components for all basic UI elements
- **Secondary**: Use **Tailwind CSS** for custom styling, layout, and spacing
- **Icons**: Use **lucide-react** for consistent iconography

### Design System Guidelines

#### shadcn/ui Components (우선 사용)

- **Basic Components**: Button, Input, Form, Table, Modal, Card, Typography
- **Data Display**: DatePicker, Select, Upload, Tree, Timeline, Badge
- **Layout**: Layout, Grid, Space, Divider
- **Feedback**: Toast, Notification, Spinner, Progress, Alert
- **Navigation**: Menu, Breadcrumb, Pagination, Steps, Tabs
- **Interactive**: Dialog, Popover, Dropdown, Tooltip, Accordion, Slider

#### Tailwind CSS (스타일링 & 레이아웃)

- **Layout & Spacing**: Use Tailwind for margins, padding, positioning
- **Responsive Design**: Implement responsive breakpoints (mobile-first approach)
- **Custom Styling**: Customize shadcn/ui components with Tailwind classes
- **Color System**: Use consistent color tokens (primary, secondary, success, warning, error)
- **Animation**: Use tailwindcss-animate for smooth transitions and page interactions

#### Best Practices

- **Component Priority**: Always check if shadcn/ui has a suitable component before creating custom ones
- **Copy & Customize**: Copy shadcn/ui components to your project and customize as needed
- **Consistency**: Maintain visual consistency with shadcn/ui's design language
- **Accessibility**: Leverage Radix UI's built-in accessibility features (ARIA labels, keyboard navigation)
- **Styling**: Use class-variance-authority, clsx, and tailwind-merge for advanced styling

---

## 🧠 State Management

- **Client state**: Managed using `Zustand` (e.g., authentication, search filters, reading progress, UI state, recommendation preferences).
- **Server state**: Managed using `@tanstack/react-query` (e.g., textbook data, user profiles, subscription status, ratings, recommendations).
- Global context providers should be placed in the `src/providers/` directory.
- Cache management: Configure TanStack Query with appropriate staleTime and cacheTime for textbook and user data.

---

## 📝 Form & Validation

- Use `react-hook-form` for all form handling (search forms, subscription forms, user settings).
- Define form validation rules using `Zod` schemas.
- Integrate Zod with React Hook Form using `@hookform/resolvers`.
- Use shadcn/ui's Form components for consistent form styling.
- Leverage Radix UI's form primitives for accessibility.
- Validate book metadata, user preferences, and subscription data before submission.

---

## 🔍 Core Feature Requirements

### Search & Discovery
- Implement AI-powered question-based search and keyword search to find relevant textbooks.
- Support filtering by language, subject, difficulty level, and rating.
- Store and display book metadata including author, publisher, ISBN, and subject tags.
- Implement recommendation algorithm based on user search history and learning patterns.

### eTextbook Reader
- Develop responsive reader interface for displaying textbook chapters.
- Support chapter-based navigation and page bookmarking.
- Implement reading progress tracking (persist to user database).
- Display hyperlinks to external resources (LMS, Wikipedia, online lectures).

### Problem Solving System
- Build a practice problem database linked to each textbook.
- Provide chapter-based and topic-based problem filtering.
- Track problem-solving history and accuracy rates.
- Implement wrong answer notebook and problem bookmarking for repeated practice.
- Support various question types including multiple choice, short answer, and essay questions.

### Study Note Sharing Platform
- Implement community features for users to upload and share study notes.
- Tag and categorize notes by textbook and chapter.
- Enable likes, comments, and bookmark features to recommend popular notes.
- Provide reward systems with points or badges for note contributors.
- Support search and filtering to easily find notes on desired topics.

<!-- ### User Database & Analytics
- Collect user statistics on textbook usage and learning patterns.
- Track problem-solving accuracy and learning progress.
- Store user preferences for personalized recommendations.
- Implement user review and rating system for books and study notes.

### Subscription & Payment System
- Support multiple subscription tiers: Student, Professional, Premium.
- Implement monthly and semester-based subscription periods.
- Track usage time for revenue distribution to publishers.
- Generate invoicing and payment management.

### Publisher & School Integration
- Create CMS for publishers to manage and upload eTextbooks and practice problems.
- Support LMS integration for linking course materials with textbooks.
- Provide analytics dashboard for publishers showing usage metrics.
- Enable school and company contracts with bulk subscription management. -->

---

## 📊 Database Schema Guidelines

### Key Models

- **User**: id, email, authProvider, preferences, subscriptionTier, createdAt, updatedAt
- **Textbook**: id, title, author, isbn, publisherId, chapters, concepts (tags), language, level, coverImage, createdAt, updatedAt
- **Chapter**: id, textbookId, title, number, content, concepts
- **Subscription**: id, userId, tier, status, startDate, endDate, renewalDate
- **ReadingHistory**: id, userId, textbookId, chapterId, lastPage, timeSpent, completedAt
- **Rating**: id, userId, textbookId, score, review, createdAt
- **Publisher**: id, name, contactEmail, contractStatus, earnings, createdAt, updatedAt

---

## ✅ Code Quality

- All components and functions must have proper TypeScript type definitions.
- Follow ESLint rules, including those provided by Next.js and TypeScript.
- Maintain consistent code formatting using Prettier.
- Use strict mode in TypeScript (`strict: true` in tsconfig.json).
- Implement error boundaries for graceful error handling.
- Add comprehensive error logging and monitoring.

---

## 🗂️ File & Folder Naming

- Use **PascalCase** for component filenames (e.g., `TextbookCard.tsx`, `SearchBar.tsx`).
- Use **kebab-case** for folder names (e.g., `textbook-card/`, `search-bar/`).
- Use an underscore (`_`) prefix for folders excluded from routing (e.g., `_components`, `_lib`, `_apis`, `_hooks`).
- Use **camelCase** for utility functions and hooks (e.g., `useTextbookSearch.ts`, `formatSubscriptionDate.ts`).
- Shared resources go into top-level folders under `src/`, while page-specific resources are placed in route-specific `_` folders.

---

## 🔐 API & Backend Integration

- Define API endpoints with clear request/response types using Zod or TypeScript interfaces.
- Use server actions for mutations and sensitive operations.
- Implement proper error handling and validation on both client and server.
- Use middleware for authentication verification on protected routes.
- Separate API calls by domain (e.g., `textbookApi.ts`, `userApi.ts`, `subscriptionApi.ts`).

---

## 📱 Mobile & Responsive Design

- Design with mobile-first approach using Tailwind CSS breakpoints.
- Ensure reader interface is fully functional on tablets and mobile devices.
- Test responsive behavior on various screen sizes (sm, md, lg, xl, 2xl).
- Optimize performance for slower network connections.
- Implement touch-friendly interactions for mobile navigation.

---

## 📌 Summary

- **Shared resources** → `src/components/`, `src/apis/`, `src/utils/`, `src/constants/`, `src/types/`
- **Page-specific resources** → `src/app/[route]/_components/`, `_lib/`, `_apis/`, `_hooks/`
- **UI Components** → **shadcn/ui first**, Tailwind CSS for custom styling
- **Design System** → Maintain consistency with shadcn/ui's design language
- **Icons** → **lucide-react** for consistent iconography
- **State Management** → Zustand for client state, TanStack Query for server state
- **Feature Focus** → Concept-based search, personalized recommendations, multi-tier subscriptions
- **Database** → Type-safe models for users, textbooks, chapters, subscriptions, and analytics
