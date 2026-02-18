package com.sensiplay.sensiplay;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private static final Logger logger = LoggerFactory.getLogger(MovieController.class);

    @Value("${tmdb.api.key:}")
    private String tmdbApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private String buildUrl(String endpoint) {
        if (tmdbApiKey == null || tmdbApiKey.isBlank()) {
            throw new IllegalStateException("TMDB API key is not configured");
        }
        StringBuilder sb = new StringBuilder("https://api.themoviedb.org/3");
        sb.append(endpoint);
        boolean hasQuestion = endpoint.contains("?");
        logger.debug("buildUrl: endpoint='{}' contains? {}", endpoint, hasQuestion);
        // if endpoint already has a '?', append with '&', otherwise start with '?'
        sb.append(hasQuestion ? "&" : "?");
        sb.append("api_key=").append(tmdbApiKey);
        sb.append("&language=pt-BR");
        return sb.toString();
    }

    @GetMapping("/popular")
    public ResponseEntity<String> getPopularMovies() {
        try {
            String url = buildUrl("/movie/popular");
            logger.info("Calling TMDB popular endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching popular movies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar populares: " + e.getMessage());
        }
    }

    @GetMapping("/action")
    public ResponseEntity<String> getActionMovies() {
        try {
            String url = buildUrl("/discover/movie?with_genres=28");
            logger.info("Calling TMDB action endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching action movies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar ação: " + e.getMessage());
        }
    }

    @GetMapping("/comedy")
    public ResponseEntity<String> getComedyMovies() {
        try {
            String url = buildUrl("/discover/movie?with_genres=35");
            logger.info("Calling TMDB comedy endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching comedy movies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar comédia: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<String> searchMovies(@RequestParam String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            // use multi search to get movies + tv
            String url = buildUrl("/search/multi?query=" + encoded + "&include_adult=false");
            logger.info("Calling TMDB multi-search endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error searching movies/tv", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar filmes/séries: " + e.getMessage());
        }
    }

    @GetMapping("/tv/popular")
    public ResponseEntity<String> getPopularTv() {
        try {
            String url = buildUrl("/tv/popular");
            logger.info("Calling TMDB tv popular endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching tv popular", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar séries populares: " + e.getMessage());
        }
    }

    @GetMapping("/tv/action")
    public ResponseEntity<String> getTvAction() {
        try {
            // Genre 10759 is Action & Adventure for TV
            String url = buildUrl("/discover/tv?with_genres=10759");
            logger.info("Calling TMDB tv action endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching tv action", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar séries de ação: " + e.getMessage());
        }
    }

    @GetMapping("/tv/comedy")
    public ResponseEntity<String> getTvComedy() {
        try {
            String url = buildUrl("/discover/tv?with_genres=35");
            logger.info("Calling TMDB tv comedy endpoint: {}", url);
            String jsonResponse = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(jsonResponse);
        } catch (IllegalStateException ise) {
            logger.warn("Configuration issue", ise);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Configuração inválida: " + ise.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching tv comedy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar séries de comédia: " + e.getMessage());
        }
    }
}