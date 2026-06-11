import logging
import time

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Logic BEFORE the view is called
        start_time = time.time()
        
        # Capture useful request details
        ip_address = request.META.get('REMOTE_ADDR')
        method = request.method
        path = request.get_full_path()
        
        # 2. Let Django process the request and get the view response
        response = self.get_response(request)

        # 3. Logic AFTER the view finishes execution
        duration = time.time() - start_time
        status_code = response.status_code

        # Format a beautifully clear log message
        log_message = f"IP: {ip_address} | {method} {path} | Status: {status_code} | Took: {duration:.3f}s"

        # Log automatically based on the result
        if status_code >= 500:
            logger.error(log_message)
        elif status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)

        return response