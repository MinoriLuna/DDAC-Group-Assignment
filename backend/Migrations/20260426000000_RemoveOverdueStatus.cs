using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class RemoveOverdueStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE public.invoices SET status = 'Pending' WHERE status = 'Overdue';
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Overdue status is no longer used; no rollback needed
        }
    }
}
