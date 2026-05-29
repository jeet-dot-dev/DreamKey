# Broker List Component Documentation

## Overview

A mobile-friendly, feature-rich broker list component built with Next.js 15, shadcn/ui, and Tailwind CSS. The component provides a responsive interface for managing broker information with advanced filtering, search, and pagination capabilities.

## Features

### ✅ Responsive Design
- **Mobile (< 768px)**: Card-based layout with essential information (Name, Status, Phone)
- **Tablet (768px - 1024px)**: Transitional layout
- **Desktop (> 1024px)**: Full table layout with all columns visible

### ✅ Search Functionality
1. **Broker Name Search**: Real-time search by broker name (case-insensitive)
2. **Area of Operation Search**: Filter brokers by their operational areas
Both searches work in combination with filters.

### ✅ Advanced Filters (Collapsible on Mobile)
- **Status Filter**: ACTIVE, INACTIVE, or BLOCKED
- **Primary Contact Partner**: Filter by assigned partner
- **Budget Range**: Min and Max budget filters with numeric input
- **Date Range Filter**: Filter by creation date (From/To date pickers)

All filters are combinable and work with search in real-time.

### ✅ Pagination
- **10 brokers per page** (configurable via `BROKERS_PER_PAGE` constant)
- Previous/Next navigation buttons
- Current page indicator
- Disabled buttons at start/end

### ✅ Action Buttons (Per Row)
- **View**: Navigate to broker overview
- **Edit**: Navigate to broker edit page
- **Interaction**: Create new interaction log for broker

### ✅ UI/UX Features
- Loading skeleton states for both mobile and desktop
- Empty state messaging when no results found
- Currency formatting (₹, L for Lakhs, Cr for Crores)
- Color-coded status badges with dark mode support
- Smooth transitions and hover effects
- Fully accessible components

## File Structure

```
frontend/
├── app/
│   └── broker/
│       └── lists/
│           └── page.tsx          # Main component
├── components/
│   └── ui/
│       ├── button.tsx            # Button component
│       ├── input.tsx             # Input component
│       ├── select.tsx            # Select/dropdown component
│       ├── collapsible.tsx       # Collapsible component
│       ├── skeleton.tsx          # Loading skeleton component
│       └── table.tsx             # Table component (existing)
```

## Component Structure

### Main Components

```typescript
// Page Component
BrokerListPage
├── FilterSection (with Collapsible)
├── MobileCards (md:hidden)
├── DesktopTable (hidden md:block)
└── Pagination
```

### Sub-components
- **BrokerCard**: Mobile card layout displaying broker info
- **FilterSection**: Collapsible advanced filters
- **Pagination**: Navigation between pages
- **BrokerListSkeleton**: Loading state
- **EmptyState**: No results state

## Data Structure

### Broker Interface
```typescript
interface Broker {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  budgetMin?: number;
  budgetMax?: number;
  areaOfOperation?: string;
  primaryContactPartner?: string;
  createdAt: Date;
}
```

### Mock Data
The component includes 12 sample brokers for development/demonstration purposes. Replace with API calls when ready for production.

## Styling

### Theme Variables Used
- **Primary**: Main brand color for buttons and links
- **Secondary**: Secondary UI elements
- **Muted**: Text and disabled states
- **Destructive**: For BLOCKED status
- **Background/Foreground**: Base colors
- **Card/CardForeground**: Card backgrounds and text

### Tailwind Breakpoints
- **sm**: 640px (mobile)
- **md**: 768px (tablet/desktop threshold)
- **lg**: 1024px
- **xl**: 1280px

### Dark Mode
Full dark mode support via theme variables with proper contrast ratios.

## Key Features Implementation

### 1. Real-time Filtering
```typescript
const filteredBrokers = useMemo(() => {
  return MOCK_BROKERS.filter((broker) => {
    // Name search check
    // Area search check
    // Status filter check
    // Partner filter check
    // Budget range check
    // Date range check
  });
}, [searchName, searchArea, filters]);
```

### 2. Pagination
```typescript
const totalPages = Math.ceil(filteredBrokers.length / BROKERS_PER_PAGE);
const paginatedBrokers = useMemo(() => {
  const startIndex = (currentPage - 1) * BROKERS_PER_PAGE;
  return filteredBrokers.slice(startIndex, startIndex + BROKERS_PER_PAGE);
}, [filteredBrokers, currentPage]);
```

### 3. Currency Formatting
- Numbers >= 10,000,000 formatted as Crores (Cr)
- Numbers >= 100,000 formatted as Lakhs (L)
- Smaller amounts shown with rupee symbol (₹)

### 4. Status Badges
Status color coding with dark mode support:
- **ACTIVE**: Green badge
- **INACTIVE**: Yellow badge
- **BLOCKED**: Red badge

## Usage

### Basic Import
```typescript
import BrokerListPage from '@/app/broker/lists/page';
```

### Routing
The component automatically routes to:
- `/broker/overview?id={brokerId}` for View
- `/broker/add-listing?id={brokerId}` for Edit
- `/broker/interaction/add?id={brokerId}` for Interaction

### Customization

#### Change Brokers Per Page
```typescript
const BROKERS_PER_PAGE = 20; // Default: 10
```

#### Modify Partner List
Update the `SelectContent` in `FilterSection` with actual partner names from your database.

#### Connect to Real API
Replace `MOCK_BROKERS` with an API call:
```typescript
const [brokers, setBrokers] = useState<Broker[]>([]);

useEffect(() => {
  fetchBrokers().then(setBrokers);
}, []);
```

## Performance Considerations

1. **useMemo**: Filtering logic is memoized to prevent unnecessary recalculations
2. **useCallback**: Action handlers use useCallback for stable references
3. **Lazy Rendering**: Only visible items rendered on current page
4. **Skeleton Loading**: Provides visual feedback during data loading

## Accessibility

- Semantic HTML elements
- Proper ARIA labels on buttons
- Keyboard navigation support
- Color-independent status indication
- Proper heading hierarchy
- Form labels associated with inputs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **Export to CSV**: Add export functionality
2. **Bulk Operations**: Select multiple brokers for batch actions
3. **Advanced Sorting**: Sort by any column
4. **Saved Filters**: Save frequently used filter combinations
5. **API Integration**: Connect to real backend API
6. **Real-time Updates**: WebSocket support for live updates
7. **Broker Details Modal**: Quick preview without navigation
8. **Interaction History**: View recent interactions inline

## Dependencies

- Next.js 15
- React 19
- TailwindCSS 4.2
- lucide-react (icons)
- @radix-ui/* (unstyled components)
- shadcn/ui (styled components)
- class-variance-authority (CVA for variants)
- tailwind-merge (class merging)

## Troubleshooting

### Components Not Found
If component imports fail:
1. Ensure all `.tsx` files exist in `/components/ui/`
2. Restart VS Code development server
3. Check `tsconfig.json` paths configuration

### Styling Issues
1. Verify Tailwind CSS is properly configured
2. Check theme variables in `globals.css`
3. Ensure PostCSS is running

### Filtering Not Working
1. Check filter state in React DevTools
2. Verify mock data matches Broker interface
3. Check browser console for errors

## License

Internal Use - DreamKey Project
