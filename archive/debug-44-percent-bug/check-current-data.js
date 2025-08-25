import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkButtonIssues() {
  console.log('Button Disabled State Issues Found:\n');
  
  const issues = [
    {
      file: '/src/pages/Home.jsx',
      line: 313,
      description: 'Journal save button - uses disabled: pseudo-class',
      current: 'className="... disabled:opacity-50 disabled:cursor-not-allowed"',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/DailyRedesignV2.jsx',
      line: 708,
      description: 'Journal save button - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/TestOnboardingUpdate.jsx',
      lines: [126, 134],
      description: 'Test buttons - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/Settings.jsx',
      line: 632,
      description: 'Delete account button - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/Login.jsx',
      line: 254,
      description: 'Sign in button - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/ResetPassword.jsx',
      lines: [313, 407],
      description: 'Password reset buttons - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50 disabled:cursor-not-allowed`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/Signup.jsx',
      line: 403,
      description: 'Create account button - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50 disabled:cursor-not-allowed`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/SignupEnhanced.jsx',
      line: 704,
      description: 'Create account button - uses disabled: pseudo-class',
      current: 'className={`... disabled:opacity-50 disabled:cursor-not-allowed`}',
      status: 'CORRECT - Uses disabled: pseudo-class'
    },
    {
      file: '/src/pages/Chat.jsx',
      line: 1366,
      description: 'Send invitation button - conditional opacity',
      current: 'className={`... ${inviteLoading ? "opacity-50 cursor-not-allowed" : ""}`}',
      status: 'ISSUE - Conditional opacity instead of disabled: pseudo-class'
    },
    {
      file: '/src/components/LikeButton.jsx',
      line: 99,
      description: 'Like button loading state - static opacity',
      current: 'className="... opacity-50"',
      status: 'SPECIAL CASE - Always disabled when no data'
    }
  ];

  console.log('Summary of Button Disabled State Patterns:\n');
  
  const correctCount = issues.filter(i => i.status.includes('CORRECT')).length;
  const issueCount = issues.filter(i => i.status.includes('ISSUE')).length;
  const specialCount = issues.filter(i => i.status.includes('SPECIAL')).length;
  
  console.log(`Total buttons analyzed: ${issues.length}`);
  console.log(`✅ Correct (using disabled: pseudo-class): ${correctCount}`);
  console.log(`❌ Issues (conditional/static opacity): ${issueCount}`);
  console.log(`⚠️  Special cases: ${specialCount}`);
  
  console.log('\n\nDetailed Analysis:\n');
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Line(s): ${Array.isArray(issue.lines) ? issue.lines.join(', ') : issue.line}`);
    console.log(`   Description: ${issue.description}`);
    console.log(`   Current: ${issue.current}`);
    console.log(`   Status: ${issue.status}`);
    console.log('');
  });

  console.log('\n\nRECOMMENDATION:\n');
  console.log('Most buttons in the codebase correctly use the "disabled:" pseudo-class modifier,');
  console.log('which only applies styles when the button is actually disabled.');
  console.log('\nOnly 1 button needs fixing:');
  console.log('- Chat.jsx line 1366: Change conditional opacity to use disabled: pseudo-class');
  console.log('\nThe LikeButton.jsx case is special - it\'s always disabled in that state,');
  console.log('so the static opacity is appropriate.');
  
  process.exit(0);
}

checkButtonIssues();