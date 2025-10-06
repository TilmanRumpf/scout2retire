-- ============================================================================
-- ACCURATE RESIDENCY PATH INFO - RESEARCHED DATA
-- For EU and US citizens based on official immigration sources 2024-2025
-- ============================================================================

-- United States
UPDATE towns
SET residency_path_info = '"US citizens: Domestic residency, no visa required. EU citizens: Visa-free 90 days (ESTA), longer stays require employment visa (H-1B), family sponsorship, or investment visa (EB-5: $1,050,000 investment creating 10 jobs). No retirement visa. Green card → citizenship after 5 years."'::jsonb
WHERE country = 'United States' AND residency_path_info IS NULL;

-- Canada
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 6 months visit. Permanent residency via Express Entry (skilled workers, requires $15,263 CAD funds), Provincial Nominee Programs, family sponsorship. No retirement visa. Super Visa for parents/grandparents (5-year validity). Processing: 6-12 months."'::jsonb
WHERE country = 'Canada' AND residency_path_info IS NULL;

-- France
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa required. US citizens: Long Stay Visitor Visa (VLS-TS Visiteur) requires €1,767/month minimum income (~€21,200 annually), health insurance, accommodation proof. Valid 1 year, renewable. Permanent residence after 5 years. Processing: 2-4 months."'::jsonb
WHERE country = 'France' AND residency_path_info IS NULL;

-- Portugal
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: D7 Passive Income Visa requires €870/month ($12,540 annually), Portuguese bank account with €10,440. Additional 50% for spouse, 30% per child. 2-year permit renewable for 3 years. Permanent residence after 5 years. Processing: 3-9 months."'::jsonb
WHERE country = 'Portugal' AND residency_path_info IS NULL;

-- Mexico
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 180 days. Temporary residency requires $4,185/month or $69,750 savings. Permanent residency requires $7,100/month or $280,000 savings. Pensionado status for retirees 60+. After 5 years permanent residency, eligible for citizenship. Processing: 1-3 months."'::jsonb
WHERE country = 'Mexico' AND residency_path_info IS NULL;

-- Australia
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa required. No retirement visa (closed 2018). Alternatives: skilled migration (points-based, 16,500 places 190 visas), business/investor visas, family sponsorship. Citizenship after 4 years residence. Dual citizenship allowed. Processing: 6-12 months for skilled migration."'::jsonb
WHERE country = 'Australia' AND residency_path_info IS NULL;

-- Spain
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: Non-Lucrative Visa requires €2,150+/month (~€25,800 annually/$28,800 USD), private health insurance, accommodation proof. 1-year visa renewable. Permanent residence after 5 years. Citizenship requires 10 years, no dual citizenship. Processing: 2-5 months."'::jsonb
WHERE country = 'Spain' AND residency_path_info IS NULL;

-- Italy
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: Elective Residence Visa requires €31,000/year passive income ($33,480 USD). Cannot work. Health insurance and accommodation required. 1-year permit renewable. Permanent residence after 5 years. Citizenship after 10 years. Processing: 1-6 months (varies by consulate)."'::jsonb
WHERE country = 'Italy' AND residency_path_info IS NULL;

-- Greece
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: Financially Independent Person (FIP) Visa requires €3,500/month (€42,000 annually/$45,360 USD) passive income. Must stay 6+ months annually. Can work remotely for foreign employers. 3-year visa renewable. Permanent residence after 5 years. Processing: 4-6 months."'::jsonb
WHERE country = 'Greece' AND residency_path_info IS NULL;

-- Netherlands
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: No retirement visa. Dutch American Friendship Treaty (DAFT) for entrepreneurs requires €4,500 business investment, €1,572/month income. 2-year permit renewable. Permanent residence after 5 years. Processing: 2-3 months."'::jsonb
WHERE country = 'Netherlands' AND residency_path_info IS NULL;

-- New Zealand
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 90 days. Temporary Retirement Visitor Visa (age 66+) requires NZD $750,000 investment for 2 years, NZD $500,000 maintenance funds, NZD $60,000/year income ($36,000 USD). 2-year visa renewable, no pathway to permanent residence. Permanent residence via skilled migration, business, or family sponsorship. Processing: 3-5 months."'::jsonb
WHERE country = 'New Zealand' AND residency_path_info IS NULL;

