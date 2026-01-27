package com.example.inventory_preview_service.configuration;

import com.example.inventory_preview_service.entity.ItemPreview;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class IndexConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MongoMappingContext mongoMappingContext;

    @PostConstruct
    public void initIndexes() {
        IndexResolver resolver = new MongoPersistentEntityIndexResolver(mongoMappingContext);
        IndexOperations ops = mongoTemplate.indexOps(ItemPreview.class);
        resolver.resolveIndexFor(ItemPreview.class)
                .forEach(ops::createIndex);
    }
}
