set -euo pipefail
mvn -q -f gateway/pom.xml -DskipTests package
mvn -q -f user-service/pom.xml -DskipTests package
mvn -q -f movie-service/pom.xml -DskipTests package
mvn -q -f booking-service/pom.xml -DskipTests package
mvn -q -f payment-service/pom.xml -DskipTests package
mvn -q -f notification-service/pom.xml -DskipTests package
mvn -q -f config/pom.xml -DskipTests package
docker compose up --build
