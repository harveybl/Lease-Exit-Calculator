# User Setup: Database Configuration (Plan 01-02)

This plan requires manual setup of external services before the application can run database operations.

## Required Service: Neon Postgres Database

**Why:** Serverless Postgres database for lease storage

### Setup Steps

1. **Create Neon Account**
   - Visit https://neon.tech
   - Sign up or log in
   - Create a new project

2. **Get Database Connection String**
   - In Neon Dashboard → Your Project → Connection Details
   - Copy the **Connection string (with pooling)**
   - Format: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

3. **Configure Environment Variable**
   - Create `.env.local` in project root (if it doesn't exist)
   - Add:
     ```
     DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
     ```
   - Replace with your actual connection string from step 2

4. **Apply Database Migration**
   ```bash
   npx drizzle-kit push
   ```
   This creates the `leases` table in your Neon database.

### Verification

Verify the setup worked:

```bash
# Check that the leases table was created
npx drizzle-kit studio
```

This opens Drizzle Studio at http://localhost:4983 where you can see your database schema.

### Security Notes

- **NEVER commit `.env.local` to git** (already in .gitignore)
- The connection string contains sensitive credentials
- For production deployment, add DATABASE_URL to your hosting platform's environment variables (Vercel, Railway, etc.)

### Troubleshooting

**"Error: Failed to connect to database"**
- Verify DATABASE_URL is correctly formatted
- Check that your Neon project is active (not suspended)
- Ensure you're using the pooling connection string

**"relation 'leases' does not exist"**
- Run `npx drizzle-kit push` to apply the migration
- Check Neon Dashboard → SQL Editor → Tables to confirm table exists

## Environment Variables Summary

| Variable | Source | Required For |
|----------|--------|--------------|
| DATABASE_URL | Neon Dashboard → Connection Details → Connection string (with pooling) | Database operations, migrations |

---

**Next Steps After Setup:**
1. Test database connection: `npx drizzle-kit studio`
2. Continue with Phase 1 development (calculations and input forms)
3. In Phase 2, use the leases table for persistence
