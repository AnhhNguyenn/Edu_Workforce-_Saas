FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Sử dụng non-root user có sẵn trong image .NET 8 để tăng cường bảo mật
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy toàn bộ file .csproj và restore để tận dụng Docker cache layer
COPY ["EduOps.Api/EduOps.Api.csproj", "EduOps.Api/"]
COPY ["EduOps.Application/EduOps.Application.csproj", "EduOps.Application/"]
COPY ["EduOps.Domain/EduOps.Domain.csproj", "EduOps.Domain/"]
COPY ["EduOps.Infrastructure/EduOps.Infrastructure.csproj", "EduOps.Infrastructure/"]
RUN dotnet restore "EduOps.Api/EduOps.Api.csproj"

# Copy mọi thứ còn lại và build
COPY . .
WORKDIR "/src/EduOps.Api"
RUN dotnet build "EduOps.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "EduOps.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Cấu hình Timezone chuẩn Việt Nam cho ứng dụng
ENV TZ=Asia/Ho_Chi_Minh

ENTRYPOINT ["dotnet", "EduOps.Api.dll"]
