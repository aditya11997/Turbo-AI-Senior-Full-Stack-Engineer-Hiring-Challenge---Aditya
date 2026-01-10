import json
import time

from django.utils.deprecation import MiddlewareMixin


class RequestLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._start_time = time.time()

    def process_response(self, request, response):
        start_time = getattr(request, "_start_time", None)
        latency_ms = None
        if start_time is not None:
            latency_ms = round((time.time() - start_time) * 1000, 2)

        user_id = None
        if hasattr(request, "user") and getattr(request.user, "is_authenticated", False):
            user_id = request.user.id

        payload = {
            "method": request.method,
            "path": request.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms,
            "user_id": user_id,
        }
        print(json.dumps(payload))
        return response
