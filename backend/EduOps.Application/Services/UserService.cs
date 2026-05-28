using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
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

        public async Task<IEnumerable<UserDto>> GetUsersAsync(Guid? organizationId)
        {
            var repo = _unitOfWork.Repository<User>();
            var users = organizationId.HasValue 
                ? await repo.FindAsync(u => u.OrganizationId == organizationId)
                : await repo.GetAllAsync();

            return users.Select(u => u.ToDto());
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
                throw new Exception("Email already exists");

            var newUser = new User
            {
                OrganizationId = organizationId,
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = request.Password, // TODO: BCrypt Hash
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
            if (user == null) throw new NotFoundException("User", id);

            user.Status = "INACTIVE";
            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
