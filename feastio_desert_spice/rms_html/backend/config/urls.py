from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.conf.urls.static import static
from django.views.static import serve
from django.conf import settings
import os

def frontend(request):
    return render(request, 'index.html')

def frontpage(request):
    filepath = os.path.join(settings.BASE_DIR, 'static', 'frontpage.html')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    from django.http import HttpResponse
    return HttpResponse(content, content_type='text/html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('app/', frontend),       # staff portal / login page
    path('', frontpage),          # public front page
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
