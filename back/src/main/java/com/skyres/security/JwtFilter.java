package com.skyres.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = extractBearerToken(header);
        if (token == null) {
            chain.doFilter(request, response);
            return;
        }
        try {
            String username = jwtUtil.extractUsername(token);
            if (username != null) {
                String email = username.trim();
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (jwtUtil.isValid(token, userDetails)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ignored) {
            // Malformed / bad signature — leave anonymous; entry point returns 401.
        }
        chain.doFilter(request, response);
    }

    /** Accepts "Bearer <jwt>" with any case on "Bearer" and trims whitespace. */
    private static String extractBearerToken(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        String h = header.trim();
        if (h.length() < 8 || !h.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String t = h.substring(7).trim();
        return t.isEmpty() ? null : t;
    }
}
