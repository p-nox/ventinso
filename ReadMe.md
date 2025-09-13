#  Microservices Marketplace Platform

[![Java](https://img.shields.io/badge/Java-17-blue?logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kafka](https://img.shields.io/badge/Kafka-Event--Driven-black?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


A **full-stack microservices marketplace** for second-hand item trading.  
Built with **Java Spring Boot (backend)** microservices architecture and **React + Vite (frontend)**, orchestrated via an **API Gateway**, and powered by **event-driven Kafka workflows**.

---

##  Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Workflows](#workflows)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Future Enhancements](#future-enhancements)
- [Why This Project Matters](#why-this-project-matters)
- [Screenshots](#screenshots)

---

##  Overview

- **Backend:** Spring Boot microservices, event-driven with Kafka  
- **Frontend:** React 18 + Vite, modern UI with Tailwind/MUI  
- **Infrastructure:** Docker, Docker Compose, Eureka Discovery, MySQL & MongoDB  
- **Deployment:** Nginx for frontend, containerized microservices  

---

##  Architecture

- **Microservices-based architecture**
- **Event-driven** communication with Kafka
- **Eureka** for service discovery
- **Redis** (planned) for caching and session management

![Architecture Diagram](images/architecture.png)

---

##  Tech Stack

### Tech Stack Used
<div>
    <table>
        <tr>
            <td>
                <strong>Backend</strong>
            </td>
            <td>
                <img alt="Java" src="https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white"/>
                <img alt="Spring Boot" src="https://img.shields.io/badge/Spring Boot-6DB33F?style=flat&logo=springboot&logoColor=white"/>
                <img alt="Spring Cloud Gateway" src="https://img.shields.io/badge/Spring Cloud Gateway-6DB33F?style=flat&logo=spring&logoColor=white"/>
                <img alt="Spring Security" src="https://img.shields.io/badge/Spring Security-6DB33F?style=flat&logo=spring&logoColor=white"/>
                <img alt="Netflix Eureka" src="https://img.shields.io/badge/Eureka-DF162B?style=flat&logo=netflix&logoColor=white"/>
                <img alt="Apache Kafka" src="https://img.shields.io/badge/Apache%20Kafka-000?style=flat&logo=apachekafka"/>
                <img alt="MySQL" src="https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white"/>
                <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white"/>
                <img alt="Swagger" src="https://img.shields.io/badge/OpenAPI-Swagger-85EA2D?style=flat&logo=swagger&logoColor=white"/>
                <img alt="Maven" src="https://img.shields.io/badge/Maven-C02748?style=flat&logo=apachemaven&logoColor=white"/>
                <img alt="Jib" src="https://img.shields.io/badge/Jib-FF6444?style=flat&logo=googlecloud&logoColor=white"/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>Frontend</strong>
            </td>
            <td>
                <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black"/>
                <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white"/>
                <img alt="React Router" src="https://img.shields.io/badge/React Router-CA4245?style=flat&logo=react-router&logoColor=white"/>
                <img alt="Context API" src="https://img.shields.io/badge/Context%20API-61DAFB?style=flat&logo=react&logoColor=black"/>
                <img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white"/>
                <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>
                <img alt="MUI" src="https://img.shields.io/badge/MUI-007FFF?style=flat&logo=mui&logoColor=white"/>
                <img alt="Nginx" src="https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white"/>
            </td>
        </tr>
        <tr>
            <td>
                <strong>DevOps</strong>
            </td>
            <td>
                <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white"/>
                <img alt="Docker Compose" src="https://img.shields.io/badge/Docker Compose-2496ED?style=flat&logo=docker&logoColor=white"/>
                <img alt="Kafka UI" src="https://img.shields.io/badge/Kafka%20UI-000?style=flat&logo=apachekafka"/>
                <img alt="Mongo Express" src="https://img.shields.io/badge/Mongo Express-4EA94B?style=flat&logo=mongodb&logoColor=white"/>
            </td>
        </tr>
    </table>
</div>


---

##  Features

### Backend Services

**Authentication Service**
- JWT login & registration  
- Password hashing & validation  
- Role-based authorization  
- Refresh token support  
- **Uses:** MySQL, Kafka  

**User Service**
- CRUD operations for user profiles  
- Ratings for sellers/buyers  
- Wallet management & transaction history  
- Watchlist management  
- Emits Kafka events on updates  
- **Uses:** MySQL, Kafka  

**Inventory Service**
- CRUD operations for items  
- Image upload & deletion  
- Emits Kafka events for item changes  
- **Uses:** MySQL, Kafka  

**Preview Service**
- Generates optimized image previews  
- Filtering & search APIs  
- Subscribes to Kafka events from Inventory/User Services  
- **Uses:** MongoDB, Kafka  

**Order Service**
- Create & validate orders  
- Update order status (pending, completed, canceled)  
- Kafka-driven workflow for order processing  
- **Uses:** MySQL, Kafka  

**Payment Service**
- Stripe PaymentIntent integration  
- Payment confirmation & failure handling  
- **Uses:** MySQL, Kafka  

**Notification Service**
- Real-time notifications via WebSockets  
- Stores notifications in MongoDB  
- Subscribes to Kafka events from other services  
- **Uses:** MongoDB, Kafka  

**Discovery Service**
- Eureka registry for all services  
- Health check & heartbeat monitoring  

**API Gateway**
- Routes requests via Eureka  
- Aggregates responses (e.g., Inventory + User)  
- JWT validation & role-based access control  
- Optional: rate limiting, logging, IP whitelisting / CORS  

### Frontend

- **UI:** React 18 + Tailwind/MUI, responsive design  
- **Item Grid / Listings:** title, price, seller info, rating, filtering, pagination  
- **User Profile:** view/edit profile, avatar upload  
- **Wallet:** deposit, withdraw, transaction history  
- **Favorites / Watchlist:** mark items favorite, track price updates  
- **Notifications:** real-time updates via WebSocket  
- **Checkout & Payments:** Stripe PaymentIntent, secure validation  
- **Authentication:** login/registration, JWT handling, role-based views  

---

##  Workflows

### Order Processing
1. User places an order → `Order Service`  
2. Kafka event emitted  
3. `Inventory Service`, `Auth Service`, `User Service` validate the order  
4. If valid → `Payment Service` triggered  
5. Payment confirmed → `Order Service` updates status  
6. `Notification Service` pushes updates to frontend  
7. Seller & Buyer receive updates: created, confirmed, shipped, completed, canceled/refunded  

### Notification Workflow
- Any service emits an event → Kafka  
- `Notification Service` consumes event & stores in MongoDB  
- WebSocket pushes notification to frontend in real time  

### Login / Signup Workflow
1. User logs in or signs up → `Auth Service`  
2. `Auth Service` issues JWT + Refresh Token  
3. `User Service` provides profile & preferences  
4. `API Gateway` aggregates responses (Auth + User)  
5. User gains access based on roles  

### Inventory & Preview Workflow
1. User uploads an item → `Inventory Service`  
2. Item metadata stored in MySQL  
3. `Preview Service` generates previews → MongoDB  
4. Frontend requests previews from `Preview Service`  


---

##  Setup & Installation

### Prerequisites
- Java 17, Maven 3.9+  
- Node.js 20+  
- Docker & Docker Compose  

### Run Core Infrastructure
```bash
cd backend
docker-compose -f docker-compose.core.yml up -d
````

### Run Development Tools (optional)

```bash
docker-compose -f docker-compose.tools.yml up -d
```

### Run Backend Services Individually

```bash
cd auth-service
mvn spring-boot:run
# Repeat for other services
```

### Run Frontend (Dev Mode)

```bash
cd frontend
npm install
npm run dev
```

### Run Frontend in Docker

```bash
cd frontend
docker build -t marketplace-frontend .
docker run -p 3000:80 marketplace-frontend
```

---

##  Future Enhancements

* [ ] CI/CD pipelines (GitHub Actions)
* [ ] Monitoring & observability (Prometheus, Grafana, ELK)
* [ ] Redis caching for performance
* [ ] User-to-user chat service

---

##  Why This Project Matters

This project demonstrates:

* Event-driven microservices with Kafka
* Multi-database (SQL + NoSQL) design
* Secure, containerized deployment
* Production-grade frontend & backend integration

It is a **portfolio-grade project**, showcasing backend engineering, frontend development, and DevOps skills in one cohesive ecosystem.

---

## Screenshots

### Home Page & Filters
| Home Page | Filters |
| --------- | ------- |
| ![Home](images/home.png) | ![Home Filters](images/homeFilters.png) |

### Item Page & Owner
| Item Page | Item Owner |
| --------- | ---------- |
| ![Item](images/item.png) | ![Item Owner](images/itemOwner.png) |

### Account & Wallet
| Account Page | Wallet |
| ------------ | ------ |
| ![Account](images/account.png) | ![Wallet](images/wallet.png) |

### Orders & Order History
| Orders Page | Order History |
| ----------- | ------------- |
| ![Order](images/order.png) | ![Order History](images/orderHistory.png) |

### Profile
| Profile Page |  |
| ------------ | - |
| ![Profile](images/profile.png) |  |
