/*
  # Normalize blog categories

  Updates existing blog_posts.category values so they match a canonical 7-category taxonomy.
  Also adds a CHECK constraint to keep future categories within the allowed set.
*/

-- Normalize existing categories into the canonical taxonomy
UPDATE blog_posts
SET category = CASE
  -- AI
  WHEN category ILIKE '%ai%' OR category ILIKE '%llm%' OR category ILIKE '%gpt%' OR category ILIKE '%copilot%'
    THEN 'AI-Augmented Development'

  -- Security
  WHEN category ILIKE '%security%' OR category ILIKE '%devsecops%' OR category ILIKE '%oauth%' OR category ILIKE '%auth%' OR category ILIKE '%jwt%'
    THEN 'DevSecOps & Security'

  -- Cloud / scaling
  WHEN category ILIKE '%cloud%' OR category ILIKE '%scal%' OR category ILIKE '%kubernetes%' OR category ILIKE '%docker%' OR category ILIKE '%serverless%'
    OR category ILIKE '%aws%' OR category ILIKE '%azure%' OR category ILIKE '%gcp%' OR category ILIKE '%performance%'
    THEN 'Cloud-Native & Scaling'

  -- Design
  WHEN category ILIKE '%design%' OR category ILIKE '%ui%' OR category ILIKE '%ux%' OR category ILIKE '%css%' OR category ILIKE '%product%' OR category ILIKE '%animation%'
    THEN 'Product & UI/UX Design'

  -- Web3 / XR
  WHEN category ILIKE '%web3%' OR category ILIKE '%blockchain%' OR category ILIKE '%crypto%' OR category ILIKE '%xr%' OR category ILIKE '%ar%' OR category ILIKE '%vr%'
    THEN 'Emerging Tech (Web3 & XR)'

  -- Culture / career
  WHEN category ILIKE '%career%' OR category ILIKE '%culture%' OR category ILIKE '%leadership%' OR category ILIKE '%management%'
    THEN 'Engineering Culture & Career'

  -- Default bucket
  ELSE 'Full-Stack Architecture'
END;

-- Enforce the canonical set going forward
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_category_check;
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_category_check
CHECK (
  category IN (
    'AI-Augmented Development',
    'Full-Stack Architecture',
    'DevSecOps & Security',
    'Cloud-Native & Scaling',
    'Product & UI/UX Design',
    'Emerging Tech (Web3 & XR)',
    'Engineering Culture & Career'
  )
);
