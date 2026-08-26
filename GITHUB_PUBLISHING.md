# GitHub Publishing

## Current State

- Local Git repository is initialized.
- Branch is `main`.
- First commit exists: `69f9312 Initial SaaS MVP scaffold`.
- No GitHub remote is connected yet.

## Option A - Use The Helper Script

1. Create an empty GitHub repository named:

   ```text
   islamic-fasting-planner-saas-mvp
   ```

2. Copy the repository URL, for example:

   ```text
   https://github.com/YOUR_USERNAME/islamic-fasting-planner-saas-mvp.git
   ```

3. Run:

   ```cmd
   CONNECT_GITHUB_REMOTE.cmd
   ```

4. Paste the repo URL when prompted.

## Option B - Manual Commands

```bash
git remote add origin https://github.com/YOUR_USERNAME/islamic-fasting-planner-saas-mvp.git
git branch -M main
git push -u origin main
```

## After GitHub Push

1. Import the GitHub repo into Vercel.
2. Set staging environment variables.
3. Run deployment.
4. Check `/api/health`.
5. Connect database, auth, Stripe, and email provider.
