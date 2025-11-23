# Database Configuration

## Current Setup: Neon PostgreSQL

### Connection String Format:
```
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### Steps to Get Your Connection String:

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project: `assembly-tracker`
4. Select region: **Europe (Frankfurt)** for best performance
5. Copy the connection string from the dashboard
6. Paste it in your `.env` file

### Migration Commands:

After updating `.env`:
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to Neon
npx prisma db push

# 3. Verify connection
npx prisma studio
```

### Rollback to SQLite (if needed):
```env
DATABASE_URL="file:./dev.db"
```
Then change `provider = "sqlite"` in `prisma/schema.prisma`

---

## Neon Dashboard

After setup, you can:
- View queries in real-time
- Monitor database size
- Create branches (dev/staging/prod)
- Set up connection pooling
- Configure backups

**Dashboard URL:** https://console.neon.tech
