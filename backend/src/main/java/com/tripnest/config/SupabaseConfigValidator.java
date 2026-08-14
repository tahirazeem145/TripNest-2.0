package com.tripnest.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseConfigValidator.class);

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:}")
    private String supabaseAnonKey;

    @PostConstruct
    public void validateConfig() {
        boolean urlMissing = supabaseUrl == null || supabaseUrl.trim().isEmpty() || supabaseUrl.contains("placeholder");
        boolean keyMissing = supabaseAnonKey == null || supabaseAnonKey.trim().isEmpty() || supabaseAnonKey.contains("placeholder");

        if (urlMissing && keyMissing) {
            logger.warn("==========================================================================");
            logger.warn("WARNING: Both SUPABASE_URL and SUPABASE_ANON_KEY are missing or set to defaults.");
            logger.warn("Backend starting in limited mode. Authentication requests will fail.");
            logger.warn("Please set environment variables SUPABASE_URL and SUPABASE_ANON_KEY.");
            logger.warn("==========================================================================");
        } else if (urlMissing) {
            logger.warn("WARNING: SUPABASE_URL is not configured.");
        } else if (keyMissing) {
            logger.warn("WARNING: SUPABASE_ANON_KEY is not configured.");
        } else {
            logger.info("==========================================================================");
            logger.info("SUCCESS: Supabase configuration detected successfully.");
            logger.info("SUPABASE_URL is configured: {}", supabaseUrl);
            logger.info("SUPABASE_ANON_KEY is configured: [PROTECTED - PRESENT]");
            logger.info("==========================================================================");
        }
    }

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.trim().isEmpty() && !supabaseUrl.contains("placeholder")
                && supabaseAnonKey != null && !supabaseAnonKey.trim().isEmpty() && !supabaseAnonKey.contains("placeholder");
    }
}
