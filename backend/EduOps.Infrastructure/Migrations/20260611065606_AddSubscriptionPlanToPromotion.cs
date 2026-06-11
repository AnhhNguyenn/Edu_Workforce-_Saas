using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlanToPromotion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SubscriptionPlanId",
                table: "Promotions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_SubscriptionPlanId",
                table: "Promotions",
                column: "SubscriptionPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Promotions_SubscriptionPlans_SubscriptionPlanId",
                table: "Promotions",
                column: "SubscriptionPlanId",
                principalTable: "SubscriptionPlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Promotions_SubscriptionPlans_SubscriptionPlanId",
                table: "Promotions");

            migrationBuilder.DropIndex(
                name: "IX_Promotions_SubscriptionPlanId",
                table: "Promotions");

            migrationBuilder.DropColumn(
                name: "SubscriptionPlanId",
                table: "Promotions");
        }
    }
}
