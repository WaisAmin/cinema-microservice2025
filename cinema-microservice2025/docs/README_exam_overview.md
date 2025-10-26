
# PG3402 – README (Exam)

## Overview
The project is a Cinema system built with microservice. The system allows users, to register,
log in, choose movie, reserve tickets, and receive confirmation after payment. 
Services:

-   Gateway: Load balance, routing, entry point
  - User-service: Log (JWT) and registration
    - Movie-service: Showtimes and movies
    - Booking-service: RabbitMQ events and reservations
    - Payment-service: Simulates payment and gives results
    - Notification-service: Sending confirmation
    - Config: Central configuration
    - Frontend: React interface for use/administration

## How to run
-   The project is built by running the command from the root folder, or by using 
    Runnable-file.txt which automates the process. 
  - "mvn clean package -DskipTests".
    - This builds all the microservice, and downloads the required dependencies,
    and generates jar. files for each service. 
      - Each microservice has its own Dockerfile. To build and run, for example 
      Movie service separately. 
        - cd movie-service
          docker build -t movie-service:local .
          docker run --env-file .env --network=host movie-service:local.
          - To start the entire system once
            runnable-file.txt
            docker compose up --build
          - This will start all microservice, Gateway, PostgreSQL, RabbitMQ, Configuration service, 
           and Frontend (REACT).
            - After startup the system is available at:
            - Frontend: http://localhost:5173
            - Gateway/API: http://localhost:8080
            - RabbitMQ UI: http://localhost:15672 (guest/guest)


## Test accounts / credentials 
User account:
-   Admin User
  - E-post: admin@gmail.com
    - Password: admin123
    - Used to log in as an administrator and add movies and showtimes
    Example User:
    - E-post: user@gmail.com
    - Password: user123
    - This can be registered after Admin user.

RabbitMQ:
-   Management: http://localhost:15672
  - User: guest
  - Password: gust
    - Here you can check the queues "booking.created.queue" and "payment.created.queue"
    to see the flow of events in the system. 

      
Database:
-   Each service connects to its own database in the Docker Compose. 


## Postman
To test the entire system, a Postman collection is included in the project below:
postman/cinema.postman_collection.json


## Architecture
- The system is built for microservice architecture where each service has its own 
responsibility and communication with other service either asynchronously (RabbitMQ)
or synchronously (REST).

**Communication:**
- Synchronous (REST):
  -     Gateway -> User-service / Movie-service / Booking-service
    - Uses for direct requests from the user interface, such as logging in, retrieving movies,
    and creating orders.
  - Asynchronous (RabbitMQ):
    - Booking-service -> Payment-service -> Notification-service
  - This is used for event-driven flow after an order is created

## Assumptions/Simplification
During the development, some choices and simplifications were made to keep the project
focused on microservice architecture core logic. 
At the same time the project was expanded significantly beyond what was originally described
in the assignment. More features, integrations and a complete frontend were made to make
the project more realistic. 
This provided both better functionality and valuable practical experience. 

- All services uses a single PostgrSQL instead of separate database. 
- The payment process is simulated and returns a random "ok" or "error"
- No seat maps or advanced seat reservation, just simple ordering per movie view.
- Notification are sent as log messages instead of real emails.
- The Frontend interface is simplified, but enhanced with real admin features and interactivity
- Simple role distribution "admin and user" without full access control.

## Next step towards production
If i were developing the system further, the next step will be: 
- Implementing real seat maps and real time updates of reserved seats
- made real payment services (Vipps or DnB)
- I would add email notifications with similar API
- I would separate database per service with separate users and passwords



## Roles and responsibility 
We are two people that carried the project in team. Both participated in developing, 
planning, testing and documenting the project. 

Candidate: 74 
- Responsible for backend architecture, microservices setup, docker configuration and 
RabbitMQ integration
- Implementing the main logic of Booking, payment and notification services
- Testing and technical quality assurance "README and runnable files"


Candidate: 50
- Responsible for frontend (React) and integration with gateway and API end point
- Developed the user interface with admin functions like adding movies, showing and 
user flow and booking confirmation
- implemented User-service and parts of the getaway routing

Both worked closely on architecture, database setup, CI configuration and fixing bugs.
The project was developed with continuous testing! So that the backend and frontend were
completed. 

We have worked very hard on this project, many hours of debugging, designing, 
coding and improvements. 
Through the work we have learned an amount of both technically and collaboratively,
and we are proud of the result we have created.
This project represents not just exam but a work we have truly put our heart and effort into.
We believe that the result reflects the dedication and we have gained along the way.