-- Croatia
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement since 2013, no visa. US citizens: Visa-free 90 days. Temporary residence requires 50% of average salary (€473/month single, €5,676 annually). Digital Nomad Visa requires €3,295/month (€39,540 annually). Property ownership qualifies. Permanent residence after 5 years. No dual citizenship. Processing: 2-4 months."'::jsonb
WHERE country = 'Croatia' AND residency_path_info IS NULL;

-- Thailand
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 30 days tourism. Retirement visa (Non-Immigrant O/O-A, age 50+) requires 800,000 THB (~$22,000 USD) in Thai bank OR 65,000 THB/month ($21,600/year) OR combination. Health insurance required for O-A. 1-year visa renewable indefinitely. O-X visa: 5-year stays (10 years total) with 3M THB deposit. No pathway to citizenship. Processing: 1-2 months."'::jsonb
WHERE country = 'Thailand' AND residency_path_info IS NULL;

-- Germany
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: Visa-free 90 days, can apply for residence permit in-country. Residence Permit for Financially Independent Individuals requires proof of financial self-sufficiency (case-by-case assessment), health insurance. 1-year permit renewable. Permanent residence after 5 years. Citizenship after 8 years (reducible to 6-7). Processing: 2-4 months."'::jsonb
WHERE country = 'Germany' AND residency_path_info IS NULL;

-- Panama
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 90-180 days. Pensionado (retirement) Program requires $1,000/month pension ($750 with $100,000+ property). +$250/month per dependent. No age limit. Immediate permanent residency, renewable. Must visit once every 2 years. Extensive Jubilado discounts. Citizenship after 5 years. Processing: 5-10 days temporary visa, 4-6 months permanent card."'::jsonb
WHERE country = 'Panama' AND residency_path_info IS NULL;

-- Belgium
UPDATE towns
SET residency_path_info = '"EU citizens: Freedom of movement, no visa. US citizens: Long-stay D-visa required for 90+ days. Retirement visa available, requires Belgian Immigration approval. 6-month initial visa, then residence card. Permanent residence (Type B card) after 5 years. Income requirements not clearly defined, must prove financial self-sufficiency and health insurance. Processing: 2-4 months."'::jsonb
WHERE country = 'Belgium' AND residency_path_info IS NULL;

-- Morocco
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 90 days. For 90+ days, must register with police and apply for residence permit (Certificat d''Immatriculation). Long-stay visa valid 3 months allows Residency Card application. Eight residence permit categories available. No specific retirement visa. Submit applications to Bureau des Etrangers (cities) or Gendarmerie (rural). Processing: 2-3 months."'::jsonb
WHERE country = 'Morocco' AND residency_path_info IS NULL;

-- Malaysia
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 90 days. Malaysia My Second Home (MM2H) program (age 25+, or 21 for special zones): Three tiers - Platinum ($1M deposit + MYR 2M property), Gold ($500K deposit + MYR 1M property), Silver ($150K deposit + MYR 600K property). No income requirement. Must apply through licensed agent. 5-year visa renewable. No pathway to citizenship. Processing: 4-6 months."'::jsonb
WHERE country = 'Malaysia' AND residency_path_info IS NULL;

-- Ecuador
UPDATE towns
SET residency_path_info = '"US & EU citizens: Visa-free 90 days. Pensionado/Jubilado (retirement) visa requires $1,410/month pension/Social Security (+$250/month per dependent). No age requirement (65+ eligible for elderly benefits). 2-year temporary visa. After 21 months in-country, convert to permanent residence. Health insurance from local provider required. Cannot work on payroll. Fees: $50 application + $270 approval. Processing: 2-4 months."'::jsonb
WHERE country = 'Ecuador' AND residency_path_info IS NULL;

-- Vietnam
UPDATE towns
SET residency_path_info = '"US & EU citizens: E-visa 90 days. No official retirement visa as of 2025. Long-term options: Investor (DT) Visa allows up to 5-year stays for qualifying investment; Visitor (VR) Visa 180 days; frequent visa runs common. Government developing ''golden visa'' (up to 10 years) for high-value residents, expected 2025 rollout. Processing: Immediate for e-visa, varies for investor visa."'::jsonb
WHERE country = 'Vietnam' AND residency_path_info IS NULL;

-- Verify updates
SELECT country, COUNT(*) as town_count,
  COUNT(residency_path_info) as has_residency_info
FROM towns
GROUP BY country
ORDER BY town_count DESC
LIMIT 20;
