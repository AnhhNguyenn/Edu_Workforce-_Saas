using System;

namespace EduOps.Domain.Entities
{
    public class TenantCustomField : TenantEntity
    {
        public string EntityName { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string FieldType { get; set; } = "Text"; // Text, Number, URL, Date, etc.
        public bool IsRequired { get; set; } = false;
        public int OrderIndex { get; set; } = 0;
    }
}
