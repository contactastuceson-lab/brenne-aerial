# User Settings & Preferences Implementation Guide

## Overview
This implementation provides a fully functional user settings system with persistent storage, real-time preferences application, and comprehensive audit logging.

## Architecture

### Backend (Base44)

#### Entity: `UserPreferences`
Stores all user preferences in a single record per user:
- **user_email** (string) - Primary key
- **Language** (fr/en/es/de) - Default: fr
- **Theme** (auto/light/dark) - Default: auto
- **Display Preferences** (compact_mode, show_online_status)
- **Notification Preferences** (9 different toggles)
- **Timestamps** (created_at, updated_at)

#### Functions:

**getUserPreferences()**
- Fetches stored preferences or returns defaults
- Input: `{ user_email }`
- Output: `{ preferences: {...} }`

**updateUserPreferences()**
- Creates or updates user preferences in database
- Automatically logs the action
- Input: `{ user_email, preferences: {...} }`
- Output: `{ success: true, preferences: {...} }`

**changeUserPassword()**
- Validates and changes user password
- Logs sensitive action to AuditLog
- Input: `{ user_email, current_password, new_password }`
- Output: `{ success: true, message: '...' }`

**updateAccountInfo()**
- Updates user profile information
- Input: `{ user_email, first_name, last_name, display_name, bio }`
- Output: `{ success: true, user: {...} }`

### Frontend (React)

#### Hook: `useUserPreferences(user)`
```javascript
const { preferences, isLoading, theme, language, compactMode } = useUserPreferences(user);
```
- Automatically loads and applies preferences
- Applies theme to DOM
- Saves language to localStorage
- Updates on user change

#### Component: `PreferencesApplier`
- Appliedautomatically in App.jsx
- Loads user preferences on authentication
- Applies theme, language, and display settings globally
- No visual component - purely functional

#### Settings Components:

**AccountSettings**
- Edit personal information (name, bio, etc.)
- Change password with strength validation
- Uses `updateAccountInfo()` and `changeUserPassword()`

**PreferencesSettings**
- Choose language (4 options)
- Choose theme (3 options)
- Toggle compact mode
- Toggle online status visibility
- Uses `updateUserPreferences()`

**NotificationSettings**
- 9 different notification toggles
- Organized into 3 categories
- Uses `updateUserPreferences()`

## Usage Examples

### Load User Preferences
```javascript
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function MyComponent({ user }) {
  const { preferences, isLoading } = useUserPreferences(user);
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Language: {preferences.language}</div>;
}
```

### Update Preferences Programmatically
```javascript
import { saveUserPreferences } from '@/lib/settingsUtils';

async function changeLanguage(userEmail, newLanguage) {
  const result = await saveUserPreferences(userEmail, {
    language: newLanguage,
  });
  
  if (result.success) {
    console.log('Language changed:', result.data);
  }
}
```

### Check User Preferences in Components
```javascript
// In any component that has access to user
const { preferences } = useUserPreferences(user);

// Apply settings
if (preferences?.compact_mode) {
  // Show compact UI
}

if (preferences?.show_online_status) {
  // Show online indicator
}

// Check notification preferences
if (preferences?.email_notifications) {
  // Can send email
}
```

## Data Flow

1. **Authentication**
   - User logs in → `App.jsx` → `AuthenticatedApp` renders
   - `PreferencesApplier` component mounts with `user` prop

2. **Loading Preferences**
   - `useUserPreferences()` hook fetches from `getUserPreferences()`
   - Backend returns stored prefs or defaults
   - Cached for 10 minutes

3. **Applying Preferences**
   - Theme applied to `document.documentElement`
   - Language saved to `localStorage`
   - Saved to `localStorage` for offline access
   - Component re-renders with new prefs

4. **Updating Preferences**
   - User changes setting in Settings page
   - Call `updateUserPreferences()` function
   - Backend saves to `UserPreferences` entity
   - Audit log created
   - Cache invalidated
   - Component re-fetches and applies new prefs

