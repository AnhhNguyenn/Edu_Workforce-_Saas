using System;
using System.ComponentModel.DataAnnotations;

namespace EduOps.Application.DTOs.User
{
    public class CreateUserRequestDto
    {
        public Guid? OrganizationId { get; set; } // Super Admin truyền vào, Center Admin thì hệ thống tự đè
        
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        public string FullName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [RegularExpression(@"^(0[3|5|7|8|9])+([0-9]{8})\b", ErrorMessage = "Số điện thoại không hợp lệ")]
        public string Phone { get; set; } = string.Empty;
        
        public string? Password { get; set; }
        
        [Required(ErrorMessage = "Chức vụ không được để trống")]
        public string Role { get; set; } = string.Empty; // SUPER_ADMIN, CENTER_ADMIN, TEACHER, ASSISTANT
        
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
    }
}
