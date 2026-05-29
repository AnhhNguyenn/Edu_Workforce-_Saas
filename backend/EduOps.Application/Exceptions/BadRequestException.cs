using System;

namespace EduOps.Application.Exceptions
{
    public class BadRequestException : BaseCustomException
    {
        public BadRequestException(string message) : base(message, System.Net.HttpStatusCode.BadRequest) { }
    }
}
