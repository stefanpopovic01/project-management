import logging
import time

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        ip_address = request.META.get('REMOTE_ADDR')
        method = request.method
        path = request.get_full_path()
        
        response = self.get_response(request)

        duration = time.time() - start_time
        status_code = response.status_code

        log_message = f"IP: {ip_address} | {method} {path} | Status: {status_code} | Took: {duration:.3f}s"

        if status_code >= 500:
            logger.error(log_message)
        elif status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)

        return response