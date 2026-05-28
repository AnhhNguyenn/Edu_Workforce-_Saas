FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy toàn bộ file .csproj và restore as distinct layers
COPY ["EduOps.Api/EduOps.Api.csproj", "EduOps.Api/"]
COPY ["EduOps.Application/EduOps.Application.csproj", "EduOps.Application/"]
COPY ["EduOps.Domain/EduOps.Domain.csproj", "EduOps.Domain/"]
COPY ["EduOps.Infrastructure/EduOps.Infrastructure.csproj", "EduOps.Infrastructure/"]

RUN dotnet restore "EduOps.Api/EduOps.Api.csproj"

# Copy mọi thứ còn lại và build
COPY . .
WORKDIR "/src/EduOps.Api"
RUN dotnet build "EduOps.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EduOps.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EduOps.Api.dll"]
