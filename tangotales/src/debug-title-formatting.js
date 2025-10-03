/**
 * Test Script for Title Formatting
 * 
 * Run this in browser console to test title formatting functionality
 */

const testTitleFormatting = async () => {
  try {
    console.log('🧪 Testing Title Formatting...');
    
    // Import the utility functions
    const { formatSongTitle, prepareTitle, generateSongId } = await import('./utils/titleFormatter.js');
    
    console.log('✅ Title formatting utilities imported successfully');
    
    // Test cases for title formatting
    const testCases = [
      'la cumparsita',
      'EL CHOCLO',
      'por una cabeza',
      'ADIÓS MUCHACHOS',
      'nostalgias',
      'el día que me quieras',
      'LA MOROCHA',
      'mi buenos aires querido',
      'TANGO DE LOS EXILIADOS',
      'milonga del ayer'
    ];
    
    console.log('📝 Testing title formatting:');
    testCases.forEach(testCase => {
      const formatted = formatSongTitle(testCase);
      const id = generateSongId(testCase);
      console.log(`- "${testCase}" → "${formatted}" (ID: ${id})`);
    });
    
    // Test edge cases
    console.log('🔍 Testing edge cases:');
    const edgeCases = [
      '',
      '   ',
      'a',
      'l\'amour',
      'bien-aimée',
      'el día  que   me quieras',
      'LA    CUMPARSITA   '
    ];
    
    edgeCases.forEach(testCase => {
      try {
        const formatted = prepareTitle(testCase);
        const id = generateSongId(testCase);
        console.log(`- "${testCase}" → "${formatted}" (ID: ${id})`);
      } catch (error) {
        console.log(`- "${testCase}" → ERROR: ${error.message}`);
      }
    });
    
    console.log('✅ Title formatting tests completed!');
    
  } catch (error) {
    console.error('❌ Title formatting test failed:', error);
    console.error('Make sure the titleFormatter utilities are available');
  }
};

// Export for use in console
if (typeof window !== 'undefined') {
  window.testTitleFormatting = testTitleFormatting;
}

export { testTitleFormatting };