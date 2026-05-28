using System;
using System.Net;

namespace EduOps.Application.Exceptions
{
    public abstract class BaseCustomException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        protected BaseCustomException(string message, HttpStatusCode statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
