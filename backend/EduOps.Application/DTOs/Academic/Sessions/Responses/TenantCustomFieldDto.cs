using System;

namespace EduOps.Application.DTOs.Academic.Sessions.Responses
{
    public class TenantCustomFieldDto
    {
        public Guid Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public int OrderIndex { get; set; }
    }
}
