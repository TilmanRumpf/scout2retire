# Scotty Personalization Examples

## How Scotty's responses change based on user context

### Example 1: Visa/Immigration Questions

**User asks:** "What do I need to know about visas for retiring in Portugal?"

**Response for US Citizen (single):**
> Good news! As a US citizen, you can stay in Portugal for up to 90 days without a visa. For retirement, you'll typically need to apply for a D7 visa (passive income visa) which requires proof of around $1,500/month in passive income.
> 
> The process usually takes 2-4 months and leads to a residence permit that's renewable every 2 years. After 5 years, you can apply for permanent residency.
> 
> Would you like me to dig deeper into the D7 visa requirements or the application process?

**Response for EU Citizen (German):**
> Excellent news! As a German citizen, you have the right to live in Portugal without any visa - it's one of the great benefits of EU citizenship. You can simply move there and register as a resident after 3 months.
> 
> The registration process is straightforward: you'll need your passport, proof of income, and health insurance. No minimum income requirements apply to EU citizens.
> 
> Would you like to know more about the registration process or tax implications of moving within the EU?

**Response for US-Italian Dual Citizen:**
> Great news! With your Italian citizenship, you have full EU rights to live in Portugal visa-free. This is much simpler than using your US citizenship, which would require a D7 visa.
> 
> As an EU citizen, you can move immediately and just register locally after 3 months. Your spouse would also benefit from EU family rights if you're married.
> 
> Would you like details on the EU registration process or information about maintaining your US tax obligations while living in Portugal?

### Example 2: Healthcare Questions

**User asks:** "How does healthcare work for retirees in France?"

**Response for US Citizen with healthcare concerns (age 60-65):**
> Given your healthcare priorities and pre-Medicare age, France offers excellent options. As a US retiree, you'd initially need private health insurance (typically €150-300/month for comprehensive coverage).
> 
> After establishing residency for 3 months, you can apply to join the French healthcare system, which covers about 70% of costs. Most retirees add a "mutuelle" (top-up insurance) for full coverage.
> 
> Would you like specifics about insurance providers that work with US retirees, or details about coverage for any particular health conditions?

**Response for UK Citizen (post-Brexit):**
> Post-Brexit, UK retirees in France need to navigate new rules. If you have an S1 form (for UK state pension recipients), you can access French healthcare with the UK covering costs.
> 
> Without an S1, you'll need private insurance initially, then can join the French system after 3 months' residency. Costs are reasonable - about €8% of income above €10,000/year.
> 
> Would you like more details about obtaining an S1 form or recommended insurance providers for the transition period?

### Example 3: Budget-Based Recommendations

**User asks:** "Where can I retire comfortably in Europe?"

**Response for User with $2,000/month budget:**
> With your $2,000 monthly budget, you have some wonderful options in Europe! Portugal (outside Lisbon/Porto), inland Spain, and parts of Greece offer comfortable retirement living within your range.
> 
> For example, in Portugal's Silver Coast or Spain's Valencia region, you could rent a nice 2-bedroom apartment for €600-800 and live well on your budget.
> 
> Would you like specific town recommendations that match your climate preferences and budget, or details about cost of living in these regions?

**Response for User with $5,000/month budget:**
> With $5,000 monthly, you can comfortably retire almost anywhere in Europe, including premium locations! You could enjoy waterfront living in Portugal's Algarve, city life in Barcelona or Nice, or even consider Switzerland or Scandinavia.
> 
> This budget allows for a 2-3 bedroom home rental (€1,500-2,500), excellent healthcare, regular dining out, and travel. Many retirees with your budget split time between locations.
> 
> Would you like recommendations based on your preferred climate and lifestyle, or information about tax-efficient locations for your income level?

### Example 7: Favorite Towns Reference

**User asks:** "What's the cost of living like in coastal towns?"

**Response for User who has favorited Porto, Nice, and San Sebastian:**
> I see you've favorited some beautiful coastal cities! In Porto, you can live comfortably on €2,000-2,500/month, while Nice requires around €3,000-3,500 for a similar lifestyle. San Sebastian falls in between at €2,500-3,000.
> 
> Porto offers the best value - rent for a 2-bedroom near the coast runs €800-1,200. Nice is pricier at €1,500-2,000, but you're paying for the French Riviera lifestyle.
> 
> Would you like a detailed breakdown for any of your favorite cities, or suggestions for similar coastal towns that might be more budget-friendly?

### Example 4: Climate-Specific Guidance

**User asks:** "I hate cold winters. Where should I look?"

**Response for User who selected "Hot summers, Warm winters" preference:**
> Perfect - I see you're looking for year-round warmth! Based on your preferences, Southern Spain (Costa del Sol), the Canary Islands, Malta, and Cyprus offer the warmest winters in Europe, rarely dropping below 15°C (60°F).
> 
> The Canary Islands particularly stand out with February averages of 18-20°C and over 300 sunny days annually. Southern Portugal's Algarve is slightly cooler but still mild.
> 
> Would you like specific town recommendations in these warm regions, or details about summer temperatures to ensure they're not too hot for you?

### Example 5: Pet-Related Queries

**User asks:** "Can I bring my dog when I retire abroad?"

**Response for User with pets from the US:**
> Yes, you can definitely bring your dog to most retirement destinations! As a US pet owner, you'll need to plan ahead - most countries require a microchip, rabies vaccination (at least 21 days old), and an EU health certificate.
> 
> The good news: no quarantine is required in most European countries if paperwork is correct. The process typically costs $200-500 and takes about 2 months to complete.
> 
> Would you like specific requirements for the countries you're considering, or information about pet-friendly housing and veterinary care in your preferred locations?

### Example 6: Family Situation Considerations

**User asks:** "What about taxes on our retirement income?"

**Response for Couple with mixed citizenships (US + UK):**
> With your US and your partner's UK citizenship, tax planning is important. The US taxes worldwide income, while the UK has territorial taxation for non-residents. Most countries have tax treaties with both nations to prevent double taxation.
> 
> Portugal's NHR program could be particularly attractive - offering low/no tax on foreign pensions for 10 years. France and Spain tax pensions but have treaties ensuring you won't pay more than in your home country.
> 
> Would you like details about specific tax treaties for your citizenships, or information about tax-friendly destinations that work for both US and UK retirees?

## Implementation Notes

These examples demonstrate how Scotty:
1. References specific user data (citizenship, budget, preferences)
2. Provides targeted, relevant information
3. Maintains the friendly, concise tone
4. Offers relevant follow-up options based on user context
5. Acknowledges special situations (dual citizenship, couple with different citizenships)
6. Considers age and timeline in recommendations
7. Incorporates health concerns when relevant
8. Respects budget constraints in suggestions