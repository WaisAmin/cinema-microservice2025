# Cinema Microservices (PG3402 Exam)

This repository contains a complete implemented microservice-cinema booking system described in our arbeidskrav.
It includes 6 Spring Boot services, Spring Cloud Gateway, RabbitMQ messaging, PostgreSQL databases, Spring Cloud Config,
Dockerfiles for each service, and a `docker-compose.yml` that starts everything with a single command.

In addition to the arbeidskrav we decided to expand the scope of the project by adding more advanced
and interactive interface and improve the service "logic". These improvements made the project 
both more challenging and rewarding, and gave us valuable experience in building and deploying 
a realistic microservice based system. 

> Status: Fully runnable system implementing all required user stories and microservice criteria for the PG3402 exam.

##  Services

- `Gateway` – Acts as the single entry point to all backend services. Handles routing, load balancing, and API requests from the frontend.
- `User-service` – Manages user registration, authentication (JWT-based), and profile data. Integrated with the booking history endpoint.
- `Movie-service` – Provides endpoints for listing movies and their showtimes. Supports dynamic data loading for the frontend.
- `Booking-service` – Handles seat reservations, stores booking details in PostgreSQL, and publishes `booking.created` events to RabbitMQ.
- `Payment-service` – Listens for booking events, simulates payments (80% OK / 20% Failed), updates payment status, and publishes `payment.completed`.
- `Notification-service` – Listens for completed payments and sends booking confirmations (via console logging or simulated email).
- `Config-service` – Centralized Spring Cloud Config Server that manages configuration for all microservices.
- `Frontend` – A React-based interface that allows users to browse movies, select showtimes, and book tickets through the gateway API.

## How to run

### One command
```bash
docker compose up --build
```
> In the terminal, copy the code from runnable-file.txt, You can find this file in this zip. Once you run the code on your terminal, then run docker compose up -d --build.
It will build all the microservice with Maven, download dependancies and prepare Docker images. 


This launches:
- Frontend
- RabbitMQ
- PostgreSQL
- All microservices and the gateway
- Spring Cloud Config Server

### Health & dashboards

- RabbitMQ UI: http://localhost:15672 (user: guest, pass: guest)
- Gateway: http://localhost:8080
- Actuator (each service): `http://localhost:<port>/actuator/health`

### Postman

Import `postman/Cinema.postman_collection.json` and run the request in order to verify all user stories.
(Registration -> Booking -> Payment -> Notification)

## User stories (testable)

- Register/login user
- List movies
- List showtimes for a movie
- Create booking (publishes event)
- Payment simulation (auto OK/FAILED 80/20)
- Notification logging on payment completed

## Architecture

Synchronous: Gateway → (User/Movie/Booking) via REST  
Asynchronous: Booking → RabbitMQ → Payment → RabbitMQ → Notification

see `docs/architecture.mermaid` for the full diagram!


## Frontend
React-frontend follows in `frontend/`:
- Dev: `npm install && npm run dev` (proxy to gateway: use `vite --host` or drive in Docker)
- Prod in Docker: `docker compose up --build` (frontend inn http://localhost:5173)

When you first open the frontend at (http://localhost:5173), you may see the message "no movie detected"
the system initially has no movies registered in the database. 
To use the Frontend, follow these steps:

1.  Log in as admin. 
    Use these credentials to access the admin panel and manage movies:
    - Email: admin@gmail.com
    - Password: admin123
2. Add movies and showtimes
    - Once your logged as admin, you can create new movies and showtimes.
3. Register regular user.
    - After you add movies, you can register a new user account to simulate a standard customer experience.
4. Book tickets.
    - When you select movies and a showtime and confirm booking. 
    - The backend system will handle the reservation, and it will simulate payment. 
    - It will send a confirmation notification.
## CI
GitHub Actions workflow `build.yml` builds all services by push/PR.

## Tester
Spring Boot tests are included, and it covers application context loading, REST controllers, and service layer logics.
The tests verify event driven communication between service (via RabbitMQ) and database persistence. 
The tests have stability and correctness across the full microservice workflow. 
