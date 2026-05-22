using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class ReceptionistModules : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── New columns on users ──────────────────────────────────────────
            migrationBuilder.AddColumn<DateTime>(
                name: "dateofbirth",
                schema: "public",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gender",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "icpassport",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergencycontactname",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergencycontactphone",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergencycontactrelation",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            // ── New columns on appointments ───────────────────────────────────
            migrationBuilder.AddColumn<DateTime>(
                name: "checkintime",
                schema: "public",
                table: "appointments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cancellationreason",
                schema: "public",
                table: "appointments",
                type: "text",
                nullable: true);

            // ── Create invoices ───────────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "public",
                columns: table => new
                {
                    invoiceid     = table.Column<Guid>(type: "uuid", nullable: false),
                    appointmentid = table.Column<Guid>(type: "uuid", nullable: true),
                    patientid     = table.Column<Guid>(type: "uuid", nullable: false),
                    totalamount   = table.Column<decimal>(type: "numeric", nullable: false),
                    status        = table.Column<string>(type: "text", nullable: false),
                    paymentmethod = table.Column<string>(type: "text", nullable: true),
                    createdat     = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    paidat        = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoices", x => x.invoiceid);
                    table.ForeignKey(
                        name: "FK_invoices_appointments_appointmentid",
                        column: x => x.appointmentid,
                        principalSchema: "public",
                        principalTable: "appointments",
                        principalColumn: "appointmentid",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_invoices_users_patientid",
                        column: x => x.patientid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            // ── Create invoice_items ──────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "invoice_items",
                schema: "public",
                columns: table => new
                {
                    itemid      = table.Column<Guid>(type: "uuid", nullable: false),
                    invoiceid   = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    quantity    = table.Column<int>(type: "integer", nullable: false),
                    unitprice   = table.Column<decimal>(type: "numeric", nullable: false),
                    amount      = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoice_items", x => x.itemid);
                    table.ForeignKey(
                        name: "FK_invoice_items_invoices_invoiceid",
                        column: x => x.invoiceid,
                        principalSchema: "public",
                        principalTable: "invoices",
                        principalColumn: "invoiceid",
                        onDelete: ReferentialAction.Cascade);
                });

            // ── Create internal_messages ──────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "internal_messages",
                schema: "public",
                columns: table => new
                {
                    messageid  = table.Column<Guid>(type: "uuid", nullable: false),
                    senderid   = table.Column<Guid>(type: "uuid", nullable: false),
                    receiverid = table.Column<Guid>(type: "uuid", nullable: false),
                    content    = table.Column<string>(type: "text", nullable: false),
                    sentat     = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    isread     = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_internal_messages", x => x.messageid);
                    table.ForeignKey(
                        name: "FK_internal_messages_users_senderid",
                        column: x => x.senderid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_internal_messages_users_receiverid",
                        column: x => x.receiverid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            // ── Create system_notifications ───────────────────────────────────
            migrationBuilder.CreateTable(
                name: "system_notifications",
                schema: "public",
                columns: table => new
                {
                    notificationid = table.Column<Guid>(type: "uuid", nullable: false),
                    userid         = table.Column<Guid>(type: "uuid", nullable: false),
                    title          = table.Column<string>(type: "text", nullable: false),
                    message        = table.Column<string>(type: "text", nullable: false),
                    type           = table.Column<string>(type: "text", nullable: false),
                    isread         = table.Column<bool>(type: "boolean", nullable: false),
                    createdat      = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_notifications", x => x.notificationid);
                    table.ForeignKey(
                        name: "FK_system_notifications_users_userid",
                        column: x => x.userid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            // ── Indexes ───────────────────────────────────────────────────────
            migrationBuilder.CreateIndex(name: "IX_invoices_appointmentid",     schema: "public", table: "invoices",              column: "appointmentid");
            migrationBuilder.CreateIndex(name: "IX_invoices_patientid",         schema: "public", table: "invoices",              column: "patientid");
            migrationBuilder.CreateIndex(name: "IX_invoice_items_invoiceid",    schema: "public", table: "invoice_items",         column: "invoiceid");
            migrationBuilder.CreateIndex(name: "IX_internal_messages_senderid", schema: "public", table: "internal_messages",     column: "senderid");
            migrationBuilder.CreateIndex(name: "IX_internal_messages_receiverid",schema: "public", table: "internal_messages",    column: "receiverid");
            migrationBuilder.CreateIndex(name: "IX_system_notifications_userid", schema: "public", table: "system_notifications", column: "userid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "invoice_items",         schema: "public");
            migrationBuilder.DropTable(name: "invoices",              schema: "public");
            migrationBuilder.DropTable(name: "internal_messages",     schema: "public");
            migrationBuilder.DropTable(name: "system_notifications",  schema: "public");

            migrationBuilder.DropColumn(name: "dateofbirth",              schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "gender",                   schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "icpassport",               schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "emergencycontactname",     schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "emergencycontactphone",    schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "emergencycontactrelation", schema: "public", table: "users");
            migrationBuilder.DropColumn(name: "checkintime",              schema: "public", table: "appointments");
            migrationBuilder.DropColumn(name: "cancellationreason",       schema: "public", table: "appointments");
        }
    }
}
