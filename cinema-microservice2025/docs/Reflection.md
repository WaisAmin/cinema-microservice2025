
# Reflection

## Architecture and technology choice
- The project is build for microservice for easy scaling, and independent development of 
each service. The following technologies and framework were selected based on integration
stability and experience in field:

- Spring Boot "Java 17": Main framework for all service. provides fast startup, easy 
configuration, and good support for REST and RabbitMQ
- Spring Cloud gateway: This is used as an entry point for all API calls. It handles routing,
loading balances and secures access between services. 
- RabbitMQ: This messages queue for asynchronous communication between ordering, payments and
notification service
- We chose this beacuse it provides reliable event driven architecture and better service.
- PostgrSQL: This will make database relation better and mgive stabilit, and easy integration with
Spring Data JPA
- Spring Cloud Config: This will central configuration server that allows all services 
to dynamically retrieve. 
- Docker and Docker Compose: This is used for containerization and easy startup 
of the entire system locally. 
- React (Vite): This is used as a frontend framework for a simple and interactive user
experience
We chose this beacuse its user-friendly system, and each service can be developed and 
scaled without affecting the whole.

## Tradeoffs
During developing the project, we made some choices where we created more advanced 
solution to keep the project more realistic. 
What we chose to remove and why?
- We separated database per service so that we use one common PostgreSQL instance
for easy startup and maintenance. 
Consequence: The service are not isolated at database which reduces full independence between them.
- Real payment: We chose to implement payments instead of using an API like Vipps.
Consequence: We get less realistic but it will get easier to test and run. 
- Email notification: The notifications are logged to the console instead of being 
sent like real email service. 
Consequence: Its more simple, but does not provide a complete user experience. 
- Advanced access control JWT: We use JWT only to authentic and not full role base.
Consequence: Its easy to manage, but not good for production environment. 

These changes made it possible to deliver a stable and good system that focuses on microservices, 
event-flow and container without losing focus on the learning.

## Changes along the way
Throughout the process, the project was adjusted and improved several times, both technically and structurally.
As we gained a deeper understanding of the microservices and the tools we used, 
we made some changes to make the solution more realistic.
- Restructuring communication: We only used REST between services, but we implemented RabbitMQ to support event-driven architecture.
  This provided better asynchronous flow and taught us the importance of loose coupling.
- Extended frontend: We started with a simple interface idea, but ended up building a 
  full React system with an admin panel and user booking. 
  This improved the experience and gave us valuable experience with integration with microservices.
- Improved Docker setup: Along the way, we simplified the container setup and used Docker Compose
  to automatically start the entire system. This taught us how important a consistent environment
  and automation are.
- Introducing Spring Cloud Config: We added a central configuration server to manage environment variables
  and ensure consistent behavior between services. This gave us better control and flexibility in the system.
- Improved logging and structure: We cleaned up the logging, error handling and service structure to
  make the code more professional.
We learned how important architecture choice and planing are in large project. 
at the same time we learned that microservice are not just about dividing up code, but about 
communication and interact between system. 

this project taught us more than just technical skills, It taught us to think like developers.

## What would i do next?
The project functions is stably a microservices system, but to take it further towards a production environment,
there are several improvements that can make the solution even better and more secure and scalable.
The system could have handled errors and temporary interruptions better. 
For example, we could have added retry functionality to the RabbitMQ integration so that messages
are not lost if a service is unavailable.
When it comes to scalability, the next step would be to move from Docker Compose to "Kubernetes". 
This will multiple instances of each microservice to be launched automatically, 
and traffic to be distributed between them as needed.
We could also configure the gateway to handle load balancing and routing more efficiently. 
We could split the database so that each service gets its own database
and can scale independently of the others.
With these changes the solution will be more technically and operationally better. 
The system has already a solid foundation and covers all the requirements for the work,
but with these measures it can be further better developed and
secure and scalable production system.

## My contribution
I had responsibility for the backend architecture and implementing of the microservice.
I had to sett up Docker, RabbitMQ and Spring Cloud Config, as well as developing the booking,
payment, and notification service. I also worked on the integration between the service,
testing Postman and preparing README documentation and runnable-file.txt.
I actively contributed to structuring the project, fixing many bugs and making the quality
of the entire system better. 
We have put a lot of time and effort into this project, both in planning, coding and testing.
I wanted to deliver not just a working system but a microservice project that shows
how much i have learned, and how dedicated i have been. 
I am proud of the result, and feel that i have really done my best to create something
good and professional.
