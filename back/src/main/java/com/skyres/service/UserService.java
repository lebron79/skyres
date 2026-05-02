package com.skyres.service;

import com.skyres.dto.request.AdminUserCreateRequest;
import com.skyres.dto.request.AdminUserUpdateRequest;
import com.skyres.dto.request.ChangePasswordRequest;
import com.skyres.dto.request.UpdateUserRequest;
import com.skyres.dto.response.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserProfileResponse getById(Long id);
    UserProfileResponse getCurrentUser();
    UserProfileResponse updateUser(Long id, UpdateUserRequest dto);
    void deleteUser(Long id);
    void changePassword(Long id, ChangePasswordRequest request);
    List<UserProfileResponse> getAllUsers();
    UserProfileResponse createUserByAdmin(AdminUserCreateRequest dto);
    UserProfileResponse updateUserByAdmin(Long id, AdminUserUpdateRequest dto);
}
