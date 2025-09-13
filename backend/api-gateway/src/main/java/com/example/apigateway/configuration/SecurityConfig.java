package com.example.apigateway.configuration;

import com.example.apigateway.security.JwtAuthenticationEntryPoint;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                                                         ReactiveJwtDecoder jwtDecoder) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(auth -> auth
                        .pathMatchers(
                                ApiConfig.AUTH_SERVICE_URL + "/**",
                                ApiConfig.PREVIEW_SERVICE_URL + "/**",
                                ApiConfig.INVENTORY_SERVICE_URL + "/**",
                                ApiConfig.IMAGE_SERVICE_URL + "/**",
                                ApiConfig.USER_SERVICE_URL + "/**",
                                ApiConfig.RATING_SERVICE_URL + "/**",
                                ApiConfig.STRIPE_WEBHOOK_SERVICE_URL + "/**",
                                ApiConfig.NOTIFICATION_SERVICE_URL + "/**",
                                "/v3/api-docs/**",
                                "/api/webjars/**",
                                "/api-docs/**",
                                "/favicon.ico",
                                "/api/aggregated/**"
                        ).permitAll()
                        .pathMatchers("/notifications/**").permitAll()
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers(
                                ApiConfig.ORDER_SERVICE_URL + "/**",
                                ApiConfig.WALLET_SERVICE_URL + "/**",
                                ApiConfig.PAYMENT_SERVICE_URL + "/**"
                        ).authenticated()
                        .anyExchange().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtSpec -> jwtSpec.jwtDecoder(jwtDecoder)))
                .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder(@Value("${app.jwt-secret}") String secret) {
        return token -> {
            String rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder
                    .withSecretKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)))
                    .macAlgorithm(MacAlgorithm.HS384)
                    .build();
            return decoder.decode(rawToken);
        };
    }
}
