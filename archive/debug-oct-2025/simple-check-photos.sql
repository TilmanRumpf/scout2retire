-- Part 1: What photos exist in bucket? (first 50)
SELECT name
FROM storage.objects
WHERE bucket_id = 'town-images'
ORDER BY name
LIMIT 50;