## Persistence Strategy

### Primary Storage
- **Database**: All preferences stored in `UserPreferences` entity
- **Lifetime**: Persistent until user deletes account

### Secondary Storage
- **localStorage**: Theme preference (color scheme)
- **localStorage**: User language preference
- **localStorage**: Notification preferences (backup)
- **Purpose**: Offline support and fast loading

### Memory
- **React Query Cache**: 10-minute stale time
- **Component State**: Real-time UI state during editing

## Error Handling

### Graceful Degradation
- If `getUserPreferences()` fails → return defaults
- If `updateUserPreferences()` fails → show toast error
- If theme application fails → do nothing
- All errors logged to console

### User Feedback
- Toast notifications (Sonner) for success/error
- Loading states for async operations
- Inline error messages for form validation

## Testing

### Manual Testing
```javascript
// In browser console on a logged-in user:
import { testSettingsFunctions } from '@/lib/testSettings';
window.__TEST_SETTINGS__ = true;
testSettingsFunctions();
```

### Automated Testing
```javascript
// Test that preferences load
const { result } = renderHook(() => useUserPreferences(mockUser));
expect(result.current.preferences).toBeDefined();

// Test that preferences update
const updateResult = await saveUserPreferences(email, { theme: 'dark' });
expect(updateResult.success).toBe(true);
```

## Security Considerations

### Sensitive Actions Logged
- Password changes ✅
- Profile updates ✅
- Preference changes ✅

### Data Validation
- Password strength checked (8+ chars, uppercase, number, special char)
- Email not changeable via settings (must contact support)
- All inputs validated before sending to backend

### Access Control
- Users can only access their own preferences
- Backend verifies `user_email` matches authenticated user
- Audit logs track all changes with IP and user agent

## Troubleshooting

### Preferences Not Loading
1. Check browser console for errors
2. Verify `user.email` is available
3. Check network tab for failed function calls
4. Ensure `UserPreferences` entity is registered

### Theme Not Applying
1. Verify `document.documentElement` exists
2. Check that theme value is one of: auto/light/dark
3. Verify no CSS conflicts with theme classes
4. Check localStorage for saved theme value

### Notifications Not Working
1. Check that `updateUserPreferences()` is being called
2. Verify notification preferences saved to database
3. Implement notification check in sending functions:
   ```javascript
   const prefs = localStorage.getItem('notification-prefs');
   if (JSON.parse(prefs).email_notifications) {
     // Send email
   }
   ```

## Future Improvements

- [ ] Multi-language support for app content (i18n)
- [ ] SMS notifications preferences
- [ ] Email digest preferences (daily/weekly/monthly)
- [ ] Custom notification times (quiet hours)
- [ ] Two-factor authentication recovery codes display
- [ ] Login history integration
- [ ] Device management integration
- [ ] Data export preferences (format, content)
- [ ] Auto-logout timeout setting
- [ ] Password expiration policy

## Files Modified

### Backend
- `base44/entities/UserPreferences.jsonc` (NEW)
- `base44/functions/updateUserPreferences/index.js` (NEW)

### Frontend
- `src/components/settings/AccountSettings.jsx` (UPDATED)
- `src/components/settings/NotificationSettings.jsx` (UPDATED)
- `src/components/settings/PreferencesSettings.jsx` (UPDATED)
- `src/components/settings/PreferencesApplier.jsx` (NEW)
- `src/components/settings/UserSettings.jsx` (UNCHANGED)
- `src/components/security/SecurityAndPrivacy.jsx` (UNCHANGED)
- `src/hooks/useUserPreferences.js` (NEW)
- `src/lib/settingsUtils.js` (NEW)
- `src/lib/testSettings.js` (NEW)
- `src/App.jsx` (UPDATED - integrated PreferencesApplier)
