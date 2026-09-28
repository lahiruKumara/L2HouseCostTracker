# House Cost Tracker (React + Firebase)

## One-time setup
1. https://console.firebase.google.com -> create project.
2. Build > Authentication > Sign-in method: enable **Email/Password**. Users tab > **Add user** (this is your admin; add more users the same way. There is no signup page).
3. Build > Firestore Database > Create database.
4. Project settings > Your apps > add **Web app**; copy the config into `src/firebase.js`.
5. Put your logo at `public/logo.png`.

## Run and deploy
```
npm install
npm run dev
npm install -g firebase-tools
firebase login
firebase init hosting   (use existing project, public dir = dist, SPA = yes, keep existing files)
firebase deploy --only firestore:rules
npm run deploy
```
Edit floors, categories and currency in `src/config.js`.
Bill photos are compressed and saved inside Firestore, so Firebase Storage (paid plan) is not needed.
