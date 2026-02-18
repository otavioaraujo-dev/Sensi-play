package com.sensiplay.sensiplay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Development Mode: Frontend (Live Server 5500) + Backend (8080) separados
 * CORS configurado para permitir requests do frontend
 */
@SpringBootApplication
public class DemoApplication implements WebMvcConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	/**
	 * CORS Configuration para permitir Frontend (porta 5500) chamar Backend (porta 8080)
	 * Métodos:  GET (fetch), POST, PUT, DELETE
	 * Credentials: Não obrigatório para este caso, mas added para flexibilidade
	 */
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				// Durante desenvolvimento permitimos origins dinâmicas para compatibilidade com browsers (Safari)
				.allowedOriginPatterns("*")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true)
				.maxAge(3600);  // 1 hora
	}

}
