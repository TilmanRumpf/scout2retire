-- Check partner citizenship data for current user
SELECT 
    id,
    full_name,
    family_situation,
    primary_citizenship,
    dual_citizenship,
    secondary_citizenship,
    partner_primary_citizenship,
    partner_dual_citizenship,
    partner_secondary_citizenship
FROM users
WHERE email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
);