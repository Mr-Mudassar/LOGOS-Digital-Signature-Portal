# Design System & Best Practices

## ✅ Implemented Changes

### 1. **Consistent Green Theme**

- Primary color: Emerald/Green (#10B981 - HSL: 160 84% 39%)
- All shadcn/ui components now use green theme
- Consistent with Lagos State branding

### 2. **Standardized Loaders**

Created centralized loader components in `components/ui/loader.tsx`:

- `<Loader />` - Basic spinner with size options (sm, md, lg, xl)
- `<ButtonLoader />` - Inline spinner for buttons
- `<PageLoader />` - Full page centered loader
- `<OverlayLoader />` - Semi-transparent overlay loader

**Usage:**

```tsx
import { Loader, PageLoader, OverlayLoader, ButtonLoader } from '@/components/ui/loader'

// Full page
<PageLoader text="Loading dashboard..." />

// Overlay
<OverlayLoader text="Saving..." />

// Button
<Button disabled={loading}>
  {loading && <ButtonLoader className="mr-2" />}
  Submit
</Button>
```

### 3. **Consistent Button Sizes**

Updated default button sizes:

- **default**: h-10 px-6 (40px height, 24px padding)
- **sm**: h-9 px-4 (36px height, 16px padding)
- **lg**: h-11 px-8 (44px height, 32px padding)
- **icon**: h-10 w-10 (40px square)

All buttons across the app now have uniform sizing.

### 4. **Icon System**

- ✅ **Only Lucide React icons** used throughout the application
- No other icon libraries imported
- Consistent icon sizing: `w-5 h-5` (20px) for most, `w-4 h-4` (16px) in buttons

---

## 📋 Additional Best Practices to Follow

### **1. Component Organization**

```
components/
  ├── ui/              # Shadcn base components (Button, Input, etc.)
  ├── dashboard/       # Feature-specific components
  └── [feature]/       # Group related components
```

### **2. Consistent Spacing**

- Use Tailwind spacing scale consistently
- Gap: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)
- Padding: `p-4`, `p-6`, `p-8` for cards/containers
- Margin: Prefer gap/space-y over individual margins

### **3. Typography Hierarchy**

```tsx
// Page titles
<h1 className="text-3xl font-bold text-gray-900">

// Section titles
<h2 className="text-xl font-semibold text-gray-900">

// Card titles
<h3 className="text-lg font-medium text-gray-900">

// Body text
<p className="text-gray-600">

// Small text
<p className="text-sm text-gray-500">
```

### **4. Color Consistency**

```tsx
// Backgrounds
bg - white // Cards, modals
bg - gray - 50 // Page backgrounds
bg - gray - 100 // Hover states

// Text
text - gray - 900 // Primary text
text - gray - 600 // Secondary text
text - gray - 500 // Muted text

// Borders
border - gray - 200 // Default borders
border - gray - 300 // Hover borders
```

### **5. Loading States**

Always show loading feedback:

```tsx
// Page level
{
  loading && <PageLoader text="Loading..." />
}

// Component level
{
  loading ? <Loader size="md" /> : <Content />
}

// Button level
;<LoadingButton loading={saving} loadingText="Saving...">
  Save
</LoadingButton>
```

### **6. Error Handling**

Consistent error display:

```tsx
{
  error && (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-800">{error}</p>
    </div>
  )
}
```

### **7. Form Validation**

```tsx
// Label + Input pattern
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
  <input
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    required
  />
</div>
```

### **8. Responsive Design**

```tsx
// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
```

### **9. Accessibility**

- Always include `aria-label` for icon-only buttons
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Ensure focus states are visible
- Maintain color contrast ratios (4.5:1 minimum)

### **10. Performance**

- Use `loading="lazy"` for images
- Implement code splitting for large pages
- Avoid unnecessary re-renders with `useMemo`, `useCallback`
- Use React Server Components where possible

### **11. File Naming**

```
PascalCase    # Components: Button.tsx, UserProfile.tsx
kebab-case    # Routes: forgot-password/, reset-password/
camelCase     # Utilities: utils.ts, auth.ts
```

### **12. State Management**

```tsx
// Local state for UI
const [open, setOpen] = useState(false)

// Server state with proper loading/error
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
```

### **13. API Error Handling**

```tsx
try {
  const response = await axios.get('/api/endpoint')
  setData(response.data)
} catch (err: any) {
  setError(err.response?.data?.error || 'An error occurred')
} finally {
  setLoading(false)
}
```

### **14. Consistent Animations**

```tsx
// Transitions
transition-colors    # For hover states
transition-all       # For complex changes

// Durations
duration-150        # Fast (hover)
duration-300        # Normal (modals)
```

### **15. Code Organization**

```tsx
// Component structure
1. Imports
2. Types/Interfaces
3. Constants
4. Component function
5. State
6. Effects
7. Handlers
8. Render helpers
9. Return JSX
```

---

## 🎨 Design Token Reference

### Spacing Scale

- `1` = 4px
- `2` = 8px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `12` = 48px

### Border Radius

- `rounded` = 4px
- `rounded-md` = 6px
- `rounded-lg` = 8px
- `rounded-xl` = 12px
- `rounded-2xl` = 16px

### Shadow Scale

- `shadow-sm` = Subtle
- `shadow` = Default
- `shadow-md` = Medium
- `shadow-lg` = Large
- `shadow-xl` = Extra large

---

## 🚀 Next Steps to Improve

1. **Add input validation library** (react-hook-form + zod)
2. **Implement toast notifications** (sonner or react-hot-toast)
3. **Add skeleton loaders** for better perceived performance
4. **Create a Storybook** for component documentation
5. **Add E2E tests** (Playwright or Cypress)
6. **Implement analytics** (track user interactions)
7. **Add error boundary** for graceful error handling
8. **Optimize images** (next/image with proper sizing)
9. **Add loading skeletons** instead of spinners where appropriate
10. **Create a style guide document** for the team
