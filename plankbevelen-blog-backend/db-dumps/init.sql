-- 创建数据库
CREATE DATABASE IF NOT EXISTS `plankbevelen-blog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `plankbevelen-blog`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(50) NOT NULL COMMENT '用户昵称',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `avatar` TEXT DEFAULT NULL COMMENT '头像数据(base64)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 说说表
CREATE TABLE IF NOT EXISTS `talks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `content` text NOT NULL COMMENT '说说内容',
  `images` json DEFAULT NULL COMMENT '图片URL数组',
  `status` enum('published','draft') NOT NULL DEFAULT 'published' COMMENT '状态：published-已发布，draft-草稿',
  `like_count` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(11) NOT NULL DEFAULT 0 COMMENT '评论数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_talks_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='说说表';

-- 插入测试用户数据
INSERT INTO `users` (`nickname`, `email`, `password`, `avatar`, `created_at`) VALUES
('管理员', 'admin@example.com', '$2b$10$example.hash.for.testing', '/img/avatar.jpg', NOW()),
('测试用户', 'test@example.com', '$2b$10$example.hash.for.testing', '/img/avatar.jpg', NOW());

-- 插入测试说说数据
INSERT INTO `talks` (`user_id`, `content`, `images`, `status`, `like_count`, `comment_count`, `created_at`) VALUES
(1, '今天天气真不错，适合出去走走！', '["https://example.com/image1.jpg"]', 'published', 12, 3, '2024-01-15 14:30:00'),
(1, '正在学习Vue3和Nuxt3，感觉很有趣！', NULL, 'published', 8, 2, '2024-01-14 10:15:00'),
(1, '这是一条草稿说说', NULL, 'draft', 0, 0, '2024-01-13 16:45:00');