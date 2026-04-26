using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixInvoiceItemColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
                ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS unitprice numeric NOT NULL DEFAULT 0;
                UPDATE public.invoice_items SET unitprice = amount WHERE unitprice = 0 AND amount > 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_invoices_appointments_appointmentid",
                schema: "public",
                table: "invoices");

            migrationBuilder.AddForeignKey(
                name: "FK_invoices_appointments_appointmentid",
                schema: "public",
                table: "invoices",
                column: "appointmentid",
                principalSchema: "public",
                principalTable: "appointments",
                principalColumn: "appointmentid",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
