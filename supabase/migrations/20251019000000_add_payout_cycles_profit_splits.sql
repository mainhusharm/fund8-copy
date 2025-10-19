/*
  # Add Payout Cycles and Profit Split System

  1. Changes
    - Add `payout_cycle` column to challenge_pricing table (BI_MONTHLY, MONTHLY, BI_WEEKLY, WEEKLY)
    - Add `profit_split_pct` column to challenge_pricing table based on payout cycle
    - Update existing records with default payout cycle (BI_MONTHLY)

  2. Profit Split Percentages by Payout Cycle
    - BI_MONTHLY: 100% (fastest payouts, highest split)
    - MONTHLY: 95%
    - BI_WEEKLY: 85%
    - WEEKLY: 75% (slowest payouts, lowest split)

  3. Notes
    - Users can choose their preferred payout cycle at purchase
    - Higher payout frequency = lower profit split percentage
    - Default is BI_MONTHLY for best value
*/

-- Add payout_cycle column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_pricing' AND column_name = 'payout_cycle'
  ) THEN
    ALTER TABLE challenge_pricing
    ADD COLUMN payout_cycle text DEFAULT 'BI_MONTHLY'
    CHECK (payout_cycle IN ('BI_MONTHLY', 'MONTHLY', 'BI_WEEKLY', 'WEEKLY'));
  END IF;
END $$;

-- Add profit_split_pct column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_pricing' AND column_name = 'profit_split_pct'
  ) THEN
    ALTER TABLE challenge_pricing
    ADD COLUMN profit_split_pct decimal(5,2) DEFAULT 100.00;
  END IF;
END $$;

-- Add payout_cycle to user_challenges if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_challenges' AND column_name = 'payout_cycle'
  ) THEN
    ALTER TABLE user_challenges
    ADD COLUMN payout_cycle text DEFAULT 'BI_MONTHLY'
    CHECK (payout_cycle IN ('BI_MONTHLY', 'MONTHLY', 'BI_WEEKLY', 'WEEKLY'));
  END IF;
END $$;

-- Add profit_split_pct to user_challenges if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_challenges' AND column_name = 'profit_split_pct'
  ) THEN
    ALTER TABLE user_challenges
    ADD COLUMN profit_split_pct decimal(5,2) DEFAULT 100.00;
  END IF;
END $$;

-- Update existing records to have BI_MONTHLY payout cycle with 100% profit split
UPDATE challenge_pricing
SET payout_cycle = 'BI_MONTHLY', profit_split_pct = 100.00
WHERE payout_cycle IS NULL OR profit_split_pct IS NULL;

UPDATE user_challenges
SET payout_cycle = 'BI_MONTHLY', profit_split_pct = 100.00
WHERE payout_cycle IS NULL OR profit_split_pct IS NULL;

-- Create function to get profit split based on payout cycle
CREATE OR REPLACE FUNCTION get_profit_split_for_cycle(cycle text)
RETURNS decimal(5,2)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE cycle
    WHEN 'BI_MONTHLY' THEN 100.00
    WHEN 'MONTHLY' THEN 95.00
    WHEN 'BI_WEEKLY' THEN 85.00
    WHEN 'WEEKLY' THEN 75.00
    ELSE 100.00
  END;
END;
$$;

-- Add index for faster payout cycle queries
CREATE INDEX IF NOT EXISTS idx_challenge_pricing_payout_cycle ON challenge_pricing(payout_cycle);
CREATE INDEX IF NOT EXISTS idx_user_challenges_payout_cycle ON user_challenges(payout_cycle);
