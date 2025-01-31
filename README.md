
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Trendyol/gurubu/badge)](https://scorecard.dev/viewer/?uri=github.com/Trendyol/gurubu)
# Gurubu

[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://github.com/Trendyol/gurubu/blob/main/LICENSE)

Live demo 👉 https://gurubu.vercel.app/

## Simple, Fast, and Practical Task Estimation and Score Card Grooming

### Agree with your teammates quickly and reliably! Start by setting up a room.

<img width="1728" alt="GuruBu How To" src="https://github.com/user-attachments/assets/7746fcf8-8d25-4bb3-bc6a-ace740cb0954" />

Gurubu is a tool designed to streamline task estimation grooming sessions and prioritize tasks using a room-based, user-friendly approach. With a single click, users can create a room, invite team members, and start estimating story points or voting on multiple metrics for score card grooming.

<img width="1728" alt="GuruBu Home" src="https://github.com/user-attachments/assets/f204a21f-947b-4431-8cb0-b9e63d96d81d" />

## Features


- **One-Click Room Setup:** Quickly create a dedicated room for your task estimation or score card grooming session.
  
<img width="1728" alt="GuruBu Setup" src="https://github.com/user-attachments/assets/c37929e4-1b3d-43bc-b8a0-7d27d0b9dfee" />

- **User-Friendly Interface:** Easily enter your name and join a room, making collaboration simple and efficient.

- **Story Point Estimation:** Streamline the process of estimating story points to better plan and manage your project.

- **Score Card Grooming:** Prioritize tasks effectively by allowing users to vote on multiple metrics.
  
<img width="1728" alt="GuruBu Score Card" src="https://github.com/user-attachments/assets/804f04be-1660-48a5-a119-23d0a23895e2" />

- **Jira Issue Importer**: Import your Jira issues
  
<img width="1728" alt="GuruBu Jira Import" src="https://github.com/user-attachments/assets/53085a97-3956-452b-a7a8-3f47fddb5aa1" />

## Getting Started

### Requirements

- Node.js and yarn (To manage project dependencies for the frontend and the backend)

### Root Installation

- Run `yarn` at the root of the project to install git hooks.

### Frontend Installation

1. Clone this repository to your local machine:
```shell
https://github.com/Trendyol/gurubu.git
```
2. Navigate to the frontend directory:
```shell
cd gurubu-client
```
3. Create .env variable root of the project and add this variable:
```shell
NEXT_PUBLIC_API_URL="http://localhost:5000"
```
4. Install the dependencies:
```shell
yarn 
```
5. Start the frontend application:
```shell
yarn dev
```

The frontend application should now be running at http://localhost:3000.

### Backend Installation

1. Clone this repository to your local machine:
```shell
https://github.com/Trendyol/gurubu.git
```
2. Navigate to the backend directory:
```shell
cd gurubu-backend
```
3. Create .env variable root of the project and add this variable:
```shell
CLIENT_URL="http://localhost:3000"
```
4. Install the dependencies:
```shell
yarn 
```
5. Start the backend application:
```shell
yarn start
```

The backend server should now be running at http://localhost:5000.

### Contributing

We welcome and appreciate contributions from the community. Whether it's reporting issues, suggesting improvements, or submitting code, your help is valuable. Thank you for being a part of our project!

### External License

This project uses DiceBear for avatar generation. DiceBear is licensed under the MIT License.





