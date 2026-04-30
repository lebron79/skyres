package com.skyres.service;

import com.skyres.dto.request.ChangePasswordRequest;
import com.skyres.dto.request.UpdateUserRequest;
import com.skyres.dto.response.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserProfileResponse getById(Long id);
    UserProfileResponse getCurrentUser();
    UserProfileResponse updateUser(Long id, UpdateUserRequest dto);
    void deleteUser(Long id);
    void changePassword(Long id, ChangePasswordRequest request);
}
