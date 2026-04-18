# SuperApp 🚀

SuperApp is a versatile, "Swiss Army Knife" web application designed to host a growing collection of essential daily tools and calculators in one unified, secure, and beautiful interface. 

Currently built with **Angular 21** and **Tailwind CSS v4**, this project provides quick, client-side tools without relying on external servers for data processing, ensuring maximum privacy and speed.

## Features ✨

### 🏦 Financial Tools
A comprehensive suite of financial calculators built to help you track, plan, and analyze your investments and obligations.
- **Credit Card Tracker**: A secure, encrypted vault (using Web Crypto API AES-GCM 256) to track credit card billing cycles and payment due dates locally. Includes browser notifications.
- **Simple & Compound Interest Calculators**: Visualize exponential growth over time with interactive charts.
- **SIP Calculator**: Plan your Systematic Investment Plan returns.
- **SWP Calculator**: Track corpus depletion against systematic withdrawals.
- **FD Calculators (TDR & STDR)**: Model Fixed Deposits with both periodic payouts and cumulative compounding.
- **RD Calculator**: Calculate maturity values for Recurring Deposits.

*(More daily utilities and tools will be added continuously to serve as a one-stop app for common tasks.)*

## Tech Stack 🛠️
- **Framework**: [Angular 21](https://angular.dev/) (Standalone Components, Signals)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) for rich data visualization
- **Security**: Native Web Crypto API for zero-knowledge local storage encryption.

## Getting Started 💻

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/gauravk268/superwebapp.git
   \`\`\`
2. Navigate into the project directory:
   \`\`\`bash
   cd superapp
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

### Running Locally
To start the development server and make it accessible across your local network:
\`\`\`bash
pnpm start
\`\`\`
*Note: The start script is pre-configured to bind to \`0.0.0.0\`, making it easily testable on your mobile devices connected to the same LAN.*

Navigate to \`http://localhost:4200/\` to view the app!

## Contributing 🤝
This project is continuously evolving. Feel free to open issues or submit pull requests for new daily-life tools or calculators!
