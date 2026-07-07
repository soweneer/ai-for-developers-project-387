# All-in-one image: frontend (nginx) + backend (ASP.NET Core) + database (PostgreSQL)
# in a single container. Only nginx's port (bound to $PORT) is exposed externally;
# the backend and postgres are only reachable from inside the container.

# ---- frontend build ----
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci
COPY apps/frontend/ ./
# Same-origin API calls: nginx reverse-proxies API routes to the backend.
ENV VITE_API_BASE_URL=""
RUN npm run build

# ---- backend build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS backend-build
WORKDIR /src
COPY apps/backend/Cal.Web.slnx ./
COPY apps/backend/src/Cal.Domain/Cal.Domain.csproj src/Cal.Domain/
COPY apps/backend/src/Cal.Application/Cal.Application.csproj src/Cal.Application/
COPY apps/backend/src/Cal.Infrastructure/Cal.Infrastructure.csproj src/Cal.Infrastructure/
COPY apps/backend/src/Cal.Web/Cal.Web.csproj src/Cal.Web/
RUN dotnet restore src/Cal.Web/Cal.Web.csproj
COPY apps/backend/src/ src/
RUN dotnet publish src/Cal.Web/Cal.Web.csproj -c Release -o /app --no-restore

# ---- final runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
RUN apk add --no-cache nginx postgresql16 su-exec krb5-libs

COPY --from=backend-build /app /app/backend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV ASPNETCORE_URLS=http://127.0.0.1:8081 \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__Default="Host=127.0.0.1;Port=5432;Database=cal;Username=cal;Password=cal" \
    PGDATA=/var/lib/postgresql/data \
    PORT=8080

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
