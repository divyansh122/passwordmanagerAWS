# Serverless Password Manager 🌟🔒

A secure, serverless password management solution built with AWS and Next.js, ensuring zero-knowledge privacy and real-time functionality.

## Overview 🚀

The Serverless Password Manager is a web app that lets users securely store, manage, and retrieve passwords with end-to-end encryption. Hosted on AWS S3, it uses a serverless architecture (AWS Lambda, API Gateway, DynamoDB) and Amazon Cognito for authentication, keeping data private with zero-knowledge encryption—only you can decrypt your passwords!

## Features ✨

**Zero-Knowledge Security 🔐**: Uses PBKDF2 and AES (CryptoJS) for client-side decryption, blocking even AWS from accessing plaintext.

**Real-Time Password Management ⏱️**: Add, update, delete, and search passwords with an intuitive UI.

**Responsive Design 📱💻**: Built with Next.js for a fast, mobile-friendly frontend hosted on S3.

**Secure Authentication 🛡️**: Cognito provides JWT-based auth (idToken, accessToken, refreshToken).

**User-Friendly UI 🌈**: Features show/hide toggles, toast notifications, and smooth navigation.

## Technologies Used 🛠️

AWS: S3, Cognito, Lambda, API Gateway, DynamoDB

Frontend: Next.js (React)

Encryption: CryptoJS (PBKDF2, AES, SHA256)

API Testing: Postman

Version Control: Git

Serverless: Serverless Framework (optional if you want too use !)

## Installation 🛑

### Prerequisites:-
Node.js (v18.x+)
AWS CLI configured
Postman (optional)
Serverless Framework (optional, npm install -g serverless)


### Steps
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/serverless-password-manager.git
   cd serverless-password-manager
   
2. Install dependencies:
   ```bash
   npm install
   
**Configure AWS credentials and .env.local for AWS details.**

3. Manual Deployment (Default):
   Deploy backend resources (Lambdas, API Gateway, DynamoDB) manually via AWS Console/CLI.
   Build and deploy frontend to S3:
   ```bash
   npm run build && npm run export
   aws s3 sync out/ s3://passwordmanagerdashboard --region ap-south-1
  Configure S3 for static hosting and CloudFront (optional for performance).

4. Optional Serverless Framework Deployment:
   Install Serverless Framework globally: npm install -g serverless.
   Update serverless.yml with your AWS resources (see example in docs).
   Deploy backend:
   ```bash
   npx serverless deploy --region ap-south-1
   
Deploy frontend manually to S3 as above.

1. Deploy backend (e.g., via Serverless Framework):
   ```bash
   npx serverless deploy --region ap-south-1
   
## Usage 🖱️

Visit: [Visit the Website](https://d1exuwh9hp95jz.cloudfront.net/).

Sign up or log in with email, password, and master password.

Manage passwords via the dashboard securely.

## Architecture 📊

AWS Architecture Diagram
***The serverless setup includes***:

S3: Hosts the Next.js app.

Cognito: Handles user auth.

3 API Gateways: For auth, passwords, and master keys.

10 Lambdas: Manage user flows, passwords, and keys.

2 DynamoDB Tables: Store master keys and passwords.

![diagram](https://github.com/user-attachments/assets/98590f0e-bc14-4fa2-8ebb-92617ffad813)

Optionally managed with the Serverless Framework for streamlined deployment and scaling.

## Testing ✅
APIs: Test endpoints (e.g., /login, /add e.t.c) with Postman, verifying Cognito tokens and encryption.

Local: Run npm run dev and test in-browser.

## Future Add-Ons 🤖

**AI Password Strength Analysis 🧠**: Integrate AI (e.g., AWS SageMaker) to analyze password strength, offering real-time feedback on complexity and security.\

**Biometric Auth 👁️**: Add Cognito biometric options for enhanced login security.

**Password Auto-Generation 🔑**: Build a feature to generate strong, random passwords with customizable rules.

**MFA Support 🛡️**: Enable multi-factor authentication via Cognito SMS/TOTP.

**Offline Mode 📴**: Support local password storage with sync capabilities.

1. ```Contributing 🙌
   Fork this repo.
   Create a branch: git checkout -b feature/your-feature.
   Commit changes: git commit -m "Add your feature".
   Push: git push origin feature/your-feature.
   
Open a PR with details of your changes. Use the Serverless Framework for backend contributions if applicable.

## Acknowledgements 🙏

Inspired by AWS serverless best practices.

Thanks to Next.js, CryptoJS, Postman, and Serverless Framework communities!

# ScreenShots:--

## Home Page

![image](https://github.com/user-attachments/assets/8c9c90a2-1454-4e32-9027-9dbfa589d3dd)

## Login Page

![image](https://github.com/user-attachments/assets/1fe93fed-c712-488b-bcd0-c1f36174612f)

## DashBoard

![image](https://github.com/user-attachments/assets/a24e4c4a-3ecc-411c-807b-a14a338b121a)

## Sign Up page

![image](https://github.com/user-attachments/assets/f79b4762-7dd2-46a6-80d7-70269fafbb9b)





