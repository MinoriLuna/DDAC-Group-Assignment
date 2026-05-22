using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("invoice_items", Schema = "public")]
public class InvoiceItem
{
    [Key]
    [Column("itemid")]
    public Guid ItemId { get; set; } = Guid.NewGuid();

    [Column("invoiceid")]
    public Guid InvoiceId { get; set; }

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("unitprice")]
    public decimal UnitPrice { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [JsonIgnore]
    [ForeignKey("InvoiceId")]
    public Invoice? Invoice { get; set; }
}
