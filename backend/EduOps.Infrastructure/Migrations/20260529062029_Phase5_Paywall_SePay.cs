using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase5_Paywall_SePay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPresent",
                table: "StudentSessionAttendances",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackForAssistant",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackForTeacher",
                table: "Reports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingForAssistant",
                table: "Reports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingForTeacher",
                table: "Reports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubscriptionStatus",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SePayTransactionId",
                table: "BillingTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_OrganizationId",
                table: "Users",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_SessionDate_TeacherId",
                table: "Sessions",
                columns: new[] { "SessionDate", "TeacherId" });

            migrationBuilder.CreateIndex(
                name: "IX_Schools_OrganizationId",
                table: "Schools",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Code",
                table: "Organizations",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_SchoolId",
                table: "Classes",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_SessionId",
                table: "Attendances",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_OrganizationId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_SessionDate_TeacherId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_Schools_OrganizationId",
                table: "Schools");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_Code",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Classes_SchoolId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_SessionId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "IsPresent",
                table: "StudentSessionAttendances");

            migrationBuilder.DropColumn(
                name: "FeedbackForAssistant",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "FeedbackForTeacher",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "RatingForAssistant",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "RatingForTeacher",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "SubscriptionStatus",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "SePayTransactionId",
                table: "BillingTransactions");
        }
    }
}
