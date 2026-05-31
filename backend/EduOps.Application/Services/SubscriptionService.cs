using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Subscription;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace EduOps.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICustomLogger _logger;
        private readonly IMemoryCache _cache;
        
        private const string PLANS_CACHE_KEY = "ALL_SUBSCRIPTION_PLANS";

        public SubscriptionService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, ICustomLogger logger, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _logger = logger;
            _cache = cache;
        }

        public async Task<IEnumerable<SubscriptionPlanDto>> GetPlansAsync()
        {
            var cachedPlans = await _cache.GetOrCreateAsync(PLANS_CACHE_KEY, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
                
                var plans = await _unitOfWork.Repository<SubscriptionPlan>()
                    .FindAsync(p => p.Status == AccountStatus.ACTIVE && p.DeletedAt == null);
                    
                return plans.Select(p => new SubscriptionPlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    MaxUsers = p.MaxUsers,
                    PricePerMonth = p.PricePerMonth,
                    PricePerYear = p.PricePerYear,
                    Status = p.Status.ToString()
                }).ToList();
            });

            return cachedPlans ?? new List<SubscriptionPlanDto>();
        }

        public async Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được tạo gói cước.");

            var plan = new SubscriptionPlan
            {
                Name = request.Name,
                Description = request.Description,
                MaxUsers = request.MaxUsers,
                PricePerMonth = request.PricePerMonth,
                PricePerYear = request.PricePerYear,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<SubscriptionPlan>().AddAsync(plan);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);

            return new SubscriptionPlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                MaxUsers = plan.MaxUsers,
                PricePerMonth = plan.PricePerMonth,
                PricePerYear = plan.PricePerYear,
                Status = plan.Status.ToString()
            };
        }

        public async Task<IEnumerable<PromotionDto>> GetPromotionsAsync()
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem danh sách khuyến mãi.");

            var promos = await _unitOfWork.Repository<Promotion>().GetAllAsync();
            
            return promos.Select(p => new PromotionDto
            {
                Id = p.Id,
                Code = p.Code,
                Type = p.Type.ToString(),
                DiscountPercentage = p.DiscountPercentage,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                MaxUses = p.MaxUses,
                CurrentUses = p.CurrentUses,
                Status = p.Status.ToString()
            }).ToList();
        }

        public async Task<PromotionDto> CreatePromotionAsync(PromotionRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được tạo mã khuyến mãi.");

            if (!string.IsNullOrEmpty(request.Code))
            {
                var exists = await _unitOfWork.Repository<Promotion>().AnyAsync(p => p.Code == request.Code);
                if (exists) throw new BadRequestException($"Mã khuyến mãi '{request.Code}' đã tồn tại.");
            }

            var promo = new Promotion
            {
                Code = request.Code,
                Type = Enum.Parse<PromotionType>(request.Type),
                DiscountPercentage = request.DiscountPercentage,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                MaxUses = request.MaxUses,
                CurrentUses = 0,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<Promotion>().AddAsync(promo);
            await _unitOfWork.CommitAsync();

            return new PromotionDto
            {
                Id = promo.Id,
                Code = promo.Code,
                Type = promo.Type.ToString(),
                DiscountPercentage = promo.DiscountPercentage,
                StartDate = promo.StartDate,
                EndDate = promo.EndDate,
                MaxUses = promo.MaxUses,
                CurrentUses = promo.CurrentUses,
                Status = promo.Status.ToString()
            };
        }

        public async Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request)
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null || _currentUserService.Role != "CENTER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ Quản trị viên Trung tâm mới được mua gói cước.");

            var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(request.PlanId);
            if (plan == null || plan.Status != AccountStatus.ACTIVE)
                throw new BadRequestException("Gói cước không tồn tại hoặc đã ngừng cung cấp.");

            decimal basePrice = request.BillingCycle == "YEARLY" ? plan.PricePerYear : plan.PricePerMonth;
            int monthsToAdd = request.BillingCycle == "YEARLY" ? 12 : 1;
            decimal finalPrice = basePrice;

            Guid? appliedPromotionId = null;

            if (!string.IsNullOrEmpty(request.PromoCode))
            {
                var now = DateTime.UtcNow;
                var promo = (await _unitOfWork.Repository<Promotion>()
                    .FindAsync(p => p.Code == request.PromoCode && p.Status == AccountStatus.ACTIVE)).FirstOrDefault();

                if (promo == null) throw new BadRequestException("Mã khuyến mãi không hợp lệ.");
                if (now < promo.StartDate || now > promo.EndDate) throw new BadRequestException("Mã khuyến mãi không trong thời gian sử dụng.");
                
                if (promo.MaxUses.HasValue)
                {
                    if (promo.CurrentUses >= promo.MaxUses.Value)
                        throw new BadRequestException("Mã khuyến mãi đã hết lượt sử dụng.");

                    // CHÚ Ý: KHÔNG TRỪ LƯỢT DÙNG Ở ĐÂY ĐỂ CHỐNG "GIỎ HÀNG ẢO".
                    // Lượt dùng sẽ chỉ được trừ khi SePay báo thanh toán SUCCESS (Phần 5).
                }

                appliedPromotionId = promo.Id;
                finalPrice = basePrice - (basePrice * promo.DiscountPercentage / 100);
            }

            var refCode = $"EDU-{orgId.Value.ToString().Substring(0, 4).ToUpper()}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            var transactionStatus = BillingStatus.PENDING;

            // XỬ LÝ DEADLOCK 0 ĐỒNG (FREE TIER)
            if (finalPrice == 0)
            {
                transactionStatus = BillingStatus.PAID;
                
                // Trừ lượt khuyến mãi (vì giao dịch đã thành công ngay lập tức)
                if (appliedPromotionId.HasValue)
                {
                    var promo = await _unitOfWork.Repository<Promotion>().GetByIdAsync(appliedPromotionId.Value);
                    if (promo != null)
                    {
                        promo.CurrentUses += 1;
                        _unitOfWork.Repository<Promotion>().Update(promo);
                    }
                }

                // Cập nhật trạng thái Organization (Kích hoạt Gói)
                var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(orgId.Value);
                if (org != null)
                {
                    org.SubscriptionStatus = plan.Name.ToUpper();
                    org.MaxUsers = plan.MaxUsers;
                    
                    var now = DateTime.UtcNow;
                    var currentEnd = org.SubscriptionEnd ?? now;
                    var startCalculatingFrom = currentEnd > now ? currentEnd : now;
                    
                    org.SubscriptionStart = org.SubscriptionStart ?? now;
                    org.SubscriptionEnd = startCalculatingFrom.AddMonths(monthsToAdd);
                    
                    _unitOfWork.Repository<Organization>().Update(org);
                    
                    // CHÚ Ý: BẮT BUỘC PHẢI XÓA CACHE ĐỂ MIDDLEWARE MỞ KHÓA NGAY LẬP TỨC
                    _cache.Remove($"OrgSubscription_{orgId.Value}");
                }
            }

            var transaction = new BillingTransaction
            {
                Amount = finalPrice,
                PlanName = plan.Name,
                PlanId = plan.Id,
                MonthsToAdd = monthsToAdd,
                PaymentDate = DateTime.UtcNow,
                Status = transactionStatus,
                ReferenceCode = refCode,
                PromotionId = appliedPromotionId
            };

            await _unitOfWork.Repository<BillingTransaction>().AddAsync(transaction);
            await _unitOfWork.CommitAsync();

            return new SubscribeResponseDto
            {
                ReferenceCode = refCode,
                Amount = finalPrice,
                PlanName = plan.Name,
                BankAccount = finalPrice == 0 ? "FREE_TIER" : "123456789", 
                BankName = finalPrice == 0 ? "FREE_TIER" : "MBBank"
            };
        }

        public async Task<MySubscriptionDto> GetMySubscriptionAsync()
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(orgId.Value);
            if (org == null) throw new NotFoundException("Organization", orgId.Value);

            return new MySubscriptionDto
            {
                PlanName = org.SubscriptionStatus == "TRIAL" ? "Gói Dùng Thử" : org.SubscriptionStatus,
                SubscriptionStart = org.SubscriptionStart,
                SubscriptionEnd = org.SubscriptionEnd,
                SubscriptionStatus = org.SubscriptionStatus,
                MaxUsers = org.MaxUsers,
                CurrentUsers = org.CurrentUsers
            };
        }

        public async Task<IEnumerable<BillingTransactionDto>> GetMyTransactionsAsync()
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var trans = await _unitOfWork.Repository<BillingTransaction>()
                .FindAsync(t => t.OrganizationId == orgId.Value);

            return trans.OrderByDescending(t => t.CreatedAt).Select(t => new BillingTransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                PlanName = t.PlanName,
                MonthsToAdd = t.MonthsToAdd,
                PaymentDate = t.PaymentDate,
                Status = t.Status.ToString(),
                ReferenceCode = t.ReferenceCode
            }).ToList();
        }

        public async Task<string> GetTransactionStatusAsync(string referenceCode)
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var tx = (await _unitOfWork.Repository<BillingTransaction>()
                .FindAsync(t => t.ReferenceCode == referenceCode && t.OrganizationId == orgId.Value)).FirstOrDefault();

            if (tx == null) throw new NotFoundException("Giao dịch không tồn tại", referenceCode);

            return tx.Status.ToString();
        }
    }
}
