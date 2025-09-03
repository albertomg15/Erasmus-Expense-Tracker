package com.eet.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path   = request.getRequestURI();
        String authH  = request.getHeader("Authorization");
        boolean hasB  = authH != null && authH.startsWith("Bearer ");
        System.out.println("[JWT] path=" + path + " hasAuth=" + (authH != null) + " bearer=" + hasB);

        if (path.startsWith("/auth/")) { chain.doFilter(request, response); return; }
        if (!hasB) { System.out.println("[JWT] skip (no header)"); chain.doFilter(request, response); return; }

        String jwt = authH.substring(7);
        String email = null;
        try { email = jwtService.extractUsername(jwt); } catch (Exception e) { System.out.println("[JWT] extract err: " + e.getMessage()); }
        System.out.println("[JWT] email=" + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var userDetails = userDetailsService.loadUserByUsername(email);
            boolean ok = jwtService.isTokenValid(jwt, userDetails);
            System.out.println("[JWT] valid=" + ok);
            if (ok) {
                var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("[JWT] AUTH SET email=" + email);
            }
        }
        chain.doFilter(request, response);
    }


}