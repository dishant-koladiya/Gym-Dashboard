# Titan Fitness Gym Management Console 🏋️‍♂️

A beautiful, high-performance, responsive full-stack admin console designed for elite gym operations, member tracking, billing, and system configuration.

This project is built as a complete, full-stack application that serves a gorgeous **React + Tailwind CSS** frontend powered by a secure **Node.js Express** backend proxy server.

---

## 📁 Suggested Local Project Layout

To run this frontend together with your Prisma + PostgreSQL **Gym-Backend** locally on your computer, we recommend arranging your project directories as follows:

```text
Gym-Dashboard/
├── Gym-Backend/         <-- Your Prisma + PostgreSQL backend repository
│   ├── prisma/
│   ├── src/
│   ├── server.js
│   └── package.json
└── Gym-Frontend/        <-- This workspace folder (after downloading the ZIP)
    ├── src/
    │   ├── components/
    │   ├── App.tsx
    │   └── main.tsx
    ├── server.ts
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Step-by-Step Connection & Integration

### Option 1: Zero-Configuration Connected Mode (Recommended)
You do not have to write any code to integrate this frontend with your live backend! We have built a dynamic **Database Backend Connection** panel directly into the application interface:

1. Launch your live Prisma server locally (usually running on `http://localhost:5000`).
2. Open the **Titan Fitness** admin console.
3. Click on the **Settings** (⚙️) tab in the navigation.
4. Locate the **Database Backend Connection** module.
5. Enter your API base URL: `http://localhost:5000` (or your hosted Render/Railway endpoint).
6. Paste your **Bearer JWT authorization token** if your routes are protected (e.g. from the `/api/auth/login` response).
7. Scroll up and click **Save Settings**.
8. The UI will instantly switch from sandbox mode to live synchronization! Every member directory load, member addition, checkout, check-in, and transaction query will dynamically query and write to your live PostgreSQL database!

### Option 2: Hardcoded Integration Mode
If you want the app to connect automatically to your live backend by default without setting it in the UI:
1. Open up `src/data.ts` in your text editor.
2. Find the `defaultSettings` object.
3. Update the fields to point to your live server:
   ```typescript
   export const defaultSettings: Settings = {
     theme: "Light",
     emailUpdates: true,
     desktopAlerts: false,
     backendUrl: "http://localhost:5000", // Paste your default live server here!
     backendToken: "YOUR_JWT_BEARER_TOKEN", // Paste your default auth token if needed
   };
   ```

---

## 💻 How to Run the App Locally

Once you have downloaded the project ZIP, follow these simple steps to run the application on your computer:

### Prerequisite
Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### Installation
Open your terminal in the downloaded project folder and run:
```bash
npm install
```

### Run Dev Server
Launch both the Express backend and the Vite dynamic frontend on the primary ingress port:
```bash
npm run dev
```
The application will boot up at **`http://localhost:3000`**.

---

## 📦 How to Download the Code ZIP file on Google AI Studio Build

If you are looking for the button to export or download the entire project directory as a ZIP file:

1. Look at the **Top-Right Corner Indicator Bar** of the Google AI Studio page.
2. Next to the blue **"Deploy"** or **"Share"** dropdown buttons, you will notice a **Settings Gear Icon** (⚙️) or a **Settings Action Sidebar**.
3. Click on the **Settings Gear / Settings Option** to expand the menu panel.
4. Inside, click on the **"Download ZIP"** action or select **"Export to GitHub"** to publish all your front-end and full-stack codes directly to your GitHub repository!
