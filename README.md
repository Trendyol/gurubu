# Gurubu

[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://github.com/Trendyol/gurubu/blob/main/LICENSE)

Live demo 👉 https://gurubu.vercel.app/

## Simple, Fast, and Practical Task Estimation and Score Card Grooming

### Agree with your teammates quickly and reliably! Start by setting up a room.

![how-to-gurubu](https://github.com/Trendyol/gurubu/assets/77741597/09020514-17f0-473d-87b9-3d7a50c95c37)

Gurubu is a tool designed to streamline task estimation grooming sessions and prioritize tasks using a room-based, user-friendly approach. With a single click, users can create a room, invite team members, and start estimating story points or voting on multiple metrics for score card grooming.


![Ekran Resmi 2023-11-07 17 06 17](https://github.com/Trendyol/gurubu/assets/77741597/30dd19b8-84db-49bb-a46f-f2acc7a75011)

## Features


- **One-Click Room Setup:** Quickly create a dedicated room for your task estimation or score card grooming session.
  
![Ekran Resmi 2023-11-07 17 06 34](https://github.com/Trendyol/gurubu/assets/77741597/c1daa141-fa7a-4758-a967-bc8de1a2242f)

- **User-Friendly Interface:** Easily enter your name and join a room, making collaboration simple and efficient.

- **Story Point Estimation:** Streamline the process of estimating story points to better plan and manage your project.

- **Score Card Grooming:** Prioritize tasks effectively by allowing users to vote on multiple metrics.
![Ekran Resmi 2023-11-07 17 08 39](https://github.com/Trendyol/gurubu/assets/77741597/d15fdd31-26c4-4914-a517-d2de5177dc09)

- **Jira Issue Importer**: Import your Jira issues

![image](https://github.com/Trendyol/gurubu/assets/33116071/d9da083c-5939-411f-9008-e2b6aef26a9f)

- **Set Story Point to Imported Jira Issues***:
    ##### 1. your api token must have write access 
    ##### 2. you must set the story custom field(jira default is *customfield_10016*)

  ![image](https://github.com/Trendyol/gurubu/assets/33116071/d81e3f99-b5e3-44ed-a02f-2b2d66c45190)

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




