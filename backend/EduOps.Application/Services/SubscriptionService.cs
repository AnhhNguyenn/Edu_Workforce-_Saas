using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing.Requests;
using EduOps.Application.DTOs.Billing.Responses;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;

using EduOps.Domain.Interfaces;
using EduOps.Application.DTOs.Subscription;
using Microsoft.Extensions.Caching.Memory;

namespace EduOps.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICustomLogger _logger;
        private readonly IMemoryCache _cache;
        private readonly ISystemSettingService _settingService;
        private readonly IRealtimeNotificationService _realtimeNotification;

        private const string PLANS_CACHE_KEY = "ALL_SUBSCRIPTION_PLANS";

        public SubscriptionService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, ICustomLogger logger, IMemoryCache cache, ISystemSettingService settingService, IRealtimeNotificationService realtimeNotification)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _logger = logger;
            _cache = cache;
            _settingService = settingService;
            _realtimeNotification = realtimeNotification;
        }

        public async Task<List<SubscriptionPlanResponseDto>> GetPlansAsync()
        {
            if (_cache.TryGetValue(PLANS_CACHE_KEY, out List<SubscriptionPlanResponseDto>? cachedPlans))
            {
                if (cachedPlans != null) return cachedPlans;
            }

            var plans = await _unitOfWork.Repository<SubscriptionPlan>()
                .FindAsync(
                    p => p.Status != null && p.Status.Code == "ACTIVE" && p.DeletedAt == null,
                    includeProperties: "Status"
                );

            foreach(var p in plans)
            {
                p.SubscriptionPlanDetail = await _unitOfWork.Repository<SubscriptionPlanDetail>().FirstOrDefaultAsync(d => d.SubscriptionPlanId == p.Id);
            }

            cachedPlans = plans.Select(p => {
                return new SubscriptionPlanResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.SubscriptionPlanDetail?.Description ?? string.Empty,
                    MaxUsers = p.MaxUsers,
                    PricePerMonth = p.PricePerMonth,
                    PricePerYear = p.PricePerYear,
                    Status = p.Status?.Code
                };
            }).ToList();

            _cache.Set(PLANS_CACHE_KEY, cachedPlans, TimeSpan.FromHours(24));

            return cachedPlans;
        }

        public async Task<SubscriptionPlanResponseDto> CreatePlanAsync(CreateSubscriptionPlanRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được tạo gói cước.");

            var plan = new SubscriptionPlan
            {
                Name = request.Name,
                SubscriptionPlanDetail = new SubscriptionPlanDetail { Description = request.Description },
                MaxUsers = request.MaxUsers,
                PricePerMonth = request.PricePerMonth,
                PricePerYear = request.PricePerYear,
                StatusId = (await _unitOfWork.Repository<AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE"))?.Id
            };

            await _unitOfWork.Repository<SubscriptionPlan>().AddAsync(plan);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");

            return new SubscriptionPlanResponseDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.SubscriptionPlanDetail?.Description ?? string.Empty,
                MaxUsers = plan.MaxUsers,
                PricePerMonth = plan.PricePerMonth,
                PricePerYear = plan.PricePerYear,
                Status = "ACTIVE"
            };
        }

        public async Task<List<PromotionResponseDto>> GetPromotionsAsync()
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem danh sách khuyến mãi.");

            var promos = await _unitOfWork.Repository<Promotion>().FindAsync(
                p => p.Status != null && p.Status.Code == "ACTIVE",
                includeProperties: "Status,Type,SubscriptionPlan"
            );

            return promos.Select(p => new PromotionResponseDto
            {
                Id = p.Id,
                Code = p.Code,
                Type = p.Type?.Code,
                DiscountPercentage = p.DiscountPercentage,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                MaxUses = p.MaxUses,
                CurrentUses = p.CurrentUses,
                Status = p.Status?.Code,
                SubscriptionPlanId = p.SubscriptionPlanId,
                SubscriptionPlanName = p.SubscriptionPlan?.Name
            }).ToList();
        }

        public async Task<PromotionResponseDto> CreatePromotionAsync(CreatePromotionRequestDto request)
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
                DiscountPercentage = request.DiscountPercentage,
                StartDate = request.StartDate.ToUniversalTime(),
                EndDate = request.EndDate.ToUniversalTime(),
                MaxUses = request.MaxUses,
                CurrentUses = 0,
                SubscriptionPlanId = request.SubscriptionPlanId,
                TypeId = (await _unitOfWork.Repository<EduOps.Domain.Entities.PromotionType>().FirstOrDefaultAsync(t => t.Code == request.Type))?.Id,
                StatusId = (await _unitOfWork.Repository<EduOps.Domain.Entities.AccountStatus>().FirstOrDefaultAsync(s => s.Code == "ACTIVE"))?.Id
            };

            await _unitOfWork.Repository<Promotion>().AddAsync(promo);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");

            return new PromotionResponseDto
            {
                Id = promo.Id,
                Code = promo.Code,
                Type = request.Type,
                DiscountPercentage = promo.DiscountPercentage,
                StartDate = promo.StartDate,
                EndDate = promo.EndDate,
                MaxUses = promo.MaxUses,
                CurrentUses = promo.CurrentUses,
                Status = "ACTIVE",
                SubscriptionPlanId = promo.SubscriptionPlanId,
                SubscriptionPlanName = promo.SubscriptionPlanId.HasValue ? (await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(promo.SubscriptionPlanId.Value))?.Name : null
            };
        }

        public async Task UpdatePlanAsync(Guid id, UpdateSubscriptionPlanRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được sửa gói cước.");

            var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(id);
            if (plan == null || plan.DeletedAt != null) throw new NotFoundException("Gói cước", id);

            plan.Name = request.Name;
            
            plan.SubscriptionPlanDetail = await _unitOfWork.Repository<SubscriptionPlanDetail>().FirstOrDefaultAsync(d => d.SubscriptionPlanId == plan.Id);
            if (plan.SubscriptionPlanDetail == null)
            {
                plan.SubscriptionPlanDetail = new SubscriptionPlanDetail { SubscriptionPlanId = plan.Id };
                await _unitOfWork.Repository<SubscriptionPlanDetail>().AddAsync(plan.SubscriptionPlanDetail);
            }
            plan.SubscriptionPlanDetail.Description = request.Description;
            _unitOfWork.Repository<SubscriptionPlanDetail>().Update(plan.SubscriptionPlanDetail);

            plan.MaxUsers = request.MaxUsers;
            plan.PricePerMonth = request.PricePerMonth;
            plan.PricePerYear = request.PricePerYear;

            _unitOfWork.Repository<SubscriptionPlan>().Update(plan);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");
        }

        public async Task DeletePlanAsync(Guid id)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xóa gói cước.");

            var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(id);
            if (plan == null || plan.DeletedAt != null) throw new NotFoundException("Gói cước", id);

            // Kiểm tra xem có Organization nào đang dùng không
            var inUse = await _unitOfWork.Repository<Organization>().AnyAsync(o => o.CurrentPlanId == id && o.DeletedAt == null);
            if (inUse)
            {
                throw new BadRequestException("Không thể xóa Gói cước này vì đang có Trung tâm sử dụng. Vui lòng chuyển Trung tâm sang gói khác trước khi xóa.");
            }

            var inactiveStatus = await _unitOfWork.Repository<AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE");
            plan.StatusId = inactiveStatus?.Id;
            plan.DeletedAt = DateTime.UtcNow;

            _unitOfWork.Repository<SubscriptionPlan>().Update(plan);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");
        }

        public async Task UpdatePromotionAsync(Guid id, UpdatePromotionRequestDto request)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được sửa khuyến mãi.");

            var promo = await _unitOfWork.Repository<Promotion>().GetByIdAsync(id);
            if (promo == null || promo.DeletedAt != null) throw new NotFoundException("Khuyến mãi", id);

            if (!string.IsNullOrEmpty(request.Code) && request.Code != promo.Code)
            {
                var exists = await _unitOfWork.Repository<Promotion>().AnyAsync(p => p.Code == request.Code);
                if (exists) throw new BadRequestException($"Mã khuyến mãi '{request.Code}' đã tồn tại.");
            }

            promo.Code = request.Code;
            promo.SubscriptionPlanId = request.SubscriptionPlanId;
            promo.TypeId = (await _unitOfWork.Repository<EduOps.Domain.Entities.PromotionType>().FirstOrDefaultAsync(t => t.Code == request.Type))?.Id;
            promo.DiscountPercentage = request.DiscountPercentage;
            promo.StartDate = request.StartDate.ToUniversalTime();
            promo.EndDate = request.EndDate.ToUniversalTime();
            promo.MaxUses = request.MaxUses;

            _unitOfWork.Repository<Promotion>().Update(promo);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");
        }

        public async Task DeletePromotionAsync(Guid id)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xóa khuyến mãi.");

            var promo = await _unitOfWork.Repository<Promotion>().GetByIdAsync(id);
            if (promo == null || promo.DeletedAt != null) throw new NotFoundException("Khuyến mãi", id);

            promo.StatusId = (await _unitOfWork.Repository<AccountStatus>().FirstOrDefaultAsync(s => s.Code == "INACTIVE"))?.Id;
            promo.DeletedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Promotion>().Update(promo);
            await _unitOfWork.CommitAsync();

            _cache.Remove(PLANS_CACHE_KEY);
            await _realtimeNotification.SendToAllAsync("InvalidatePlans");
        }

        public async Task<List<PromotionUsageResponseDto>> GetPromotionUsageHistoryAsync(Guid promotionId)
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem lịch sử khuyến mãi.");

            var promo = await _unitOfWork.Repository<Promotion>().GetByIdAsync(promotionId);
            if (promo == null) throw new NotFoundException("Khuyến mãi", promotionId);

            var transactions = await _unitOfWork.Repository<BillingTransaction>().FindAsync(
                t => t.PromotionId == promotionId,
                includeProperties: "Status"
            );

            var orgIds = transactions.Where(t => t.OrganizationId != null).Select(t => t.OrganizationId!.Value).Distinct().ToList();
            var organizations = await _unitOfWork.Repository<Organization>().FindAsync(o => orgIds.Contains(o.Id));
            var orgDict = organizations.ToDictionary(o => o.Id, o => o.Name);

            return transactions.Select(t => new PromotionUsageResponseDto
            {
                TransactionId = t.Id,
                OrganizationName = t.OrganizationId.HasValue && orgDict.ContainsKey(t.OrganizationId.Value) ? orgDict[t.OrganizationId.Value] : "N/A",
                PlanName = t.PlanName ?? string.Empty,
                AmountPaid = t.Amount,
                PaymentDate = t.PaymentDate,
                ReferenceCode = t.ReferenceCode ?? string.Empty,
                Status = t.Status?.Code ?? "UNKNOWN"
            }).OrderByDescending(x => x.PaymentDate).ToList();
        }

        public async Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request)
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null || _currentUserService.Role != "CENTER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ Quản trị viên Trung tâm mới được mua gói cước.");

            var plan = await _unitOfWork.Repository<SubscriptionPlan>().FirstOrDefaultAsync(p => p.Id == request.PlanId, includeProperties: "Status");
            if (plan == null || plan.Status?.Code != "ACTIVE")
                throw new BadRequestException("Gói cước không tồn tại hoặc đã ngừng cung cấp.");

            var transactionStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.BillingStatus>().FirstOrDefaultAsync(s => s.Code == "PENDING");

            // ==========================================
            // LOGIC "RESUMABLE TRANSACTION" (CHUẨN ENTERPRISE)
            // Tái sử dụng giao dịch PENDING nếu chưa quá 10 phút
            // ==========================================
            var tenMinsAgo = DateTime.UtcNow.AddMinutes(-10);
            if (transactionStatus != null)
            {
                var existingTx = await _unitOfWork.Repository<BillingTransaction>().FirstOrDefaultAsync(
                    t => t.OrganizationId == orgId.Value && 
                         t.StatusId == transactionStatus.Id && 
                         t.PlanId == request.PlanId && 
                         t.CreatedAt >= tenMinsAgo
                );

                if (existingTx != null)
                {
                    int remainingSeconds = 600 - (int)(DateTime.UtcNow - existingTx.CreatedAt).TotalSeconds;
                    if (remainingSeconds < 0) remainingSeconds = 0;

                    var bAccountSetting = await _settingService.GetSettingValueAsync("PAYMENT_BANK_ACCOUNT");
                    var bNameSetting = await _settingService.GetSettingValueAsync("PAYMENT_BANK_NAME");
                    var bAccount = existingTx.Amount == 0 ? "FREE_TIER" : (bAccountSetting ?? "96247UH35V");
                    var bName = existingTx.Amount == 0 ? "FREE_TIER" : (bNameSetting ?? "BIDV");
                    
                    var safeRef = System.Web.HttpUtility.UrlEncode(existingTx.ReferenceCode);
                    var qrUrl = existingTx.Amount == 0
                        ? string.Empty
                        : $"https://qr.sepay.vn/img?acc={bAccount}&bank={bName}&amount={(int)existingTx.Amount}&des={safeRef}&template=compact";

                    return new SubscribeResponseDto
                    {
                        ReferenceCode = existingTx.ReferenceCode ?? "",
                        Amount = existingTx.Amount,
                        PlanName = existingTx.PlanName ?? "",
                        BankAccount = bAccount,
                        BankName = bName,
                        QrCodeUrl = qrUrl,
                        RemainingSeconds = remainingSeconds
                    };
                }
            }

            decimal basePrice = request.BillingCycle == "YEARLY" ? plan.PricePerYear : plan.PricePerMonth;
            int monthsToAdd = request.BillingCycle == "YEARLY" ? 12 : 1;
            decimal finalPrice = basePrice;

            var now = DateTime.UtcNow;
            Guid? appliedPromotionId = null;

            // Chỉ kiểm tra Promo Code do người dùng nhập
            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var inputCode = request.PromoCode.Trim().ToUpper();
                var promo = await _unitOfWork.Repository<Promotion>().FirstOrDefaultAsync(
                    p => p.Code != null && p.Code.ToUpper() == inputCode && p.Status != null && p.Status.Code == "ACTIVE"
                );

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

            transactionStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.BillingStatus>().FirstOrDefaultAsync(s => s.Code == "PENDING");

            // XỬ LÝ DEADLOCK 0 ĐỒNG (FREE TIER)
            if (finalPrice == 0)
            {
                transactionStatus = await _unitOfWork.Repository<EduOps.Domain.Entities.BillingStatus>().FirstOrDefaultAsync(s => s.Code == "SUCCESS");

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
                    org.SubscriptionStatus = "PAID";
                    org.CurrentPlanId = plan.Id;

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
                StatusId = transactionStatus?.Id,
                ReferenceCode = refCode,
                PromotionId = appliedPromotionId
            };

            await _unitOfWork.Repository<BillingTransaction>().AddAsync(transaction);
            await _unitOfWork.CommitAsync();

            var bankAccountSetting = await _settingService.GetSettingValueAsync("PAYMENT_BANK_ACCOUNT");
            var bankNameSetting = await _settingService.GetSettingValueAsync("PAYMENT_BANK_NAME");

            var bankAccount = finalPrice == 0 ? "FREE_TIER" : (bankAccountSetting ?? "96247UH35V");
            var bankName = finalPrice == 0 ? "FREE_TIER" : (bankNameSetting ?? "BIDV");

            // Generate VietQR / SePay QR link (Locks Amount and Transfer Content)
            // Template=compact for cleaner UI, HttpUtility for safe URL encoding
            var safeRefCode = System.Web.HttpUtility.UrlEncode(refCode);
            var qrCodeUrl = finalPrice == 0
                ? string.Empty
                : $"https://qr.sepay.vn/img?acc={bankAccount}&bank={bankName}&amount={(int)finalPrice}&des={safeRefCode}&template=compact";

            return new SubscribeResponseDto
            {
                ReferenceCode = refCode,
                Amount = finalPrice,
                PlanName = plan.Name,
                BankAccount = bankAccount,
                BankName = bankName,
                QrCodeUrl = qrCodeUrl,
                RemainingSeconds = 600
            };
        }

        public async Task<PreviewSubscribeResponseDto> PreviewSubscribeAsync(SubscribeRequestDto request)
        {
            var plan = await _unitOfWork.Repository<SubscriptionPlan>().FirstOrDefaultAsync(p => p.Id == request.PlanId, includeProperties: "Status");
            if (plan == null || plan.Status?.Code != "ACTIVE")
                throw new BadRequestException("Gói cước không tồn tại hoặc đã ngừng cung cấp.");

            decimal basePrice = request.BillingCycle == "YEARLY" ? plan.PricePerYear : plan.PricePerMonth;
            decimal finalPrice = basePrice;
            decimal discountAmount = 0;
            string? appliedPromoCode = null;

            var now = DateTime.UtcNow;

            // Chỉ kiểm tra Promo Code do người dùng nhập
            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var inputCode = request.PromoCode.Trim().ToUpper();
                var promo = await _unitOfWork.Repository<Promotion>().FirstOrDefaultAsync(
                    p => p.Code != null && p.Code.ToUpper() == inputCode && p.Status != null && p.Status.Code == "ACTIVE"
                );

                if (promo == null) throw new BadRequestException("Mã khuyến mãi không hợp lệ.");
                if (now < promo.StartDate || now > promo.EndDate) throw new BadRequestException("Mã khuyến mãi không trong thời gian sử dụng.");

                if (promo.MaxUses.HasValue)
                {
                    if (promo.CurrentUses >= promo.MaxUses.Value)
                        throw new BadRequestException("Mã khuyến mãi đã hết lượt sử dụng.");
                }

                discountAmount = (basePrice * promo.DiscountPercentage / 100);
                finalPrice = basePrice - discountAmount;
                appliedPromoCode = promo.Code;
            }

            return new PreviewSubscribeResponseDto
            {
                OriginalPrice = basePrice,
                DiscountAmount = discountAmount,
                FinalPrice = finalPrice,
                AppliedPromotionCode = appliedPromoCode,
                PlanName = plan.Name
            };
        }

        public async Task<MySubscriptionDto> GetMySubscriptionAsync()
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(orgId.Value);
            if (org == null) throw new NotFoundException("Organization", orgId.Value);

            int maxUsers = 0;
            string planName = org.SubscriptionStatus;

            if (org.SubscriptionStatus == "UNPAID" || org.SubscriptionStatus == "EXPIRED")
            {
                maxUsers = 0;
                planName = org.SubscriptionStatus == "UNPAID" ? "Chưa đăng ký gói" : "Gói đã hết hạn";
            }
            else if (org.SubscriptionStatus == "TRIAL")
            {
                planName = "Gói Dùng Thử";
                var trialMaxUserSetting = await _unitOfWork.Repository<SystemSetting>().FirstOrDefaultAsync(s => s.SettingKey == "DEFAULT_TRIAL_MAX_USERS");
                int defaultTrialMaxUsers = 5;
                if (trialMaxUserSetting != null && int.TryParse(trialMaxUserSetting.SettingValue, out int v)) defaultTrialMaxUsers = v;

                maxUsers = org.CustomTrialMaxUsers ?? defaultTrialMaxUsers;
            }
            else if (org.CurrentPlanId.HasValue)
            {
                var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(org.CurrentPlanId.Value);
                if (plan != null)
                {
                    maxUsers = plan.MaxUsers;
                    planName = plan.Name;
                }
            }

            int currentUsers = await _unitOfWork.Repository<User>().CountAsync(u =>
                u.OrganizationId == orgId.Value &&
                u.DeletedAt == null &&
                u.Role != null && (u.Role.Code == "TEACHER" || u.Role.Code == "ASSISTANT"));

            return new MySubscriptionDto
            {
                PlanId = org.CurrentPlanId,
                PlanName = planName,
                SubscriptionStart = org.SubscriptionStart,
                SubscriptionEnd = org.SubscriptionEnd,
                SubscriptionStatus = org.SubscriptionStatus,
                MaxUsers = maxUsers,
                CurrentUsers = currentUsers
            };
        }

        public async Task<IEnumerable<BillingTransactionDto>> GetMyTransactionsAsync()
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var trans = await _unitOfWork.Repository<BillingTransaction>().FindAsync(t => t.OrganizationId == orgId.Value, includeProperties: "Status");

            var orgs = await _unitOfWork.Repository<Organization>().GetAllAsync();
            var orgDict = orgs.ToDictionary(o => o.Id, o => o.Name);

            var plans = await _unitOfWork.Repository<SubscriptionPlan>().GetAllAsync();
            var planDict = plans.ToDictionary(p => p.Id);

            var promos = await _unitOfWork.Repository<Promotion>().GetAllAsync();
            var promoDict = promos.ToDictionary(p => p.Id, p => p.Code);

            return trans.OrderByDescending(t => t.CreatedAt).Select(t => new BillingTransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                PlanName = t.PlanName,
                MonthsToAdd = t.MonthsToAdd,
                PaymentDate = t.PaymentDate,
                Status = t.Status?.Code ?? "",
                ReferenceCode = t.ReferenceCode,
                OrganizationName = t.OrganizationId.HasValue && orgDict.ContainsKey(t.OrganizationId.Value) ? orgDict[t.OrganizationId.Value] : "N/A",
                PromotionCode = t.PromotionId.HasValue && promoDict.ContainsKey(t.PromotionId.Value) ? promoDict[t.PromotionId.Value] : "",
                OriginalAmount = planDict.TryGetValue(t.PlanId, out var p) ? (t.MonthsToAdd >= 12 ? p.PricePerYear : p.PricePerMonth) : t.Amount
            }).ToList();
        }

        public async Task<IEnumerable<BillingTransactionDto>> GetAllTransactionsAsync()
        {
            if (_currentUserService.Role != "SUPER_ADMIN")
                throw new UnauthorizedAccessException("Chỉ SUPER_ADMIN mới được xem tất cả giao dịch.");

            var trans = await _unitOfWork.Repository<BillingTransaction>().FindAsync(t => true, includeProperties: "Status");

            var orgs = await _unitOfWork.Repository<Organization>().GetAllAsync();
            var orgDict = orgs.ToDictionary(o => o.Id, o => o.Name);

            var plans = await _unitOfWork.Repository<SubscriptionPlan>().GetAllAsync();
            var planDict = plans.ToDictionary(p => p.Id);

            var promos = await _unitOfWork.Repository<Promotion>().GetAllAsync();
            var promoDict = promos.ToDictionary(p => p.Id, p => p.Code);

            return trans.OrderByDescending(t => t.CreatedAt).Select(t => new BillingTransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                PlanName = t.PlanName,
                MonthsToAdd = t.MonthsToAdd,
                PaymentDate = t.PaymentDate,
                Status = t.Status?.Code ?? "",
                ReferenceCode = t.ReferenceCode,
                OrganizationName = t.OrganizationId.HasValue && orgDict.ContainsKey(t.OrganizationId.Value) ? orgDict[t.OrganizationId.Value] : "N/A",
                PromotionCode = t.PromotionId.HasValue && promoDict.ContainsKey(t.PromotionId.Value) ? promoDict[t.PromotionId.Value] : "",
                OriginalAmount = planDict.TryGetValue(t.PlanId, out var p) ? (t.MonthsToAdd >= 12 ? p.PricePerYear : p.PricePerMonth) : t.Amount
            }).ToList();
        }

        public async Task<string> GetTransactionStatusAsync(string referenceCode)
        {
            var orgId = _currentUserService.OrganizationId;
            if (orgId == null) throw new UnauthorizedAccessException();

            var tx = await _unitOfWork.Repository<BillingTransaction>()
                .FirstOrDefaultAsync(t => t.ReferenceCode == referenceCode && t.OrganizationId == orgId.Value);

            if (tx == null) throw new NotFoundException("Giao dịch không tồn tại", referenceCode);

            return tx.Status?.Code ?? "";
        }
    }
}