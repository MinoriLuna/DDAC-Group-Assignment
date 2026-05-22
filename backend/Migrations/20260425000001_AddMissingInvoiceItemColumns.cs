using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddMissingInvoiceItemColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add quantity only if it doesn't already exist
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name   = 'invoice_items'
                          AND column_name  = 'quantity'
                    ) THEN
                        ALTER TABLE public.invoice_items ADD COLUMN quantity integer NOT NULL DEFAULT 1;
                    END IF;
                END $$;
            ");

            // Add unitprice only if it doesn't already exist
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name   = 'invoice_items'
                          AND column_name  = 'unitprice'
                    ) THEN
                        ALTER TABLE public.invoice_items ADD COLUMN unitprice numeric NOT NULL DEFAULT 0;
                    END IF;
                END $$;
            ");

            // Back-fill unitprice from amount for any pre-existing rows
            migrationBuilder.Sql(@"
                UPDATE public.invoice_items SET unitprice = amount WHERE unitprice = 0 AND amount > 0;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE public.invoice_items DROP COLUMN IF EXISTS quantity;
                ALTER TABLE public.invoice_items DROP COLUMN IF EXISTS unitprice;
            ");
        }
    }
}
