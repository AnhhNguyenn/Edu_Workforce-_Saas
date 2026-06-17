using System.Threading;
using System.Threading.Tasks;
using System.Data.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace EduOps.Infrastructure.Data.Interceptors
{
    public class QueryCountInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<QueryCountInterceptor> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const int MaxQueriesPerRequest = 30;

        public QueryCountInterceptor(ILogger<QueryCountInterceptor> logger, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public override InterceptionResult<DbDataReader> ReaderExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
        {
            CheckQueryCount(command.CommandText);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
        {
            CheckQueryCount(command.CommandText);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        private void CheckQueryCount(string sql)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            const string countKey = "EfCoreQueryCount";
            var currentCount = httpContext.Items.TryGetValue(countKey, out var val) ? (int)val! : 0;
            currentCount++;
            httpContext.Items[countKey] = currentCount;

            if (currentCount == MaxQueriesPerRequest + 1) // Chỉ log 1 lần khi vượt ngưỡng
            {
                _logger.LogError("N+1 QUERY ALERT: Request {Path} has executed {QueryCount} queries! This indicates a severe N+1 query bug. Last query: {Sql}", 
                    httpContext.Request.Path, currentCount, sql);
            }
        }
    }
}
