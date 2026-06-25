using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeAuditLogAndAiPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionLink",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SystemBroadcastId",
                table: "Notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SystemBroadcasts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    ActionLink = table.Column<string>(type: "text", nullable: true),
                    TargetRoles = table.Column<string>(type: "text", nullable: true),
                    TargetPercentage = table.Column<int>(type: "integer", nullable: false),
                    IsSent = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsRecalled = table.Column<bool>(type: "boolean", nullable: false),
                    RecalledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemBroadcasts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_SystemBroadcastId",
                table: "Notifications",
                column: "SystemBroadcastId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_SystemBroadcasts_SystemBroadcastId",
                table: "Notifications",
                column: "SystemBroadcastId",
                principalTable: "SystemBroadcasts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_SystemBroadcasts_SystemBroadcastId",
                table: "Notifications");

            migrationBuilder.DropTable(
                name: "SystemBroadcasts");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_SystemBroadcastId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "ActionLink",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SystemBroadcastId",
                table: "Notifications");
        }
    }
}
