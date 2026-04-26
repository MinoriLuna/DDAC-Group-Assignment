using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddAvailabilitySchedule : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // licensenumber was added to the model but never migrated
            migrationBuilder.AddColumn<string>(
                name: "licensenumber",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "availabledays",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "availablefrom",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "availableto",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "licensenumber", schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "availabledays", schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "availablefrom", schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "availableto", schema: "public", table: "users");
        }
    }
}
