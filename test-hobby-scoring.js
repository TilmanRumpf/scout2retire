import { calculateHobbiesScore } from './src/utils/scoring/helpers/hobbiesMatching.js';

// Test with sample user hobbies and a town
const testUserHobbies = {
  activities: ['golf', 'tennis', 'swimming'],
  interests: ['cooking', 'wine', 'gardening'],
  custom_physical: ['surfing', 'snorkeling'],
  custom_hobbies: [],
  travel_frequency: 'occasional'
};

const testTown = {
  id: 1, // Naples, FL or any town ID
  name: 'Naples',
  country: 'USA',
  activity_infrastructure: {
    airport: true
  },
  transport_links: ['airport'],
  distance_to_airport: 30
};

console.log('🧪 TESTING HOBBY SCORING SYSTEM');
console.log('=====================================');

try {
  const result = await calculateHobbiesScore(testUserHobbies, testTown);
  
  console.log('\n📊 SCORING RESULT:');
  console.log(`Score: ${result.score}`);
  console.log(`Category: ${result.category}`);
  
  console.log('\n🔍 DETAILS:');
  console.log(`Total user hobbies: ${result.details.totalUserHobbies}`);
  console.log(`Matched hobbies: ${result.details.matched.length}`);
  console.log(`Missing hobbies: ${result.details.missing.length}`);
  console.log(`Universal hobbies matched: ${result.details.universal.length}`);
  console.log(`Town specific hobbies available: ${result.details.townSpecificHobbies}`);
  console.log(`Match percentage: ${result.details.matchPercentage}%`);
  
  console.log('\n✅ MATCHED HOBBIES:');
  result.details.matched.forEach(hobby => console.log(`  - ${hobby}`));
  
  if (result.details.missing.length > 0) {
    console.log('\n❌ MISSING HOBBIES:');
    result.details.missing.forEach(hobby => console.log(`  - ${hobby}`));
  }
  
  console.log('\n📈 SCORING FACTORS:');
  result.factors.forEach(factor => {
    console.log(`  ${factor.factor}: ${factor.score > 0 ? '+' : ''}${factor.score}`);
  });
  
  console.log('\n🎯 SCORING SYSTEM STATUS: READY ✅');
  
} catch (error) {
  console.error('❌ ERROR TESTING HOBBY SCORING:', error);
  console.log('\n🚨 SCORING SYSTEM STATUS: NOT READY ❌');
}