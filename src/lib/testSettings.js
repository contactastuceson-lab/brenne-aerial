/**
 * Test file for settings functions
 * This helps verify that all settings-related functions work correctly
 */

import { base44 } from '@/api/base44Client';

export async function testSettingsFunctions() {
  console.log('🧪 Testing Settings Functions...');

  const testEmail = 'test@example.com';
  
  try {
    // Test 1: Get preferences (should return defaults if not found)
    console.log('📝 Test 1: Get User Preferences');
    const getResult = await base44.functions.invoke('getUserPreferences', {
      user_email: testEmail,
    });
    console.log('✅ getUserPreferences works:', getResult);

    // Test 2: Update preferences
    console.log('📝 Test 2: Update User Preferences');
    const updateResult = await base44.functions.invoke('updateUserPreferences', {
      user_email: testEmail,
      preferences: {
        theme: 'dark',
        language: 'en',
        email_notifications: false,
      },
    });
    console.log('✅ updateUserPreferences works:', updateResult);

    // Test 3: Check if logAuditAction exists
    console.log('📝 Test 3: Log Audit Action');
    const auditResult = await base44.functions.invoke('logAuditAction', {
      user_email: testEmail,
      action_type: 'test_action',
      description: 'Test audit log',
      is_sensitive: false,
    });
    console.log('✅ logAuditAction works:', auditResult);

    console.log('✅ All tests passed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run tests if in development
if (typeof window !== 'undefined' && window.__TEST_SETTINGS__) {
  testSettingsFunctions().then(console.log);
}

export default testSettingsFunctions;
