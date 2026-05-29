using System;

namespace EduOps.Application.Exceptions
{
    public class ForbiddenException : BaseCustomException
    {
        public ForbiddenException(string message) : base(message, System.Net.HttpStatusCode.Forbidden) { }
    }
}
