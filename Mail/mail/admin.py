from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Email, User


@admin.register(User)
class MailUserAdmin(UserAdmin):
    list_display = ("email", "username", "is_staff", "is_active")
    search_fields = ("email", "username")
    ordering = ("email",)


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ("subject", "sender", "user", "read", "archived", "timestamp")
    list_filter = ("read", "archived", "timestamp")
    search_fields = ("subject", "body", "sender__email", "user__email")
