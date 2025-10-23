FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/gateway-0.0.1.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
