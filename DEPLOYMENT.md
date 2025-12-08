# ✅ Deployment Checklist

Complete checklist for deploying the Lagos State Digital Signature Portal to production.

## 🔧 Pre-Deployment Setup

### Environment Variables

- [ ] All environment variables documented in `.env.example`
- [ ] Production `DATABASE_URL` configured (Supabase)
- [ ] `NEXTAUTH_SECRET` generated (use `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `APP_URL` set to production URL
- [ ] `SENDGRID_API_KEY` configured
- [ ] `SENDGRID_FROM_EMAIL` verified in SendGrid
- [ ] `OPENAI_API_KEY` added (if using AI features)

### Database

- [ ] Supabase project created
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Connection string tested
- [ ] Database accessible from production environment
- [ ] Test data seeded (optional, for staging)

### Code Quality

- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console.errors in production code
- [ ] All TODO comments reviewed
- [ ] Sensitive data removed from code

### Testing

- [ ] User signup/signin flow tested
- [ ] Contract creation tested
- [ ] Contract listing tested
- [ ] Email sending tested (if configured)
- [ ] Password reset flow tested
- [ ] All API endpoints tested
- [ ] Error pages tested (404, 500)

## 🚀 Vercel Deployment

### Initial Setup

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm i -g vercel`)

### Deployment Steps

1. **Connect Repository**

   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Click "Import Project"
   - [ ] Select GitHub repository
   - [ ] Configure project settings

2. **Environment Variables**
   Add in Vercel Dashboard → Settings → Environment Variables:

   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   OPENAI_API_KEY=sk-xxx
   APP_URL=https://your-app.vercel.app
   ```

3. **Build Settings**

   - [ ] Framework Preset: Next.js
   - [ ] Build Command: `npm run build` (default)
   - [ ] Output Directory: `.next` (default)
   - [ ] Install Command: `npm install` (default)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Check deployment logs for errors

### Post-Deployment

- [ ] Visit production URL
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Create test contract
- [ ] Verify emails are sent
- [ ] Check all pages load correctly
- [ ] Test on different browsers
- [ ] Check console for errors

## 📧 Email Configuration (SendGrid)

### Domain Setup

- [ ] Domain verified in SendGrid
- [ ] SPF record added to DNS
- [ ] DKIM records added to DNS
- [ ] Sender authentication complete
- [ ] Test email sent successfully

### Email Templates

- [ ] Password reset email template reviewed
- [ ] Contract invitation email template reviewed
- [ ] Signature completion email template created (if needed)

## 🗄️ Database Configuration

### Supabase Production Setup

- [ ] Production project created
- [ ] Connection pooling enabled
- [ ] Row Level Security configured (optional)
- [ ] Backups enabled
- [ ] Database size monitored

### Database Security

- [ ] Strong password used
- [ ] Connection string kept secret
- [ ] Only necessary IP addresses whitelisted (if applicable)
- [ ] SSL/TLS enforced

## 🔒 Security Checklist

### Authentication

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Password hashing verified (bcrypt with salt)
- [ ] Session timeout configured appropriately
- [ ] HTTPS enforced in production

### API Security

- [ ] All API routes protected with authentication
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection in place
- [ ] CSRF protection (Next.js handles this)

### Environment

- [ ] `.env` file not committed to git
- [ ] Environment variables not exposed to client
- [ ] No API keys in client-side code
- [ ] Proper CORS configuration

## 🎯 Performance Optimization

### Next.js Configuration

- [ ] Image optimization configured
- [ ] Static generation where possible
- [ ] API routes optimized
- [ ] Proper caching headers set

### Database

- [ ] Indexes added to frequently queried fields
- [ ] Query optimization reviewed
- [ ] Connection pooling enabled

### Monitoring

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking set up (Sentry, optional)
- [ ] Performance monitoring in place

## 📱 Domain Setup (Optional)

If using custom domain:

- [ ] Domain purchased
- [ ] DNS configured to point to Vercel
- [ ] SSL certificate provisioned
- [ ] `NEXTAUTH_URL` updated with custom domain
- [ ] `APP_URL` updated with custom domain
- [ ] All email links use custom domain

## 🧪 Post-Deployment Testing

### Functional Testing

- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Contract creation works
- [ ] Contract listing works
- [ ] Contract sending works
- [ ] Email delivery works
- [ ] Dashboard loads correctly

### Cross-Browser Testing

- [ ] Chrome/Edge tested
- [ ] Firefox tested
- [ ] Safari tested (if available)

### Responsive Design

Note: Current version is desktop-only

- [ ] Desktop view (1920x1080) works
- [ ] Desktop view (1366x768) works
- [ ] Mobile warning added (if needed)

## 📊 Monitoring & Maintenance

### Setup Monitoring

- [ ] Uptime monitoring (UptimeRobot, optional)
- [ ] Error logging (Sentry, optional)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Email delivery monitoring (SendGrid dashboard)

### Regular Maintenance

- [ ] Weekly backup checks
- [ ] Monthly dependency updates (`npm outdated`)
- [ ] Security patches applied promptly
- [ ] Database cleanup scripts scheduled (if needed)

## 📝 Documentation

### For Users

- [ ] User guide created
- [ ] FAQ documented
- [ ] Support contact information provided

### For Developers

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide updated
- [ ] Environment variables documented

## 🚨 Rollback Plan

In case of critical issues:

1. **Immediate Rollback**

   - [ ] Previous deployment URL saved
   - [ ] Rollback procedure documented
   - [ ] Can revert via Vercel dashboard

2. **Database Rollback**
   - [ ] Database backup available
   - [ ] Restore procedure documented
   - [ ] Test restore process

## ✅ Final Checks

Before going live:

- [ ] All checklist items completed
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Backup plan in place
- [ ] Monitoring alerts configured

### Production URLs

```
Production: https://your-app.vercel.app
Database: [Supabase URL]
Email Service: SendGrid
```

### Emergency Contacts

```
Developer: [Your contact]
Database: Supabase Support
Email: SendGrid Support
Hosting: Vercel Support
```

---

## 🎉 Deployment Complete!

Once all items are checked:

- [ ] Mark project as deployed
- [ ] Announce to team
- [ ] Monitor for first 24 hours
- [ ] Collect user feedback
- [ ] Plan next iteration

---

**Last Updated:** [Date]  
**Deployed By:** [Your Name]  
**Version:** 1.0.0

---

**Tips:**

- Test on staging environment first
- Deploy during low-traffic hours
- Have rollback plan ready
- Monitor logs closely after deployment
- Communicate with users about downtime (if any)

Good luck with your deployment! 🚀
