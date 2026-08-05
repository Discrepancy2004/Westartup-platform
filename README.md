# WeStartup

AI-powered platform where founders pressure-test startup ideas with a challenging advisor, then leave with investor-ready analytics.

**Tagline:** From idea to investor-ready in under an hour

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill Supabase, Gemini/Groq, and Razorpay keys
npm run dev
```

### Supabase setup

1. Create a project at https://supabase.com
2. Paste URL + anon key into `.env.local`
3. Run `supabase/migrations/001_initial.sql` in the SQL editor
4. Enable Email (password + magic link) and Google providers under Auth

### AI

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=
# or
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=
```

### Razorpay

Set `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
Point the webhook to `/api/webhooks/razorpay`. Plan prices in `lib/razorpay/plans.ts` are placeholders (`₹—`) until finalized.


update public.profiles
set role = 'admin'
where lower(email) = lower('madhavan.venkatesh2004@gmail.com');
