-- Disable email confirmation for new users
UPDATE auth.config 
SET enable_signup = true, 
    enable_confirmations = false,
    email_confirm_changes = false
WHERE id = 1;

-- If the above doesn't work, we'll handle it in the application layer
-- by automatically confirming users upon signup