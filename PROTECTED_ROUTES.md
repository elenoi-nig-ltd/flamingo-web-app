# Protected Routes Implementation

This document explains how the authentication and route protection system works in the Flamingo application.

## Overview

The application uses a **multi-layer protection approach** for admin routes:

1. **Layout-based Protection** (Primary)
2. **Component-level Protection** (Reusable)
3. **Middleware** (Additional layer)

## Architecture

### 1. Layout-based Protection (Recommended)

**File:** `frontend/src/app/admin/dashboard/layout.tsx`

All routes under `/admin/dashboard/*` are automatically protected by this layout:

```tsx
/admin/dashboard/          ✅ Protected
/admin/dashboard/users/    ✅ Protected
/admin/dashboard/products/ ✅ Protected
/admin/dashboard/orders/   ✅ Protected
... and all other dashboard routes
```

**Features:**
- Checks if user is authenticated
- Verifies user role (admin, staff, or super_admin)
- Shows loading state while checking authentication
- Automatically redirects unauthorized users
- Redirects landlords to their own dashboard

### 2. Component-level Protection (Reusable)

**File:** `frontend/src/components/ProtectedRoute.tsx`

Use this component to protect individual pages or components:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <YourComponent />
    </ProtectedRoute>
  );
}
```

**Props:**
- `allowedRoles`: Array of roles allowed to access (default: `['admin', 'staff', 'super_admin']`)
- `redirectTo`: Where to redirect if not authenticated (default: `'/admin/login'`)

### 3. Authentication Hook

**File:** `frontend/src/hooks/useAuth.ts`

Provides authentication state and methods:

```tsx
const { user, loading, error, login, register, logout } = useAuth();
```

**Properties:**
- `user`: Current user object (includes id, email, name, role)
- `loading`: Boolean indicating auth state is being loaded
- `error`: Error message if authentication failed

**Methods:**
- `login(email, password)`: Authenticate user
- `register(name, email, password, role)`: Register new user
- `logout()`: Clear authentication and redirect

## User Roles

The system supports the following roles:

- **admin**: Full administrative access
- **staff**: Standard administrative access
- **super_admin**: Highest level access
- **landlord**: Property owner access (redirected to `/landlord/dashboard`)

## Public Routes

These routes are accessible without authentication:

- `/admin/login` - Admin login page
- `/admin/register` - Admin registration page
- `/` - Home page
- Any other non-admin routes

## How It Works

### Authentication Flow

1. **Initial Load:**
   - `useAuth` hook checks for token in localStorage
   - If token exists, validates with backend
   - Sets user state if valid

2. **Protected Route Access:**
   - User tries to access `/admin/dashboard`
   - Layout checks authentication status
   - If not authenticated → redirect to `/admin/login`
   - If wrong role → redirect to appropriate page or show error

3. **Login:**
   - User submits credentials
   - Backend validates and returns token + user data
   - Token stored in localStorage
   - User redirected based on role

4. **Logout:**
   - Token and user data cleared from localStorage
   - User redirected to login page

## Implementation Examples

### Protecting a New Admin Page

Simply create the page under `/admin/dashboard/`:

```tsx
// frontend/src/app/admin/dashboard/my-new-page/page.tsx
import MyComponent from '@/components/MyComponent';

export default function MyNewPage() {
  return <MyComponent />;
}
```

That's it! The layout automatically protects it.

### Protecting a Component (Not a Full Page)

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

function MyComponent() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Checking Auth State in a Component

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Role-based Rendering

```tsx
import { useAuth } from '@/hooks/useAuth';

function AdminPanel() {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'super_admin' && (
        <button>Delete All Users</button>
      )}
      {['admin', 'super_admin'].includes(user?.role || '') && (
        <button>Manage Users</button>
      )}
    </div>
  );
}
```

## Security Notes

1. **Client-side Protection:** The current implementation uses client-side checks. For sensitive operations, always verify authentication on the backend.

2. **Token Storage:** Tokens are stored in localStorage. For production, consider:
   - Using httpOnly cookies
   - Implementing token refresh
   - Adding token expiration handling

3. **Backend Verification:** All API calls should verify the token server-side using JWT guards.

4. **Protected API Routes:** The backend already has JWT guards on protected endpoints.

## Testing

### Test Authentication

1. Try accessing `/admin/dashboard` without logging in
   - ✅ Should redirect to `/admin/login`

2. Login with admin credentials
   - ✅ Should redirect to `/admin/dashboard`

3. Try accessing admin routes with landlord account
   - ✅ Should redirect to `/landlord/dashboard`

4. Logout and try accessing dashboard
   - ✅ Should redirect to `/admin/login`

## Troubleshooting

### "Always redirecting to login"

- Check browser console for errors
- Verify token is in localStorage: `localStorage.getItem('token')`
- Check backend is running and accessible
- Verify backend `/auth/profile` endpoint works

### "Access Denied" even with correct role

- Check user role in localStorage: `JSON.parse(localStorage.getItem('user'))?.role`
- Verify role matches allowed roles in layout/ProtectedRoute
- Clear localStorage and login again

### "Loading..." forever

- Check browser console for errors
- Verify backend is accessible
- Check network tab for failed requests
- Try clearing localStorage and logging in again

## Files Modified/Created

- ✅ Created: `frontend/src/app/admin/dashboard/layout.tsx`
- ✅ Updated: `frontend/src/components/ProtectedRoute.tsx`
- ✅ Updated: `frontend/src/app/admin/dashboard/page.tsx`
- ✅ Created: `frontend/middleware.ts`
- ✅ Existing: `frontend/src/hooks/useAuth.ts`

## Next Steps (Optional Enhancements)

1. **Add Token Refresh:** Implement automatic token refresh before expiration
2. **Add Cookie-based Auth:** Use httpOnly cookies for better security
3. **Add Session Timeout:** Auto-logout after period of inactivity
4. **Add Remember Me:** Option to persist login longer
5. **Add 2FA:** Two-factor authentication for admins
6. **Add Audit Logging:** Log all admin actions
