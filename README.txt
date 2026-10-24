NOVEX — Supabase edition
================================

Files:
- index.html / pricing.html: existing site with a link to the account page
- account.html: sign-up/sign-in, profile details, order request, own order history
- admin.html: admin-only dashboard for profiles and order statuses
- supabase-setup.sql: database tables, grants, and Row Level Security policies

Setup:
1. Open Supabase Dashboard > SQL Editor.
2. Paste and run all of supabase-setup.sql.
3. In Authentication > Providers, ensure Email is enabled.
4. Create your own user account from account.html after deploying the files.
5. In SQL Editor, replace YOUR_EMAIL in the final UPDATE snippet with your registered email, remove the leading -- comments from the UPDATE statement, and run it. This marks your account as admin.
6. Sign out and sign in again. Open admin.html. Only that account should have admin access.
7. Upload all HTML files to the same GitHub Pages folder.

Important:
- The publishable key is meant for browser use; never add a Supabase secret/service_role key to HTML.
- Keep Row Level Security enabled. The SQL policies let users see their own profile/orders; only admin can list all profiles/orders and update order status.
- New users must verify email if email confirmation is enabled in Supabase.
- This does not process payments or automatically create VPN subscriptions. It records a request for you to handle manually.
- This prototype calculates the price in the browser; for production, price totals should be validated server-side to prevent tampering.
- Do not collect passwords, payment card data, or VPN subscription URLs in profile fields.
