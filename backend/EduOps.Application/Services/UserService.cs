using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<UserDto>> GetUsersAsync(Guid? organizationId, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            var repo = _unitOfWork.Repository<User>();
            
            var queryPredicate = string.IsNullOrEmpty(searchKeyword) 
                ? (System.Linq.Expressions.Expression<Func<User, bool>>)(u => (!organizationId.HasValue || u.OrganizationId == organizationId))
                : (System.Linq.Expressions.Expression<Func<User, bool>>)(u => (!organizationId.HasValue || u.OrganizationId == organizationId) && 
                                                                              (u.FullName.Contains(searchKeyword) || u.Email.Contains(searchKeyword) || (u.Phone != null && u.Phone.Contains(searchKeyword))));

            var result = await repo.FindPagedAsync(queryPredicate, pageNumber, pageSize);

            return new PagedResult<UserDto>
            {
                Items = result.Items.Select(u => u.ToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            if (user == null) throw new NotFoundException("User", id);

            return user.ToDto();
        }

        public async Task<UserDto> CreateUserAsync(UserRequestDto request, Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<User>();
            
            // Validate Email
            var existing = await repo.FindAsync(u => u.Email == request.Email);
            if (existing.Any())
                throw new BadRequestException("Email already exists");

            // Chặn giới hạn tạo Giáo viên và Trợ giảng dựa trên gói cước của Trung tâm
            if (organizationId.HasValue && (request.Role == "TEACHER" || request.Role == "ASSISTANT"))
            {
                var orgRepo = _unitOfWork.Repository<Organization>();
                var org = await orgRepo.GetByIdAsync(organizationId.Value);
                if (org != null)
                {
                    var currentCount = await repo.CountAsync(u => u.OrganizationId == organizationId.Value && (u.Role == "TEACHER" || u.Role == "ASSISTANT") && u.DeletedAt == null);
                    if (currentCount >= org.MaxUsers)
                        throw new BadRequestException($"Đã đạt giới hạn nhân viên của gói cước (Tối đa {org.MaxUsers} người). Vui lòng nâng cấp gói!");
                }
            }

            var passwordHash = string.IsNullOrEmpty(request.Password) 
                ? BCrypt.Net.BCrypt.HashPassword("Default@123") 
                : BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                OrganizationId = organizationId,
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = passwordHash,
                Role = request.Role,
                Gender = request.Gender,
                BirthDate = request.BirthDate,
                Address = request.Address,
                Status = "ACTIVE"
            };

            await repo.AddAsync(newUser);
            await _unitOfWork.CommitAsync();

            return newUser.ToDto();
        }

        public async Task UpdateUserAsync(Guid id, UserRequestDto request)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null) throw new NotFoundException("User", id);

            user.FullName = request.FullName;
            user.Phone = request.Phone;
            user.Gender = request.Gender;
            user.BirthDate = request.BirthDate;
            user.Address = request.Address;

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeactivateUserAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.Status = "INACTIVE";
            repo.Update(user);
            
            // Xóa logic giảm CurrentUsers vì chúng ta đã đếm trực tiếp từ DB
            
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteUserAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.DeletedAt = DateTime.UtcNow;
            user.Status = "SUSPENDED";
            repo.Update(user);
            
            // Xóa logic giảm CurrentUsers vì chúng ta đã đếm trực tiếp từ DB
            
            await _unitOfWork.CommitAsync();
        }

        public async Task LockUserAsync(Guid id, DateTime? lockEndAt)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.Status = "SUSPENDED";
            user.LockEndAt = lockEndAt ?? DateTime.MaxValue; // Default to permanent lock if null
            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task UnlockUserAsync(Guid id)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.Status = "ACTIVE";
            user.LockEndAt = null;
            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
