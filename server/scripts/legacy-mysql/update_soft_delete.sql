-- Add deleted_at column for soft delete
ALTER TABLE `articles` ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`;
ALTER TABLE `articles` ADD INDEX `idx_article_deleted_at` (`deleted_at`);
