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
        private readonly ICurrentUserService _currentUserService;

        public UserService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResult<UserDto>> GetUsersAsync(Guid? organizationId, int pageNumber, int pageSize, string? searchKeyword = null)
        {
            var repo = _unitOfWork.Repository<User>();
            
            var queryPredicate = string.IsNullOrEmpty(searchKeyword) 
                ? (System.Linq.Expressions.Expression<Func<User, bool>>)(u => (!organizationId.HasValue || u.OrganizationId == organizationId) && u.DeletedAt == null)
                : (System.Linq.Expressions.Expression<Func<User, bool>>)(u => (!organizationId.HasValue || u.OrganizationId == organizationId) && u.DeletedAt == null && 
                                                                              (u.FullName.ToLower().Contains(searchKeyword.ToLower()) || 
                                                                               u.Email.ToLower().Contains(searchKeyword.ToLower()) || 
                                                                               (u.Phone != null && u.Phone.Contains(searchKeyword))));

            var result = await repo.FindPagedAsync(queryPredicate, pageNumber, pageSize, asNoTracking: true);

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
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id, asNoTracking: true);
            if (user == null) throw new NotFoundException("User", id);

            return user.ToDto();
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequestDto request, Guid? organizationId)
        {
            if (request.Role == "SUPER_ADMIN" && _currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");
                
            if (_currentUserService.Role == "CENTER_ADMIN" && request.Role != "TEACHER" && request.Role != "ASSISTANT")
                throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");
            
            if (request.Role != "SUPER_ADMIN" && organizationId == null)
                throw new BadRequestException("Nhân sự này bắt buộc phải thuộc về một Trung tâm (OrganizationId).");

            var repo = _unitOfWork.Repository<User>();
            
            // Validate Email
            request.Email = request.Email.ToLower();
            var emailExists = await repo.AnyAsync(u => u.Email == request.Email, ignoreQueryFilters: true);
            if (emailExists)
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
                ? await Task.Run(() => BCrypt.Net.BCrypt.HashPassword("Default@123")) 
                : await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.Password));

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

        public async Task UpdateUserAsync(Guid id, UpdateUserRequestDto request)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null) throw new NotFoundException("User", id);

            if (user.Email != request.Email && !string.IsNullOrEmpty(request.Email))
            {
                request.Email = request.Email.ToLower();
                if (user.Email != request.Email)
                {
                    var emailExists = await repo.AnyAsync(u => u.Email == request.Email, ignoreQueryFilters: true);
                    if (emailExists) throw new BadRequestException("Email already exists");
                    user.Email = request.Email;
                }
            }

            user.FullName = request.FullName;
            user.Phone = request.Phone;
            user.Gender = request.Gender;
            user.BirthDate = request.BirthDate;
            user.Address = request.Address;
            
            if (!string.IsNullOrEmpty(request.Role))
            {
                if (request.Role == "SUPER_ADMIN" && _currentUserService.Role != "SUPER_ADMIN")
                    throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");
                    
                if (_currentUserService.Role == "CENTER_ADMIN" && request.Role != "TEACHER" && request.Role != "ASSISTANT")
                    throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");
                    
                if (id == _currentUserService.UserId && request.Role != user.Role)
                    throw new BadRequestException("Bạn không thể tự thay đổi chức vụ của chính mình.");
                    
                user.Role = request.Role;
            }

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeactivateUserAsync(Guid id)
        {
            if (id == _currentUserService.UserId)
                throw new BadRequestException("Bạn không thể vô hiệu hóa chính tài khoản của mình.");

            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.Status = "INACTIVE";
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            
            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteUserAsync(Guid id)
        {
            if (id == _currentUserService.UserId)
                throw new BadRequestException("Bạn không thể xóa chính tài khoản của mình.");

            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.DeletedAt = DateTime.UtcNow;
            user.Status = "SUSPENDED";
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.Email = $"{user.Email}.deleted_{Guid.NewGuid()}";

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task LockUserAsync(Guid id, DateTime? lockEndAt)
        {
            if (id == _currentUserService.UserId)
                throw new BadRequestException("Bạn không thể khóa chính tài khoản của mình.");

            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(id);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", id);

            user.Status = "SUSPENDED";
            user.LockEndAt = lockEndAt ?? DateTime.MaxValue; // Default to permanent lock if null
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

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

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(userId);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", userId);

            bool isValid = await Task.Run(() => BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash));
            if (!isValid)
                throw new BadRequestException("Mật khẩu cũ không chính xác.");

            user.PasswordHash = await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(request.NewPassword));
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            
            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task ResetPasswordAsync(Guid? adminOrgId, Guid targetUserId, string newPassword)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(targetUserId);
            
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", targetUserId);
            
            if (adminOrgId.HasValue && user.OrganizationId != adminOrgId.Value)
                throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");

            user.PasswordHash = await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(newPassword));
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
