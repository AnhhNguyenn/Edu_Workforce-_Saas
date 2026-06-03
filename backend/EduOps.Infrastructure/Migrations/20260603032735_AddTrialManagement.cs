using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduOps.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrialManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomTrialMaxUsers",
                table: "Organizations",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomTrialMaxUsers",
                table: "Organizations");
        }
    }
}
