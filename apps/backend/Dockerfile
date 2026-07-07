FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY Cal.Web.slnx ./
COPY src/Cal.Domain/Cal.Domain.csproj src/Cal.Domain/
COPY src/Cal.Application/Cal.Application.csproj src/Cal.Application/
COPY src/Cal.Infrastructure/Cal.Infrastructure.csproj src/Cal.Infrastructure/
COPY src/Cal.Web/Cal.Web.csproj src/Cal.Web/
RUN dotnet restore src/Cal.Web/Cal.Web.csproj

COPY src/ src/
RUN dotnet publish src/Cal.Web/Cal.Web.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Cal.Web.dll"]
